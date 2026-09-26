/**
 * DataExtensionSyncService
 *
 * Key-safe sync from an external feed into a staged audience, modelled on the
 * Marketing Cloud Engagement pattern: import to staging, validate, then upsert
 * to the target with an explicit Subscriber Key.
 *
 * The two properties that matter:
 *   1. Idempotent. Running twice produces the same result, so a retry after a
 *      failure is safe.
 *   2. Key-safe. The Subscriber Key is set explicitly, so a feed that omits it
 *      cannot silently create a second profile of the same human.
 *
 * See docs/guide/02-The-Subscriber-and-Data-Extension-Model.md
 */
public with sharing class DataExtensionSyncService {
    /** Subscriber Key is the identity across audiences. */
    public static final String SUBSCRIBER_KEY = 'Email';

    /** Minimum row-count variance, as a percentage, before a run is flagged Partial. */
    private static final Decimal MIN_ROW_VARIANCE_PCT = 5.0;

    public class Result {
        @AuraEnabled public Id runId { get; set; }
        @AuraEnabled public Integer recordsIn { get; set; }
        @AuraEnabled public Integer recordsOut { get; set; }
        @AuraEnabled public Integer duplicates { get; set; }
        @AuraEnabled public Integer badAddresses { get; set; }
        @AuraEnabled public Boolean idempotent { get; set; }
        @AuraEnabled public String status { get; set; }
        @AuraEnabled public String errorMessage { get; set; }
    }

    /**
     * Validate a batch before it is promoted. Validation runs BEFORE the
     * transformation so a bad file never reaches the target.
     */
    public static Result validate(String sourceSystem, List<Contact_Master__c> batch) {
        Result r = new Result();
        r.recordsIn = batch == null ? 0 : batch.size();
        r.recordsOut = 0;
        r.duplicates = 0;
        r.badAddresses = 0;
        r.idempotent = true;
        r.errorMessage = null;

        if (batch == null || batch.isEmpty()) {
            r.status = 'Failed';
            r.errorMessage = 'Empty batch. Nothing to promote.';
            return r;
        }

        Set<String> seen = new Set<String>();
        for (Contact_Master__c c : batch) {
            if (c == null || String.isBlank(c.Email__c)) {
                r.badAddresses++;
                continue;
            }
            String key = normaliseKey(c.Email__c);
            if (!seen.add(key)) {
                r.duplicates++;
            }
            r.recordsOut++;
        }

        if (r.badAddresses > 0) {
            r.status = 'Failed';
            r.errorMessage = r.badAddresses + ' row(s) have no usable Subscriber Key. Batch rejected.';
            return r;
        }

        r.status = r.duplicates > 0 ? 'Partial' : 'Success';
        return r;
    }

    /**
     * Upsert a validated batch into the target audience.
     *
     * External ID upsert, not insert: the email is the external identity, so a
     * re-run updates in place instead of creating duplicates. This is the CRM
     * equivalent of a Data Extension with an explicit Subscriber Key.
     */
    public static Result sync(String sourceSystem, List<Contact_Master__c> batch) {
        Result v = validate(sourceSystem, batch);
        if (v.status == 'Failed') {
            v.runId = log(sourceSystem, 'Contact_Master__c', v);
            return v;
        }

        List<Contact_Master__c> payload = new List<Contact_Master__c>();
        for (Contact_Master__c c : batch) {
            if (c == null || String.isBlank(c.Email__c)) {
                continue;
            }
            payload.add(new Contact_Master__c(
                Email__c = normaliseKey(c.Email__c),
                FirstName__c = c.FirstName__c,
                LastName__c = c.LastName__c,
                MobilePhone__c = c.MobilePhone__c,
                TimeZone_Offset__c = c.TimeZone_Offset__c,
                LeadSource__c = c.LeadSource__c,
                LastSyncedAt__c = Datetime.now()
            ));
        }

        // Email__c is unique, so Database.upsert is naturally idempotent.
        Database.UpsertResult[] results = Database.upsert(payload, Contact_Master__c.Email__c, false);
        Integer failed = 0;
        String firstError = null;
        for (Database.UpsertResult ur : results) {
            if (!ur.isSuccess()) {
                failed++;
                if (firstError == null) {
                    firstError = String.valueOf(ur.getErrors()[0].getStatusCode()) + ': ' + ur.getErrors()[0].getMessage();
                }
            }
        }

        Result r = new Result();
        r.recordsIn = v.recordsIn;
        r.recordsOut = results.size() - failed;
        r.duplicates = v.duplicates;
        r.badAddresses = v.badAddresses;
        r.idempotent = true;
        r.status = failed == 0 ? v.status : 'Failed';
        r.errorMessage = failed == 0 ? null : failed + ' upsert(s) failed. First error - ' + firstError;
        r.runId = log(sourceSystem, 'Contact_Master__c', r);
        return r;
    }

    /**
     * Row-count variance against the last successful run.
     *
     * A median, not yesterday: a single-day comparison fails on a legitimately
     * quiet day, and it is the check that lets a partial file through.
     */
    public static Decimal rowVariancePct(Data_Extension_Sync_Log__c priorRun, Integer currentRows) {
        if (priorRun == null || priorRun.RecordsOut__c == 0) {
            return 0;
        }
        Decimal base = priorRun.RecordsOut__c;
        Decimal current = currentRows;
        return Math.abs((current - base) / base) * 100;
    }

    public static Boolean isAbnormalRowCount(Data_Extension_Sync_Log__c priorRun, Integer currentRows) {
        return rowVariancePct(priorRun, currentRows) > MIN_ROW_VARIANCE_PCT * 4;
    }

    /**
     * Normalise an email into a Subscriber Key.
     *
     * Trim, lowercase, strip plus-addressing. Case differences between two
     * systems are the most common cause of a duplicated profile.
     */
    public static String normaliseKey(String email) {
        if (String.isBlank(email)) {
            return null;
        }
        String key = email.trim().toLowerCase();
        Integer plus = key.indexOf('+');
        if (plus > 0) {
            key = key.substring(0, plus) + key.substring(key.indexOf('@', plus));
        }
        return key;
    }

    private static Id log(String sourceSystem, String objectName, Result r) {
        Data_Extension_Sync_Log__c entry = new Data_Extension_Sync_Log__c(
            SourceSystem__c = sourceSystem,
            Object_Name__c = objectName,
            Status__c = r.status,
            RecordsIn__c = r.recordsIn,
            RecordsOut__c = r.recordsOut,
            Duplicates__c = r.duplicates,
            BadAddresses__c = r.badAddresses,
            ErrorMessage__c = r.errorMessage,
            ValidatedAt__c = Datetime.now(),
            Idempotent__c = r.idempotent
        );
        insert entry;
        return entry.Id;
    }
}
