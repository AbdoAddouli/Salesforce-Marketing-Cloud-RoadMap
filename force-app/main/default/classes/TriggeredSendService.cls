/**
 * TriggeredSendService
 *
 * Entry rules for a triggered send: the same suppression, consent and
 * frequency checks a journey performs, expressed as query predicates.
 *
 * A triggered send is a journey with a data event entry source. It does not get
 * a weaker consent model, which is the assumption that makes suppression leak
 * into triggered sends and stay there.
 *
 * See docs/guide/06-Triggered-Email-WhatsApp-and-Mobile-Push.md
 */
public with sharing class TriggeredSendService {
    public class SendPlan {
        @AuraEnabled public Id definitionId { get; set; }
        @AuraEnabled public String name { get; set; }
        @AuraEnabled public Id subscriberId { get; set; }
        @AuraEnabled public String subscriberKey { get; set; }
        @AuraEnabled public Boolean isSendable { get; set; }
        @AuraEnabled public List<String> suppressionReasons { get; set; }
        @AuraEnabled public String sendClass { get; set; }
    }

    public class BatchResult {
        @AuraEnabled public Integer submitted { get; set; }
        @AuraEnabled public Integer suppressed { get; set; }
        @AuraEnabled public List<String> reasons { get; set; }
    }

    /**
     * Build the sendable audience for a triggered send definition.
     *
     * Suppression first, then consent, then cap. Each produces a recorded
     * reason, because "why was this person not messaged" has to be answerable
     * from the data, not from memory.
     */
    public static SendPlan planSend(Id definitionId, Contact_Master__c contact, String channel) {
        SendPlan p = new SendPlan();
        p.definitionId = definitionId;
        p.subscriberId = contact == null ? null : contact.Id;
        p.subscriberKey = contact == null ? null : contact.Email__c;
        p.suppressionReasons = new List<String>();
        p.isSendable = true;
        p.name = 'Triggered Send - ' + String.valueOf(channel);
        p.sendClass = channel == 'SMS' || channel == 'WhatsApp' ? 'MobilePush/CloudMessaging' : 'Default';

        if (contact == null) {
            p.isSendable = false;
            p.suppressionReasons.add('No subscriber.');
            return p;
        }

        if (contact.Duplicate_Flag__c) {
            p.isSendable = false;
            p.suppressionReasons.add('Suppression tombstone. This record must never be messaged.');
        }
        if (contact.DoNotMarket__c) {
            p.isSendable = false;
            p.suppressionReasons.add('Do not market flag set on the profile.');
        }
        if (!ConsentSyncService.maySendMarketing(contact.Id, channel)) {
            p.isSendable = false;
            p.suppressionReasons.add('No marketing consent on ' + channel + '.');
        }
        Integer recent = JourneyEntryEventService.countRecentMarketingContacts(contact.Id, 30);
        if (recent >= JourneyEntryEventService.DEFAULT_CAP_30D) {
            p.isSendable = false;
            p.suppressionReasons.add('Frequency cap reached: ' + recent + ' marketing contacts in 30 days.');
        }
        if (p.suppressionReasons.size() > 1 && recent < JourneyEntryEventService.DEFAULT_CAP_30D) {
            p.suppressionReasons.sort();
        }
        return p;
    }

    /**
     * Evaluate a batch.
     *
     * The query is built from the decision, not from a static filter: the
     * suppression list changes between the query and the send, so the plan is
     * re-checked per subscriber.
     */
    public static BatchResult planBatch(Id definitionId, List<Contact_Master__c> contacts, String channel) {
        BatchResult r = new BatchResult();
        r.submitted = 0;
        r.suppressed = 0;
        r.reasons = new List<String>();

        if (contacts == null) {
            return r;
        }
        for (Contact_Master__c c : contacts) {
            SendPlan p = planSend(definitionId, c, channel);
            if (p.isSendable) {
                r.submitted++;
            } else {
                r.suppressed++;
                for (String reason : p.suppressionReasons) {
                    r.reasons.add(c.Email__c + ': ' + reason);
                }
            }
        }
        return r;
    }

    /**
     * The suppression query, as a string, so it can be reviewed in review
     * rather than buried in Apex.
     */
    public static String suppressionQuery() {
        return 'SELECT Id, Email__c FROM Contact_Master__c'
            + ' WHERE Duplicate_Flag__c = true OR DoNotMarket__c = true';
    }

    /**
     * Contacts with consent on a channel and no suppression flag.
     *
     * Note the join: consent is a child record, so the query has to be built
     * against Consent_Preference__c, not against the contact.
     */
    public static List<Contact_Master__c> querySendable(String channel, String purpose) {
        return [
            SELECT Id, Email__c, FirstName__c, LastName__c, TimeZone_Offset__c
            FROM Contact_Master__c
            WHERE Duplicate_Flag__c = false
              AND DoNotMarket__c = false
              AND Id IN (
                  SELECT Contact__c FROM Consent_Preference__c
                  WHERE Channel__c = :channel AND Purpose__c = :purpose AND Status__c = 'OptedIn'
              )
            LIMIT 50000
        ];
    }
}
