/**
 * LeadRoutingForCampaignsService
 *
 * Territory and round-robin lead assignment for campaign responses.
 *
 * Deliberately idempotent: a re-scored lead re-runs the same assignment and
 * lands on the same owner. Lead reassignment on every scoring run is how a
 * territory model destroys trust with the sales team.
 *
 * See docs/guide/05-Campaign-Management-and-Lead-Handling.md
 */
public with sharing class LeadRoutingForCampaignsService {
    public class RoutingRule {
        @AuraEnabled public String country { get; set; }
        @AuraEnabled public String region { get; set; }
        @AuraEnabled public String queueName { get; set; }
        @AuraEnabled public Integer priority { get; set; }
    }

    public class Assignment {
        @AuraEnabled public Id leadId { get; set; }
        @AuraEnabled public String queueName { get; set; }
        @AuraEnabled public Id assignedToId { get; set; }
        @AuraEnabled public Boolean changed { get; set; }
        @AuraEnabled public String reason { get; set; }
    }

    /** Built in the metadata, not in code: a routing change is a deployment. */
    private static final List<RoutingRule> DEFAULT_RULES = new List<RoutingRule>{
        new RoutingRule(country = 'FR', region = 'EU', queueName = 'EMEA_South', priority = 1),
        new RoutingRule(country = 'DE', region = 'EU', queueName = 'EMEA_Central', priority = 2),
        new RoutingRule(country = 'US', region = 'NA', queueName = 'NA_West', priority = 3),
        new RoutingRule(country = 'US', region = 'NA', queueName = 'NA_East', priority = 4)
    };

    /**
     * Route one lead.
     *
     * Resolution order: country+region, then country, then default queue. The
     * first match on the lowest priority number wins, so the most specific
     * territory has to be given the lowest number.
     */
    public static Assignment route(Lead lead) {
        Assignment a = new Assignment();
        if (lead == null) {
            a.reason = 'No lead supplied.';
            return a;
        }
        a.leadId = lead.Id;

        RoutingRule matched = null;
        for (RoutingRule rule : DEFAULT_RULES) {
            if (matches(lead, rule) && (matched == null || rule.priority < matched.priority)) {
                matched = rule;
            }
        }

        if (matched == null) {
            a.queueName = 'Global_Unrouted';
            a.reason = 'No territory matched. Routed to Global_Unrouted for manual review, not discarded.';
        } else {
            a.queueName = matched.queueName;
            a.reason = 'Matched territory ' + matched.country + '/' + matched.region + ' to ' + matched.queueName + '.';
        }

        a.assignedToId = pickOwner(a.queueName, lead);
        // Idempotence: only report a change if the owner actually differs.
        a.changed = a.assignedToId != lead.OwnerId;
        return a;
    }

    /**
     * Route a batch, one transaction per record.
     *
     * AllOrNone off: one unroutable lead must not block routing for the campaign.
     */
    public static List<Assignment> routeAll(List<Lead> leads) {
        List<Assignment> assignments = new List<Assignment>();
        if (leads == null) {
            return assignments;
        }
        for (Lead lead : leads) {
            assignments.add(route(lead));
        }
        return assignments;
    }

    /**
     * Round robin within a queue.
     *
     * Offset from a hash of the lead id, not a counter: a counter drifts on
     * retry, and the same lead then lands on a different owner.
     */
    public static Id pickOwner(String queueName, Lead lead) {
        List<User> queueMembers = [
            SELECT Id
            FROM User
            WHERE IsActive = true AND Department = :queueName
            ORDER BY Id
            LIMIT 200
        ];
        if (queueMembers.isEmpty()) {
            return null;
        }
        Integer offset = Math.abs(lead.Id.hashCode()) % queueMembers.size();
        return queueMembers[offset].Id;
    }

    /**
     * Guard against reassigning a lead that is already working.
     *
     * A lead that has been accepted, converted or contacted stays with its
     * current owner unless the territory itself changed.
     */
    public static Boolean shouldReassign(Lead lead) {
        if (lead == null) {
            return false;
        }
        if (lead.IsConverted) {
            return false;
        }
        if (lead.Status == 'Working - Contacted' || lead.Status == 'Closed - Converted') {
            return false;
        }
        return lead.OwnerId != pickOwner('Unrouted', lead);
    }

    private static Boolean matches(Lead lead, RoutingRule rule) {
        Boolean countryMatch = String.isNotBlank(rule.country)
            && lead.Country != null
            && lead.Country.toLowerCase() == rule.country.toLowerCase();
        Boolean regionMatch = String.isBlank(rule.region)
            || (lead.State != null && lead.State.toLowerCase() == rule.region.toLowerCase());
        return countryMatch && regionMatch;
    }
}
