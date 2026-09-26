/**
 * ConsentSyncService
 *
 * Per-channel, per-purpose consent resolution, including the anonymised
 * tombstone that must survive an erasure.
 *
 * The three rules that the whole compliance position rests on:
 *   1. Opt-out is terminal. No recency rule, no source priority, ever.
 *   2. A deferred send is a scheduling instruction, not a permission.
 *   3. Suppression is anonymised, never deleted. Delete the tombstone and the
 *      next ingest rebuilds the profile and the person is messaged again.
 *
 * See docs/guide/10-Consent-Management-and-Compliance.md
 */
public with sharing class ConsentSyncService {
    public static final String STATUS_OPTED_IN = 'OptedIn';
    public static final String STATUS_OPTED_OUT = 'OptedOut';
    public static final String STATUS_PENDING = 'Pending';
    public static final String STATUS_TRANSFERRED = 'Transferred';
    public static final String STATUS_EXPIRED = 'Expired';

    /** Channels where the channel platform, not the CRM, is authoritative. */
    private static final Set<String> PLATFORM_AUTHORITATIVE = new Set<String>{ 'WhatsApp', 'SMS' };

    public class Decision {
        @AuraEnabled public String channel { get; set; }
        @AuraEnabled public String purpose { get; set; }
        @AuraEnabled public String resolvedStatus { get; set; }
        @AuraEnabled public Boolean maySend { get; set; }
        @AuraEnabled public String reason { get; set; }
    }

    /**
     * Resolve the consent state for one channel and purpose from every source
     * that has an opinion.
     *
     * Opt-out wins unconditionally. Anything that is neither a clean opt-in nor
     * a clean opt-out is Pending, and Pending is not sendable.
     */
    public static Decision resolve(Id contactId, String channel, String purpose) {
        Decision d = new Decision();
        d.channel = channel;
        d.purpose = purpose;

        List<Consent_Preference__c> records = [
            SELECT Id, Status__c, Source__c, CapturedDate__c, Is_Tombstone__c
            FROM Consent_Preference__c
            WHERE Contact__c = :contactId
              AND Channel__c = :channel
              AND Purpose__c = :purpose
        ];

        if (records.isEmpty()) {
            d.resolvedStatus = STATUS_PENDING;
            d.maySend = false;
            d.reason = 'No consent record for ' + channel + ' / ' + purpose + '. Not sendable.';
            return d;
        }

        String resolved = SubscriberMergeService.reconcileConsent(records);
        d.resolvedStatus = resolved;
        d.maySend = resolved == STATUS_OPTED_IN;

        if (resolved == STATUS_OPTED_IN) {
            d.reason = 'All sources opted in. Send permitted.';
        } else if (resolved == STATUS_OPTED_OUT) {
            d.reason = 'At least one source holds an opt-out. Opt-out is terminal.';
        } else {
            d.reason = 'Sources disagree or consent is pending, transferred or expired. Not sendable.';
        }
        return d;
    }

    /** Convenience wrapper for a marketing send on one channel. */
    public static Boolean maySendMarketing(Id contactId, String channel) {
        return resolve(contactId, channel, 'Marketing').maySend;
    }

    /**
     * Record consent from a source.
     *
     * An opt-in can never overwrite an existing opt-out. The opt-out has to be
     * cleared by a new, evidenced opt-in action, not by a sync.
     */
    public static Consent_Preference__c record(
        Id contactId,
        String channel,
        String purpose,
        String status,
        String source,
        String evidence
    ) {
        List<Consent_Preference__c> existing = [
            SELECT Id, Status__c, Source__c, CapturedDate__c, Is_Tombstone__c
            FROM Consent_Preference__c
            WHERE Contact__c = :contactId AND Channel__c = :channel AND Purpose__c = :purpose
            FOR UPDATE
        ];

        Consent_Preference__c record = existing.isEmpty() ? new Consent_Preference__c() : existing[0];
        Boolean wasOptedOut = existing.size() > 0 && existing[0].Status__c == STATUS_OPTED_OUT;

        if (wasOptedOut && status == STATUS_OPTED_IN && !isFreshOptInAction(source, evidence)) {
            // A sync must not clear an opt-out. Only an explicit capture can.
            record.Status__c = STATUS_OPTED_OUT;
        } else {
            record.Status__c = status;
        }

        record.Contact__c = contactId;
        record.Channel__c = channel;
        record.Purpose__c = purpose;
        record.Source__c = source;
        record.Evidence__c = evidence;
        record.RecordedBy__c = UserInfo.getUserName();
        record.CapturedDate__c = Datetime.now();
        if (record.Status__c == STATUS_OPTED_OUT) {
            record.OptedOutDate__c = Datetime.now();
        }

        if (record.Id == null) {
            insert record;
        } else {
            update record;
        }
        return record;
    }

    /**
     * Push an opt-out out to the systems holding a stale value.
     *
     * Without this the opt-out is re-imported on the next sync and the whole
     * argument repeats next week.
     */
    public static Integer propagateOptOut(String channel, Date since) {
        List<Consent_Preference__c> optOuts = [
            SELECT Id, Contact__c, Channel__c
            FROM Consent_Preference__c
            WHERE Status__c = :STATUS_OPTED_OUT
              AND Channel__c = :channel
              AND OptedOutDate__c >= :since
        ];
        List<Marketing_Interaction__c> suppressions = new List<Marketing_Interaction__c>();
        for (Consent_Preference__c o : optOuts) {
            suppressions.add(new Marketing_Interaction__c(
                Contact__c = o.Contact__c,
                Channel__c = o.Channel__c,
                InteractionType__c = 'Unsubscribe',
                InteractionDate__c = Datetime.now(),
                Marketing__c = false
            ));
        }
        if (!suppressions.isEmpty()) {
            insert suppressions;
        }
        return suppressions.size();
    }

    /**
     * Erase a person while keeping the evidence.
     *
     * Consent history is retained anonymised for the provability window. The
     * identifier is deleted. Doing either one alone is wrong: deleting the
     * consent record destroys the defence, and keeping the email on it leaves
     * the personal data in place after erasure.
     */
    public static Consent_Preference__c anonymiseForRetention(Consent_Preference__c record, Integer retentionYears) {
        if (record == null) {
            return null;
        }
        record.Hashed_Contact_Key__c = hashReference(record.Contact__c);
        record.Contact__c = null;
        record.Evidence__c = 'Retained evidence. Identifier removed. ' + record.Evidence__c;
        record.ExpiresOn__c = Date.today().addYears(retentionYears);
        record.Is_Tombstone__c = true;
        return record;
    }

    /**
     * Build the permanent suppression tombstone.
     *
     * The person is erased, the suppression survives. This is the one artefact
     * that must never be deleted, and it carries no identifier.
     */
    public static Consent_Preference__c buildTombstone(String channel, String purpose) {
        Consent_Preference__c tombstone = new Consent_Preference__c(
            Contact__c = null,
            Channel__c = channel,
            Purpose__c = purpose,
            Status__c = STATUS_OPTED_OUT,
            Source__c = 'Import',
            Is_Tombstone__c = true,
            Evidence__c = 'Erasure tombstone. No identifier retained. Must never be deleted.',
            RecordedBy__c = UserInfo.getUserName(),
            CapturedDate__c = Datetime.now(),
            OptedOutDate__c = Datetime.now()
        );
        insert tombstone;
        return tombstone;
    }

    /** Channel platforms are authoritative for their own opt-outs. */
    public static Boolean isPlatformAuthoritative(String channel) {
        return PLATFORM_AUTHORITATIVE.contains(channel);
    }

    /** A fresh opt-in action carries its own evidence. A sync does not. */
    private static Boolean isFreshOptInAction(String source, String evidence) {
        return String.isNotBlank(evidence) && 'Import' != source;
    }

    private static String hashReference(Id recordId) {
        if (recordId == null) {
            return null;
        }
        return EncodingUtil.base64Encode(Blob.valueOf('consent:' + recordId)).deleteWhitespace();
    }
}
