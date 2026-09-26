/**
 * EmailPreferenceService
 *
 * Preference centre read/write, list-level and global unsubscribe, and the
 * bounce-versus-opt-out distinction.
 *
 * A soft bounce is a deliverability signal. It is not opt-out and it is not
 * consent. Collapsing the two destroys the addressable audience; keeping them
 * separate is what makes the deliverability triage in phase 4 possible.
 *
 * See docs/guide/04-Deliverability-Domain-Reputation-and-IP-Warming.md
 * and docs/guide/10-Consent-Management-and-Compliance.md
 */
public with sharing class EmailPreferenceService {
    public static final String BOUNCE_HARD = 'Hard bounce';
    public static final String BOUNCE_BLOCK = 'Block bounce';
    public static final String BOUNCE_SOFT = 'Soft bounce';

    public class PreferenceSummary {
        @AuraEnabled public Id contactId { get; set; }
        @AuraEnabled public String email { get; set; }
        @AuraEnabled public Boolean emailMarketing { get; set; }
        @AuraEnabled public Boolean emailTransactional { get; set; }
        @AuraEnabled public Boolean globallyUnsubscribed { get; set; }
        @AuraEnabled public List<String> channels { get; set; }
        @AuraEnabled public String preferenceCentreUrl { get; set; }
        @AuraEnabled public String unsubscribeUrl { get; set; }
    }

    public class BounceVerdict {
        @AuraEnabled public String bounceCategory { get; set; }
        @AuraEnabled public Boolean isConsentEvent { get; set; }
        @AuraEnabled public Boolean suppressFromAllSends { get; set; }
        @AuraEnabled public String action { get; set; }
    }

    /**
     * Read the current preference state for a contact.
     *
     * Transactional is always permitted: it is exempt from marketing consent,
     * not from accuracy.
     */
    public static PreferenceSummary read(Id contactId) {
        PreferenceSummary s = new PreferenceSummary();
        s.contactId = contactId;
        s.channels = new List<String>();
        s.emailTransactional = true;

        List<Contact_Master__c> contacts = [SELECT Email__c FROM Contact_Master__c WHERE Id = :contactId LIMIT 1];
        s.email = contacts.isEmpty() ? null : contacts[0].Email__c;

        List<Consent_Preference__c> consent = [
            SELECT Channel__c, Purpose__c, Status__c
            FROM Consent_Preference__c
            WHERE Contact__c = :contactId
        ];

        Boolean marketingOk = false;
        Boolean anyOptOut = false;
        for (Consent_Preference__c c : consent) {
            if (c.Status__c == ConsentSyncService.STATUS_OPTED_OUT) {
                anyOptOut = true;
            }
            if (c.Channel__c == 'Email' && c.Purpose__c == 'Marketing' && c.Status__c == ConsentSyncService.STATUS_OPTED_IN) {
                marketingOk = true;
            }
            if (c.Channel__c != null && !s.channels.contains(c.Channel__c)) {
                s.channels.add(c.Channel__c);
            }
        }

        s.emailMarketing = marketingOk && !anyOptOut;
        s.globallyUnsubscribed = anyOptOut;
        s.preferenceCentreUrl = buildPreferenceUrl(s.email);
        s.unsubscribeUrl = buildUnsubscribeUrl(s.email);
        return s;
    }

    /**
     * Apply a preference change.
     *
     * The list-level unsubscribe and the global unsubscribe are both recorded,
     * and the global one is terminal.
     */
    public static Consent_Preference__c applyPreference(
        Id contactId,
        String purpose,
        Boolean optedIn,
        String source,
        String evidence
    ) {
        return ConsentSyncService.record(
            contactId,
            'Email',
            purpose,
            optedIn ? ConsentSyncService.STATUS_OPTED_IN : ConsentSyncService.STATUS_OPTED_OUT,
            source,
            evidence
        );
    }

    /**
     * Global unsubscribe: every promotional channel, permanently.
     *
     * Not a preference toggle. There is no path back without a new, evidenced
     * opt-in from the person.
     */
    public static Integer unsubscribeAll(Id contactId, String reason) {
        Integer written = 0;
        for (String channel : new List<String>{ 'Email', 'SMS', 'WhatsApp', 'Push' }) {
            ConsentSyncService.record(contactId, channel, 'Marketing', ConsentSyncService.STATUS_OPTED_OUT, 'Import', reason);
            written++;
        }
        return written;
    }

    /**
     * Classify a bounce.
     *
     * Only a block bounce is a consent event, because a block bounce is the
     * mailbox provider refusing future mail. A hard bounce means the address
     * does not exist, and a soft bounce means it was temporarily unavailable -
     * neither is the person saying stop.
     */
    public static BounceVerdict classifyBounce(String bounceCategory) {
        BounceVerdict v = new BounceVerdict();
        v.bounceCategory = bounceCategory;
        v.isConsentEvent = false;
        v.suppressFromAllSends = false;

        if (bounceCategory == BOUNCE_BLOCK) {
            v.isConsentEvent = true;
            v.suppressFromAllSends = true;
            v.action = 'Global suppression. Write the opt-out and retain the evidence.';
        } else if (bounceCategory == BOUNCE_HARD) {
            v.suppressFromAllSends = true;
            v.action = 'Suppress from sends and fix the import source. This is list hygiene, not consent.';
        } else {
            v.action = 'No suppression. Retry on the next send and count it in the deliverability report.';
        }
        return v;
    }

    /**
     * Guard used by every send entry rule.
     *
     * A block bounce is permanent; a hard bounce is permanent for sends but is
     * not evidence of an opt-out, so the reason is recorded separately.
     */
    public static Boolean mayReceiveMarketing(Id contactId) {
        if (contactId == null) {
            return false;
        }
        Contact_Master__c c = [
            SELECT DoNotMarket__c FROM Contact_Master__c WHERE Id = :contactId LIMIT 1
        ];
        if (!c.isEmpty() && c[0].DoNotMarket__c) {
            return false;
        }
        return ConsentSyncService.maySendMarketing(contactId, 'Email');
    }

    private static String buildPreferenceUrl(String email) {
        return 'https://mcc.example.com/preference-centre?contact=' + EncodingUtil.urlEncode(String.valueOf(email), 'UTF-8');
    }

    private static String buildUnsubscribeUrl(String email) {
        return 'https://mcc.example.com/unsubscribe?contact=' + EncodingUtil.urlEncode(String.valueOf(email), 'UTF-8');
    }
}
