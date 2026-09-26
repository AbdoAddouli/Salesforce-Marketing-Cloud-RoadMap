/**
 * MarketingCloudIntelligenceExportService
 *
 * Marketing Cloud Intelligence, now under Data Cloud: the ingestion layer and
 * the modelling surface that makes unified profile and segment membership
 * queryable from the CRM.
 *
 * The distinction this class encodes: Identity Resolution is a Data Cloud
 * resolution action, Segmentation is a Data Cloud calculated insight, and
 * neither of them lives in Marketing Cloud Engagement. Answering "where do I
 * build a segment" with "in Marketing Cloud" is the most common exam-adjacent
 * mistake and the most common real one.
 *
 * See docs/guide/03-Data-360-Identity-Resolution-and-Segmentation.md
 * and docs/guide/13-Data-Cloud-360-and-Agentforce-Integration.md
 */
public with sharing class MarketingCloudIntelligenceExportService {
    /** Objects eligible for ingestion into Data Cloud. */
    private static final Set<String> ELIGIBLE_OBJECTS = new Set<String>{
        'Contact', 'Lead', 'CampaignMember', 'Account', 'Case', 'Consent_Preference__c', 'Marketing_Interaction__c'
    };

    public class IngestionPlan {
        @AuraEnabled public String objectName { get; set; }
        @AuraEnabled public Boolean isEligible { get; set; }
        @AuraEnabled public String primaryKey { get; set; }
        @AuraEnabled public String resolutionRule { get; set; }
        @AuraEnabled public String tier { get; set; }
        @AuraEnabled public String landingLocation { get; set; }
        @AuraEnabled public String reason { get; set; }
    }

    public class SegmentResult {
        @AuraEnabled public String segmentName { get; set; }
        @AuraEnabled public Integer memberCount { get; set; }
        @AuraEnabled public Datetime calculatedAt { get; set; }
        @AuraEnabled public String surface { get; set; }
        @AuraEnabled public Boolean isStale { get; set; }
    }

    /**
     * Plan the ingestion of an object into Data Cloud.
     *
     * Identity Resolution Rule, not Contact Matching: matching is the legacy
     * Contact Engine capability, resolution is the Data Cloud one.
     */
    public static IngestionPlan planIngestion(String objectName) {
        IngestionPlan p = new IngestionPlan();
        p.objectName = objectName;
        p.surface = 'Data Cloud';

        if (!ELIGIBLE_OBJECTS.contains(objectName)) {
            p.isEligible = false;
            p.reason = objectName + ' is not in the ingestion scope for this project. Add it deliberately, with a primary key and a retention decision.';
            return p;
        }

        p.isEligible = true;
        p.tier = objectName == 'Marketing_Interaction__c' ? 'Event tier' : 'Profile tier';
        p.landingLocation = 'Ingestion pipeline - ' + p.tier;

        if (objectName == 'Contact' || objectName == 'Lead') {
            p.primaryKey = 'Email';
            p.resolutionRule = 'Email exact, then Email + LastName fuzzy';
        } else if (objectName == 'CampaignMember') {
            p.primaryKey = 'CampaignMember:ContactId';
            p.resolutionRule = 'ContactId to the unified profile, no independent identity';
        } else {
            p.primaryKey = 'Id, mapped to the unified profile';
            p.resolutionRule = 'Join to the unified profile, no independent identity';
        }

        p.reason = 'Ingested to ' + p.tier.toLowerCase() + ' and resolved through an Identity Resolution Rule.';
        return p;
    }

    /**
     * Evaluate a calculated insight and report staleness.
     *
     * A segment is current only while the rule that defines it is still true.
     * A recalculation schedule is part of the definition, not an optimisation.
     */
    public static SegmentResult evaluateSegment(String segmentName, Integer memberCount, Datetime lastCalculatedAt) {
        SegmentResult r = new SegmentResult();
        r.segmentName = segmentName;
        r.memberCount = memberCount == null ? 0 : memberCount;
        r.calculatedAt = lastCalculatedAt;
        r.surface = 'Data Cloud calculated insight';

        Integer ageHours = lastCalculatedAt == null
            ? 9999
            : Integer.valueOf(String.valueOf((Datetime.now().getTime() - lastCalculatedAt.getTime()) / 3600000L));

        r.isStale = ageHours > 24;
        if (r.isStale) {
            r.memberCount = 0;
        }
        return r;
    }

    /**
     * Read a resolved unified profile.
     *
     * The resolved profile is the merge result across every source. Reading a
     * single source object here is the mistake that produces two different
     * answers for the same person.
     */
    public static List<Contact_Master__c> readUnifiedProfile(Id contactId) {
        return [
            SELECT Id, Email__c, FirstName__c, LastName__c, MobilePhone__c,
                   TimeZone_Offset__c, ProfileMatchRate__c, Duplicate_Flag__c, LastSyncedAt__c
            FROM Contact_Master__c
            WHERE Id = :contactId
            LIMIT 1
        ];
    }

    /** Segment buildable surfaces, and where each one actually runs. */
    public static List<String> describeSegmentSurfaces() {
        return new List<String>{
            'Data Cloud - calculated insight. The correct place for a segment that depends on profile or behavioural data.',
            'Marketing Cloud Engagement - Data Extension query. Correct for a list you fully control and refresh yourself.',
            'Salesforce Campaign - Campaign Member. A campaign execution list, not a segmentation surface.'
        };
    }

    public static Boolean isEligibleForIngestion(String objectName) {
        return ELIGIBLE_OBJECTS.contains(objectName);
    }
}
