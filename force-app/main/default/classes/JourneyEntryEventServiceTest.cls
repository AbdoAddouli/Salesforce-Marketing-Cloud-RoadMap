@IsTest
/**
 * JourneyEntryEventServiceTest
 *
 * Entry decisioning order, and the guarantee that both allowed and blocked
 * decisions are written to the log.
 */
private class JourneyEntryEventServiceTest {
    @TestSetup
    static void seed() {
        insert new Contact_Master__c(
            Email__c = 'ada@example.com', FirstName__c = 'Ada', LastName__c = 'L', TimeZone_Offset__c = 2
        );
    }

    private static Id contact() {
        return [SELECT Id FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1].Id;
    }

    private static void grantConsent() {
        ConsentSyncService.record(contact(), 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');
        ConsentSyncService.record(contact(), 'SMS', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');
    }

    private static JourneyEntryEventService.EntryRequest request() {
        return new JourneyEntryEventService.EntryRequest(
            journeyName = 'Onboarding', entryEvent = 'OrderPlaced', contactId = contact(), reEntryAllowed = true
        );
    }

    @IsTest
    static void incompleteRequestIsBlockedAndNotLogged() {
        Test.startTest();
        JourneyEntryEventService.EntryDecision d = JourneyEntryEventService.evaluate(
            new JourneyEntryEventService.EntryRequest(journeyName = 'Onboarding')
        );
        Test.stopTest();

        Assert.isFalse(d.allowed, 'A request without a contact cannot be evaluated.');
        Assert.areEqual(0, [SELECT COUNT() FROM Journey_Entry_Log__c], 'An unevaluable request writes no log row.');
    }

    @IsTest
    static void entryIsBlockedWithoutMarketingConsent() {
        Test.startTest();
        JourneyEntryEventService.EntryDecision d = JourneyEntryEventService.evaluate(request());
        Test.stopTest();

        Assert.isFalse(d.allowed, 'A marketing journey requires a marketing opt-in.');
        Assert.isFalse(d.consentVerified, 'The block is attributed to consent.');
    }

    @IsTest
    static void entryIsPermittedWithConsentAndHeadroom() {
        grantConsent();

        Test.startTest();
        JourneyEntryEventService.EntryDecision d = JourneyEntryEventService.evaluate(request());
        Test.stopTest();

        Assert.isTrue(d.allowed, 'Consent and frequency headroom permit entry.');
        Assert.isTrue(d.consentVerified, 'Consent was verified as part of the decision.');
    }

    @IsTest
    static void everyAllowedDecisionIsLogged() {
        grantConsent();

        Test.startTest();
        JourneyEntryEventService.evaluate(request());
        List<Journey_Entry_Log__c> logs = [SELECT Decision__c, Journey__c, Consent_Verified__c FROM Journey_Entry_Log__c];
        Test.stopTest();

        Assert.areEqual(1, logs.size(), 'A decision with no log is unanswerable later.');
        Assert.areEqual('Allowed', logs[0].Decision__c, 'The decision is recorded as allowed.');
        Assert.isTrue(logs[0].Consent_Verified__c, 'The log records which gate passed.');
    }

    @IsTest
    static void everyBlockedDecisionIsAlsoLoggedWithItsReason() {
        Test.startTest();
        JourneyEntryEventService.evaluate(request());
        List<Journey_Entry_Log__c> logs = [SELECT Decision__c, Reason__c FROM Journey_Entry_Log__c];
        Test.stopTest();

        Assert.areEqual(1, logs.size(), 'A block is as auditable as an allow.');
        Assert.areEqual('Blocked', logs[0].Decision__c, 'The decision is recorded as blocked.');
        Assert.isTrue(logs[0].Reason__c.contains('consent'), 'The reason names the gate that stopped entry.');
    }

    @IsTest
    static void singleEntryJourneyBlocksASecondEntry() {
        grantConsent();
        JourneyEntryEventService.EntryRequest noReEntry = request();
        noReEntry.reEntryAllowed = false;

        Test.startTest();
        JourneyEntryEventService.evaluate(request());
        JourneyEntryEventService.EntryDecision second = JourneyEntryEventService.evaluate(noReEntry);
        Test.stopTest();

        Assert.isFalse(second.allowed, 'A single-entry journey does not re-enter.');
        Assert.isTrue(second.reason.contains('already entered'), 'The reason names the re-entry rule.');
    }

    @IsTest
    static void reEntryAllowedJourneyReEnters() {
        grantConsent();

        Test.startTest();
        JourneyEntryEventService.evaluate(request());
        JourneyEntryEventService.EntryDecision second = JourneyEntryEventService.evaluate(request());
        Test.stopTest();

        Assert.isTrue(second.allowed, 'A re-entryable journey may re-enter within the cap.');
    }

    @IsTest
    static void frequencyCapBlocksOnceTheCapIsReached() {
        grantConsent();
        List<Marketing_Interaction__c> interactions = new List<Marketing_Interaction__c>();
        for (Integer i = 0; i < JourneyEntryEventService.DEFAULT_CAP_30D; i++) {
            interactions.add(new Marketing_Interaction__c(
                Contact__c = contact(), Channel__c = 'Email', InteractionType__c = 'Send',
                InteractionDate__c = Datetime.now().addDays(-(i + 1)), Marketing__c = true
            ));
        }
        insert interactions;

        Test.startTest();
        JourneyEntryEventService.EntryDecision d = JourneyEntryEventService.evaluate(request());
        Test.stopTest();

        Assert.isFalse(d.allowed, 'The cap is enforced at entry.');
        Assert.isTrue(d.frequencyCapApplied, 'The block is attributed to the frequency cap.');
    }

    @IsTest
    static void recentMarketingCountComesFromTheInteractionGrain() {
        grantConsent();
        insert new Marketing_Interaction__c(
            Contact__c = contact(), Channel__c = 'Email', InteractionType__c = 'Send',
            InteractionDate__c = Datetime.now().addDays(-2), Marketing__c = true
        );
        insert new Marketing_Interaction__c(
            Contact__c = contact(), Channel__c = 'Email', InteractionType__c = 'Open',
            InteractionDate__c = Datetime.now().addDays(-2), Marketing__c = false
        );

        Test.startTest();
        Integer count = JourneyEntryEventService.countRecentMarketingContacts(contact(), 30);
        Test.stopTest();

        Assert.areEqual(1, count, 'Only marketing interactions count toward the cap.');
    }

    @IsTest
    static void quietHoursAreEvaluatedInTheContactTimeZone() {
        // Offset chosen so the local hour falls inside 20:00-08:00.
        Contact_Master__c c = [SELECT Id FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1];
        Integer offset = Datetime.now().hour() >= 8 ? 8 : 12;

        Test.startTest();
        c.TimeZone_Offset__c = offset;
        update c;
        Boolean quiet = JourneyEntryEventService.isWithinQuietHours(c.Id);
        Test.stopTest();

        Integer localHour = Integer.valueOf(Datetime.format(Datetime.now().addHours(offset), 'H'));
        Assert.areEqual(localHour >= 20 || localHour < 8, quiet, 'Quiet hours are the contact local hours 20:00 to 08:00.');
    }
}
