@IsTest
/**
 * AgentforceMarketingActionServiceTest
 *
 * The guardrail tests. An agent must not get a wider view of a person than an
 * operator has, and must not be able to send.
 */
private class AgentforceMarketingActionServiceTest {
    @TestSetup
    static void seed() {
        insert new Contact_Master__c(Email__c = 'ada@example.com', FirstName__c = 'Ada', LastName__c = 'L');
    }

    private static Id contact() {
        return [SELECT Id FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1].Id;
    }

    private static AgentforceMarketingActionService.ActionRequest request(String action) {
        return new AgentforceMarketingActionService.ActionRequest(
            actionName = action, contactId = contact(), sessionId = 'agent-session-1'
        );
    }

    @IsTest
    static void missingRequestIsRejected() {
        Test.startTest();
        AgentforceMarketingActionService.ActionResult r = AgentforceMarketingActionService.invoke(null);
        Test.stopTest();

        Assert.isFalse(r.succeeded, 'No request, no action.');
    }

    @IsTest
    static void requestWithoutAContactIsRejected() {
        Test.startTest();
        AgentforceMarketingActionService.ActionResult r = AgentforceMarketingActionService.invoke(
            new AgentforceMarketingActionService.ActionRequest(actionName = 'get_preference_centre')
        );
        Test.stopTest();

        Assert.isFalse(r.succeeded, 'An action needs a subject.');
    }

    @IsTest
    static void actionOutsideTheAllowListIsRefused() {
        Test.startTest();
        AgentforceMarketingActionService.ActionResult r = AgentforceMarketingActionService.invoke(request('send_email'));
        Test.stopTest();

        Assert.isFalse(r.succeeded, 'An action that is not exposed is refused.');
        Assert.isTrue(r.message.contains('not exposed'), 'The refusal names the guardrail.');
    }

    @IsTest
    static void allowListIsAnExplicitSet() {
        Test.startTest();
        Set<String> allowed = AgentforceMarketingActionService.allowedActions();
        Test.stopTest();

        Assert.areEqual(4, allowed.size(), 'The allow-list is explicit, not discovered by reflection.');
        Assert.isTrue(allowed.contains('get_preference_centre'), 'Read actions are exposed.');
    }

    @IsTest
    static void stateChangingActionRequiresConfirmation() {
        Test.startTest();
        AgentforceMarketingActionService.ActionResult r = AgentforceMarketingActionService.invoke(request('update_preference'));
        Test.stopTest();

        Assert.isTrue(r.requiresConfirmation, 'A state change is not executed on the agent first ask.');
        Assert.isFalse(r.succeeded, 'Nothing changed.');
        Assert.isNotNull(r.guardrail, 'The guardrail is returned so the agent can explain itself.');
    }

    @IsTest
    static void readActionReturnsThePreferenceState() {
        Test.startTest();
        AgentforceMarketingActionService.ActionResult r =
            AgentforceMarketingActionService.invoke(request('get_preference_centre'));
        Test.stopTest();

        Assert.isTrue(r.succeeded, 'The read succeeded.');
        Assert.isTrue(r.message.contains('not permitted'), 'The agent is told the truth about the consent state.');
    }

    @IsTest
    static void sendHistoryActionReturnsInteractions() {
        insert new Marketing_Interaction__c(
            Contact__c = contact(), Channel__c = 'Email', InteractionType__c = 'Send',
            InteractionDate__c = Datetime.now(), Marketing__c = true
        );

        Test.startTest();
        AgentforceMarketingActionService.ActionResult r = AgentforceMarketingActionService.invoke(request('get_send_history'));
        Test.stopTest();

        Assert.isTrue(r.succeeded, 'The history was read.');
        Assert.isTrue(r.message.contains('interaction grain'), 'The history comes from the interaction grain.');
    }

    @IsTest
    static void agentCannotSendWithoutConsent() {
        Test.startTest();
        Assert.isFalse(AgentforceMarketingActionService.agentMaySend(contact(), 'Email'), 'No consent, no send.');
        Test.stopTest();
    }

    @IsTest
    static void recommendationSuppressesWhenThereIsNoConsent() {
        Test.startTest();
        String recommendation = AgentforceMarketingActionService.recommendNextAction(contact());
        Test.stopTest();

        Assert.isTrue(recommendation.startsWith('Do not contact'), 'A recommendation engine that ignores the suppression list reintroduces the failure.');
    }

    @IsTest
    static void recommendationPermitsContactWithConsentAndHeadroom() {
        ConsentSyncService.record(contact(), 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');
        ConsentSyncService.record(contact(), 'SMS', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');

        Test.startTest();
        String recommendation = AgentforceMarketingActionService.recommendNextAction(contact());
        Test.stopTest();

        Assert.isTrue(recommendation.contains('Permitted'), 'Consent and headroom permit contact.');
    }

    @IsTest
    static void recommendationIsBlockedByTheFrequencyCap() {
        ConsentSyncService.record(contact(), 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');
        ConsentSyncService.record(contact(), 'SMS', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');
        List<Marketing_Interaction__c> interactions = new List<Marketing_Interaction__c>();
        for (Integer i = 0; i < JourneyEntryEventService.DEFAULT_CAP_30D; i++) {
            interactions.add(new Marketing_Interaction__c(
                Contact__c = contact(), Channel__c = 'Email', InteractionType__c = 'Send',
                InteractionDate__c = Datetime.now().addDays(-(i + 1)), Marketing__c = true
            ));
        }
        insert interactions;

        Test.startTest();
        String recommendation = AgentforceMarketingActionService.recommendNextAction(contact());
        Test.stopTest();

        Assert.isTrue(recommendation.contains('Frequency cap'), 'The cap applies to the agent exactly as it applies to a journey.');
    }
}
