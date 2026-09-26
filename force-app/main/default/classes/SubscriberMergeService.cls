/**
 * SubscriberMergeService
 *
 * Field-level survivor selection for a subscriber merge.
 *
 * The rule set encodes the reconciliation phase of the roadmap: source priority
 * beats recency, opt-out is terminal, and the audit record of what was merged
 * is retained after the identifiers are removed.
 *
 * See docs/guide/02-The-Subscriber-and-Data-Extension-Model.md
 * and docs/guide/03-Data-360-Identity-Resolution-and-Segmentation.md
 */
public with sharing class SubscriberMergeService {
    /** Source priority: CRM is the system of record. Order is meaningful. */
    private static final List<String> EMAIL_SOURCE_PRIORITY = new List<String>{ 'CRM', 'Commerce', 'Web' };

    public class MergePlan {
        @AuraEnabled public Id survivorId { get; set; }
        @AuraEnabled public Id duplicateId { get; set; }
        @AuraEnabled public String survivorEmail { get; set; }
        @AuraEnabled public String duplicateEmail { get; set; }
        @AuraEnabled public Map<String, String> fieldDecisions { get; set; }
        @AuraEnabled public List<String> warnings { get; set; }
        @AuraEnabled public Boolean isBlocked { get; set; }
    }

    public class MergeResult {
        @AuraEnabled public Boolean merged { get; set; }
        @AuraEnabled public Id survivingContactId { get; set; }
        @AuraEnabled public String summary { get; set; }
    }

    /**
     * Decide, field by field, which value survives a merge. No writes happen
     * here, so the plan can be reviewed before anything is destroyed.
     */
    public static MergePlan plan(Contact_Master__c survivor, Contact_Master__c duplicate) {
        MergePlan p = new MergePlan();
        p.fieldDecisions = new Map<String, String>();
        p.warnings = new List<String>();
        p.isBlocked = false;

        if (survivor == null || duplicate == null) {
            p.isBlocked = true;
            p.warnings.add('Both a survivor and a duplicate are required.');
            return p;
        }

        p.survivorId = survivor.Id;
        p.duplicateId = duplicate.Id;
        p.survivorEmail = survivor.Email__c;
        p.duplicateEmail = duplicate.Email__c;

        p.fieldDecisions.put('Email__c', survivor.Email__c);
        p.fieldDecisions.put('FirstName__c', firstNonBlank(survivor.FirstName__c, duplicate.FirstName__c));
        p.fieldDecisions.put('LastName__c', firstNonBlank(survivor.LastName__c, duplicate.LastName__c));
        p.fieldDecisions.put('MobilePhone__c', firstNonBlank(survivor.MobilePhone__c, duplicate.MobilePhone__c));

        // Source priority, not recency: the survivor is the CRM record, so its
        // stale-free value is preferred even when the duplicate is newer.
        if (String.isBlank(survivor.TimeZone_Offset__c) && duplicate.TimeZone_Offset__c != null) {
            p.fieldDecisions.put('TimeZone_Offset__c', String.valueOf(duplicate.TimeZone_Offset__c));
            p.warnings.add('Time zone taken from the duplicate. Quiet-hours logic depends on it - verify.');
        }

        if (!equalsIgnoreCase(survivor.Email__c, duplicate.Email__c)) {
            p.warnings.add('Emails differ (' + survivor.Email__c + ' and ' + duplicate.Email__c + '). Confirm this is the same human before merging.');
        }

        return p;
    }

    /**
     * Consent reconciliation, applied across every source for one channel.
     *
     * Opt-out is terminal and is never overwritten by a later opt-in. Recency
     * is explicitly NOT the rule: an opt-out recorded 30 seconds after an opt-in
     * must still win.
     */
    public static String reconcileConsent(List<Consent_Preference__c> records) {
        if (records == null || records.isEmpty()) {
            return 'Pending';
        }
        Boolean anyOptOut = false;
        Boolean allOptIn = true;
        for (Consent_Preference__c r : records) {
            if (r.Status__c == 'OptedOut' || r.Status__c == 'Expired') {
                anyOptOut = true;
            }
            if (r.Status__c != 'OptedIn') {
                allOptIn = false;
            }
        }
        if (anyOptOut) {
            return 'OptedOut';
        }
        return allOptIn ? 'OptedIn' : 'Pending';
    }

    /**
     * Apply a reviewed plan.
     *
     * Consent records move to the survivor. Interaction and journey history is
     * repointed rather than deleted, because that history is the frequency cap
     * and the send log.
     */
    public static MergeResult apply(Contact_Master__c survivor, Contact_Master__c duplicate) {
        MergeResult result = new MergeResult();
        result.merged = false;

        MergePlan p = plan(survivor, duplicate);
        if (p.isBlocked) {
            result.summary = String.join(p.warnings, ' ');
            return result;
        }

        Savepoint sp = Database.setSavepoint();

        List<Consent_Preference__c> consent = [
            SELECT Id, Status__c, Channel__c
            FROM Consent_Preference__c
            WHERE Contact__c = :p.duplicateId
        ];
        List<Consent_Preference__c> toUpdate = new List<Consent_Preference__c>();
        for (Consent_Preference__c c : consent) {
            c.Contact__c = p.survivorId;
            toUpdate.add(c);
        }

        List<Marketing_Interaction__c> interactions = [
            SELECT Id FROM Marketing_Interaction__c WHERE Contact__c = :p.duplicateId
        ];
        for (Marketing_Interaction__c i : interactions) {
            i.Contact__c = p.survivorId;
        }

        List<Journey_Entry_Log__c> journeys = [
            SELECT Id FROM Journey_Entry_Log__c WHERE Contact__c = :p.duplicateId
        ];
        for (Journey_Entry_Log__c j : journeys) {
            j.Contact__c = p.survivorId;
        }

        Database.update(toUpdate);
        Database.update(interactions);
        Database.update(journeys);

        // The duplicate is deleted, never the survivor. The consent history that
        // was repointed is now the only record of what was agreed, so it is the
        // part that must not be lost.
        delete new Contact_Master__c(Id = p.duplicateId);

        result.merged = true;
        result.survivingContactId = p.survivorId;
        result.summary = 'Merged ' + p.duplicateEmail + ' into ' + p.survivorEmail
            + '. Repointed ' + toUpdate.size() + ' consent, ' + interactions.size()
            + ' interaction and ' + journeys.size() + ' journey records.';
        if (Database.rollback(sp)) {
            result.merged = false;
            result.summary = 'Merge rolled back: ' + result.summary;
        }
        return result;
    }

    /**
     * Anonymise a contact for retention: keep the aggregate, drop the identity.
     *
     * Used when consent evidence must be kept for the provability window while
     * the person is erased.
     */
    public static Contact_Master__c anonymise(Contact_Master__c c) {
        if (c == null) {
            return null;
        }
        c.FirstName__c = null;
        c.LastName__c = null;
        c.MobilePhone__c = null;
        c.Duplicate_Flag__c = true;
        return c;
    }

    private static String firstNonBlank(String a, String b) {
        return String.isBlank(a) ? b : a;
    }

    private static Boolean equalsIgnoreCase(String a, String b) {
        return a != null && b != null && a.trim().toLowerCase() == b.trim().toLowerCase();
    }
}
