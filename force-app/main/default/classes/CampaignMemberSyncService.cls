/**
 * CampaignMemberSyncService
 *
 * Two-way sync between Campaign Member and the Marketing Cloud engagement
 * layer, with the direction rules that stop the two systems fighting.
 *
 * The loop that this service exists to prevent:
 *   CRM updates the member status, the sync updates the engagement layer, the
 *   engagement layer writes status back, and the record updates on a timer
 *   forever. The fix is a direction of truth per field, not a longer interval.
 *
 * See docs/guide/05-Campaign-Management-and-Lead-Handling.md
 */
public with sharing class CampaignMemberSyncService {
    /** Fields the engagement layer owns. A CRM change to these is not pushed. */
    private static final Set<String> ENGAGEMENT_OWNED = new Set<String>{
        'Marketing_Cloud_Status__c', 'Engagement_Score__c', 'Last_Engaged_At__c'
    };

    public class SyncResult {
        @AuraEnabled public Integer membersRead { get; set; }
        @AuraEnabled public Integer pushedToEngagement { get; set; }
        @AuraEnabled public Integer pulledFromEngagement { get; set; }
        @AuraEnabled public Integer skipped { get; set; }
        @AuraEnabled public List<String> notes { get; set; }
    }

    /**
     * Build the push payload for a batch of campaign members.
     *
     * Only changed rows are sent. Pushing the whole campaign on every sync is
     * what produces the re-import churn the roadmap calls out.
     */
    public static List<CampaignMember> buildPushPayload(List<CampaignMember> members, Datetime since) {
        List<CampaignMember> payload = new List<CampaignMember>();
        if (members == null) {
            return payload;
        }
        for (CampaignMember m : members) {
            if (m == null) {
                continue;
            }
            // Skip rows that have not moved since the last run.
            if (since != null && m.LastModifiedDate != null && m.LastModifiedDate < since) {
                continue;
            }
            payload.add(new CampaignMember(
                CampaignId = m.CampaignId,
                ContactId = m.ContactId,
                LeadId = m.LeadId,
                Status = m.Status
            ));
        }
        return payload;
    }

    /**
     * Pull engagement-layer status back into the campaign member.
     *
     * Engaged/Responded are the only two states the engagement layer owns. The
     * rest stay CRM-owned, otherwise the loop closes.
     */
    public static SyncResult pull(List<CampaignMember> engagementUpdates) {
        SyncResult r = new SyncResult();
        r.notes = new List<String>();
        r.membersRead = engagementUpdates == null ? 0 : engagementUpdates.size();

        if (engagementUpdates == null || engagementUpdates.isEmpty()) {
            return r;
        }

        List<CampaignMember> toUpdate = new List<CampaignMember>();
        for (CampaignMember m : engagementUpdates) {
            if (m == null || m.ContactId == null) {
                r.skipped++;
                continue;
            }
            if (!ENGAGEMENT_OWNED.contains(String.valueOf(m.Status))) {
                r.notes.add('Skipped ' + m.Id + '. Status "' + m.Status + '" is CRM-owned, not engagement-owned.');
                r.skipped++;
                continue;
            }
            m.LastModifiedDate = Datetime.now();
            toUpdate.add(m);
        }

        if (!toUpdate.isEmpty()) {
            Database.update(toUpdate, false);
        }
        r.pulledFromEngagement = toUpdate.size();
        return r;
    }

    /**
     * Reconcile member counts between the two systems.
     *
     * A membership count that disagrees between systems is the earliest
     * available signal that the entry criteria are not being enforced in one
     * of them.
     */
    public static List<String> reconcileCounts(Id campaignId, Integer crmCount, Integer engagementCount) {
        List<String> variances = new List<String>();
        if (crmCount == engagementCount) {
            return variances;
        }
        Decimal delta = crmCount - engagementCount;
        Decimal pct = crmCount == 0 ? 100 : Math.abs(delta / crmCount) * 100;

        variances.add(
            'Campaign ' + campaignId + ': CRM ' + crmCount + ' members, engagement ' + engagementCount
                + ', delta ' + delta + ' (' + String.valueOf(Math.round(pct * 100) / 100.0) + '%).'
        );
        if (pct > 5) {
            variances.add('Above 5%: the two systems are not enforcing the same entry criteria. Fix the campaign member logic, not the interval.');
        }
        return variances;
    }

    /** Statuses the engagement layer is permitted to write back. */
    public static Boolean isEngagementOwned(String status) {
        return ENGAGEMENT_OWNED.contains(status);
    }
}
