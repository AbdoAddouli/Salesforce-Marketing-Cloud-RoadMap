/**
 * AgentforceMarketingActionService
 *
 * Action invocation for an Agentforce agent acting on a marketing context.
 *
 * Consent applies to agents. An agent that can look up a person can also send
 * to them, and the agent inherits the suppression list, not its own opinion of
 * it. Every send path in this project ends in the same consent and frequency
 * gate, whether a human or an agent asked for it.
 *
 * See docs/guide/12-Agentforce-AI-Automation.md
 * and docs/guide/13-Data-Cloud-360-and-Agentforce-Integration.md
 */
public with sharing class AgentforceMarketingActionService {
    /** Marketing actions exposed to the agent. Explicit allow-list, not reflection. */
    private static final Set<String> ALLOWED_ACTIONS = new Set<String>{
        'get_preference_centre', 'update_preference', 'get_send_history', 'recommend_next_action'
    };

    /** Actions that change state and therefore need an explicit confirmation. */
    private static final Set<String> CONFIRMATION_REQUIRED = new Set<String>{ 'update_preference' };

    public class ActionRequest {
        @AuraEnabled public String actionName { get; set; }
        @AuraEnabled public Id contactId { get; set; }
        @AuraEnabled public Map<String, Object> parameters { get; set; }
        @AuraEnabled public String sessionId { get; set; }
    }

    public class ActionResult {
        @AuraEnabled public Boolean succeeded { get; set; }
        @AuraEnabled public String actionName { get; set; }
        @AuraEnabled public Object output { get; set; }
        @AuraEnabled public String message { get; set; }
        @AuraEnabled public Boolean requiresConfirmation { get; set; }
        @AuraEnabled public String guardrail { get; set; }
    }

    /**
     * Invoke one action behind the guardrails.
     *
     * Order: allow-list, then confirmation, then state. Checking the allow-list
     * after running the action is the failure mode this prevents.
     */
    public static ActionResult invoke(ActionRequest request) {
        ActionResult r = new ActionResult();
        r.actionName = request == null ? null : request.actionName;
        r.requiresConfirmation = false;

        if (request == null || String.isBlank(request.actionName) || request.contactId == null) {
            r.succeeded = false;
            r.message = 'An action name and a contact are required.';
            return r;
        }

        if (!ALLOWED_ACTIONS.contains(request.actionName)) {
            r.succeeded = false;
            r.message = 'Action "' + request.actionName + '" is not exposed to the agent. Allowed: ' + String.join(new List<String>(ALLOWED_ACTIONS), ', ');
            return r;
        }

        // The agent does not get a wider view of the person than an operator has.
        if (request.actionName == 'get_preference_centre') {
            EmailPreferenceService.PreferenceSummary s = EmailPreferenceService.read(request.contactId);
            r.output = JSON.serialize(s);
            r.succeeded = true;
            r.message = 'Preference state read. ';
            r.message += s.emailMarketing ? 'Marketing send permitted.' : 'Marketing send not permitted.';
        } else if (request.actionName == 'get_send_history') {
            r.output = JSON.serialize(readSendHistory(request.contactId));
            r.succeeded = true;
            r.message = 'Send history read from the interaction grain.';
        } else if (request.actionName == 'recommend_next_action') {
            r.output = recommendNextAction(request.contactId);
            r.succeeded = true;
            r.message = 'Recommendation produced. It is advisory; the send gate still applies.';
        } else {
            r.requiresConfirmation = CONFIRMATION_REQUIRED.contains(request.actionName);
            r.guardrail = 'Consent is terminal. A preference change is made only on an explicit, evidenced instruction.';
            r.output = null;
            r.succeeded = false;
            r.message = 'Confirmation required before this action changes state.';
        }
        return r;
    }

    /**
     * The send gate, callable from an agent topic.
     *
     * The agent may not send. It may only ask this whether a send would be
     * permitted, and the answer is the same one a triggered send gets.
     */
    public static Boolean agentMaySend(Id contactId, String channel) {
        if (contactId == null || String.isBlank(channel)) {
            return false;
        }
        if (!EmailPreferenceService.mayReceiveMarketing(contactId) && channel == 'Email') {
            return false;
        }
        return ConsentSyncService.maySendMarketing(contactId, channel);
    }

    public static List<Marketing_Interaction__c> readSendHistory(Id contactId) {
        return [
            SELECT Id, Channel__c, InteractionType__c, InteractionDate__c, Campaign__c, Marketing__c
            FROM Marketing_Interaction__c
            WHERE Contact__c = :contactId
            ORDER BY InteractionDate__c DESC
            LIMIT 50
        ];
    }

    /**
     * Recommend the next action for a contact.
     *
     * Returns null when the contact is suppressed. A recommendation engine
     * that ignores the suppression list is how an AI surface reintroduces a
     * compliance failure that was already fixed.
     */
    public static String recommendNextAction(Id contactId) {
        for (String channel : new List<String>{ 'Email', 'SMS' }) {
            if (!agentMaySend(contactId, channel)) {
                return 'Do not contact on ' + channel + '. No marketing consent.';
            }
        }
        Integer recent = JourneyEntryEventService.countRecentMarketingContacts(contactId, 30);
        if (recent >= JourneyEntryEventService.DEFAULT_CAP_30D) {
            return 'Do not contact. Frequency cap reached: ' + recent + ' in 30 days.';
        }
        if (JourneyEntryEventService.isWithinQuietHours(contactId)) {
            return 'Defer. The contact is inside quiet hours in their own time zone.';
        }
        return 'Permitted to contact. ' + recent + ' marketing contacts in the last 30 days.';
    }

    public static Set<String> allowedActions() {
        return ALLOWED_ACTIONS;
    }
}
