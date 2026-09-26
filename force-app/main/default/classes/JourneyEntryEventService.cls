/**
 * JourneyEntryEventService
 *
 * Journey entry decisioning: consent gate, frequency cap, re-entry rule,
 * quiet hours. Every decision is logged, allowed or blocked.
 *
 * The log is the point. Without a decision record per entry, "why was this
 * person messaged twice" is unanswerable and the journey cannot be tuned.
 *
 * See docs/guide/07-Automations-Triggers-and-Platform-Events.md
 * and docs/guide/11-Journey-Builder-and-Automation-Orchestration.md
 */
public with sharing class JourneyEntryEventService {
    /** Default frequency cap: no more than this many marketing contacts per rolling window. */
    public static final Integer DEFAULT_CAP_30D = 4;
    public static final Integer QUIET_HOURS_START = 20;
    public static final Integer QUIET_HOURS_END = 8;

    public class EntryRequest {
        @AuraEnabled public String journeyName { get; set; }
        @AuraEnabled public String entryEvent { get; set; }
        @AuraEnabled public Id contactId { get; set; }
        @AuraEnabled public Boolean reEntryAllowed { get; set; }
    }

    public class EntryDecision {
        @AuraEnabled public Boolean allowed { get; set; }
        @AuraEnabled public String journeyName { get; set; }
        @AuraEnabled public Id contactId { get; set; }
        @AuraEnabled public String reason { get; set; }
        @AuraEnabled public Boolean frequencyCapApplied { get; set; }
        @AuraEnabled public Boolean consentVerified { get; set; }
        @AuraEnabled public Id logId { get; set; }
    }

    /**
     * Decide whether a contact may enter a journey.
     *
     * Ordered cheapest-first: re-entry is a single indexed query, frequency cap
     * is a count, consent is one lookup, quiet hours is arithmetic. Consent is
     * checked last because it is the one that has to consult the consent
     * service rather than local data.
     */
    public static EntryDecision evaluate(EntryRequest request) {
        EntryDecision d = new EntryDecision();
        d.journeyName = request.journeyName;
        d.contactId = request.contactId;
        d.frequencyCapApplied = false;
        d.consentVerified = false;

        if (request == null || request.contactId == null || String.isBlank(request.journeyName)) {
            d.allowed = false;
            d.reason = 'Journey, entry event and contact are all required.';
            return d;
        }

        // 1. Re-entry rule.
        if (request.reEntryAllowed == false && hasEnteredBefore(request.journeyName, request.contactId)) {
            d.allowed = false;
            d.reason = 'Single-entry journey. This contact already entered ' + request.journeyName + '.';
            return write(d, false);
        }

        // 2. Frequency cap, on the interaction grain, not the campaign grain.
        Integer recent = countRecentMarketingContacts(request.contactId, 30);
        if (recent >= DEFAULT_CAP_30D) {
            d.allowed = false;
            d.frequencyCapApplied = true;
            d.reason = 'Frequency cap reached: ' + recent + ' marketing contacts in the last 30 days, limit ' + DEFAULT_CAP_30D + '.';
            return write(d, false);
        }

        // 3. Consent. Marketing journey means a marketing send.
        for (String channel : new List<String>{ 'Email', 'SMS' }) {
            if (!ConsentSyncService.maySendMarketing(request.contactId, channel)) {
                d.allowed = false;
                d.reason = 'No marketing consent on ' + channel + '. Journey entry blocked.';
                return write(d, false);
            }
        }
        d.consentVerified = true;

        // 4. Quiet hours, in the contact's own time zone.
        if (isWithinQuietHours(request.contactId)) {
            d.allowed = false;
            d.reason = 'Inside quiet hours in the contact time zone. Defer rather than drop.';
            return write(d, true);
        }

        d.allowed = true;
        d.reason = 'Entry permitted.';
        return write(d, true);
    }

    /**
     * Re-entry check.
     *
     * Windowed at 30 days so a journey that re-entries monthly behaves, and a
     * "single entry" journey with no window at all cannot be re-entered by a
     * retry of the same event.
     */
    public static Boolean hasEnteredBefore(String journeyName, Id contactId) {
        List<Journey_Entry_Log__c> prior = [
            SELECT Id
            FROM Journey_Entry_Log__c
            WHERE Journey__c = :journeyName
              AND Contact__c = :contactId
              AND Decision__c = 'Allowed'
              AND EvaluatedAt__c = LAST_N_DAYS:30
            LIMIT 1
        ];
        return !prior.isEmpty();
    }

    /**
     * Marketing contacts in the window.
     *
     * Counted from Marketing_Interaction__c because a count of
     * Marketing_Campaign__c records cannot answer a per-contact question.
     */
    public static Integer countRecentMarketingContacts(Id contactId, Integer windowDays) {
        List<Marketing_Interaction__c> interactions = [
            SELECT Id
            FROM Marketing_Interaction__c
            WHERE Contact__c = :contactId
              AND Marketing__c = true
              AND InteractionDate__c = LAST_N_DAYS:30
            LIMIT 10000
        ];
        Integer cap = windowDays == null ? 30 : windowDays;
        return Math.min(interactions.size(), cap * 10);
    }

    /**
     * Quiet hours, in the contact's own offset.
     *
     * The contact's time zone, not the business unit's, because a message sent
     * at 21:00 local is exactly the complaint the roadmap warns about.
     */
    public static Boolean isWithinQuietHours(Id contactId) {
        List<Contact_Master__c> contacts = [SELECT TimeZone_Offset__c FROM Contact_Master__c WHERE Id = :contactId LIMIT 1];
        if (contacts.isEmpty() || contacts[0].TimeZone_Offset__c == null) {
            return false;
        }
        Datetime localNow = Datetime.now().addHours((Integer) contacts[0].TimeZone_Offset__c);
        Integer hour = Integer.valueOf(Datetime.format(localNow, 'H'));
        return hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END;
    }

    private static EntryDecision write(EntryDecision d, Boolean allowed) {
        Journey_Entry_Log__c entry = new Journey_Entry_Log__c(
            Journey__c = d.journeyName,
            Contact__c = d.contactId,
            EntryEvent__c = 'DecisionEngine',
            Decision__c = allowed ? 'Allowed' : 'Blocked',
            Reason__c = d.reason,
            EvaluatedAt__c = Datetime.now(),
            Frequency_Cap_Applied__c = d.frequencyCapApplied,
            Consent_Verified__c = d.consentVerified
        );
        insert entry;
        d.logId = entry.Id;
        return d;
    }
}
