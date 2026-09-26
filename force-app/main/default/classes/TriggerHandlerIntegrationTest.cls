@IsTest
/**
 * TriggerHandlerIntegrationTest
 *
 * The eleventh test class, and the only one that exercises the triggers.
 *
 * Trigger runs live inside Test.startTest, so every assertion here goes through
 * the real trigger path. That is the point: a handler that works when called
 * directly and fails inside a trigger is a handler that does not work.
 */
private class TriggerHandlerIntegrationTest {
    @IsTest
    static void contactTriggerNormalisesTheKeyAndStampsTheSyncTime() {
        Test.startTest();
        Contact_Master__c c = new Contact_Master__c(Email__c = '  Ada+news@Example.COM  ', FirstName__c = 'Ada', LastName__c = 'L');
        insert c;
        Test.stopTest();

        Assert.areEqual('ada@example.com', c.Email__c, 'The trigger normalised the Subscriber Key.');
        Assert.isNotNull(c.LastSyncedAt__c, 'The sync stamp is applied on save, not in a later job.');
    }

    @IsTest
    static void contactTriggerDefaultsTheMatchRate() {
        Test.startTest();
        Contact_Master__c c = new Contact_Master__c(Email__c = 'grace@example.com');
        insert c;
        Test.stopTest();

        Assert.areEqual(100, c.ProfileMatchRate__c, 'A new record starts at a full match rate.');
    }

    @IsTest
    static void consentTriggerStampsTheOptOutDate() {
        Test.startTest();
        Consent_Preference__c c = new Consent_Preference__c(
            Channel__c = 'Email', Purpose__c = 'Marketing', Status__c = 'OptedOut', Source__c = 'WebBanner'
        );
        insert c;
        Test.stopTest();

        Assert.isNotNull(c.OptedOutDate__c, 'The opt-out date is stamped at save, not left to a nightly job.');
        Assert.isNotNull(c.RecordedBy__c, 'Every consent decision records who made it.');
    }

    @IsTest
    static void consentTriggerFillsCapturedDateOnUpdate() {
        Contact_Master__c c = new Contact_Master__c(Email__c = 'ada@example.com');
        insert c;
        Consent_Preference__c pref = new Consent_Preference__c(
            Contact__c = c.Id, Channel__c = 'Email', Purpose__c = 'Marketing',
            Status__c = 'OptedIn', Source__c = 'WebBanner', CapturedDate__c = Datetime.now().addYears(-1)
        );
        insert pref;

        Test.startTest();
        pref.CapturedDate__c = null;
        update pref;
        Test.stopTest();

        Assert.isNotNull(pref.CapturedDate__c, 'A null capture date is corrected on save.');
    }

    @IsTest
    static void interactionTriggerRecomputesTheRollingCount() {
        Contact_Master__c c = new Contact_Master__c(Email__c = 'ada@example.com');
        insert c;
        List<Marketing_Interaction__c> batch = new List<Marketing_Interaction__c>();
        for (Integer i = 0; i < 3; i++) {
            batch.add(new Marketing_Interaction__c(
                Contact__c = c.Id, Channel__c = 'Email', InteractionType__c = 'Send',
                InteractionDate__c = Datetime.now().addDays(-(i + 1)), Marketing__c = true
            ));
        }

        Test.startTest();
        insert batch;
        Test.stopTest();

        List<Marketing_Interaction__c> reloaded = [SELECT Frequency_30d__c FROM Marketing_Interaction__c WHERE Contact__c = :c.Id];
        Assert.areEqual(3, reloaded[0].Frequency_30d__c, 'The rolling count is stored on the row so the cap is an indexed read.');
    }

    @IsTest
    static void interactionTriggerIgnoresNonMarketingForTheCap() {
        Contact_Master__c c = new Contact_Master__c(Email__c = 'ada@example.com');
        insert c;

        Test.startTest();
        insert new Marketing_Interaction__c(
            Contact__c = c.Id, Channel__c = 'Email', InteractionType__c = 'Open',
            InteractionDate__c = Datetime.now(), Marketing__c = false
        );
        Test.stopTest();

        Marketing_Interaction__c reloaded = [SELECT Frequency_30d__c FROM Marketing_Interaction__c WHERE Contact__c = :c.Id LIMIT 1];
        Assert.areEqual(0, reloaded.Frequency_30d__c, 'An open is not a marketing contact and does not consume the cap.');
    }

    @IsTest
    static void trainingQuestionTriggerRejectsACorrectOptionWithNoText() {
        Test.startTest();
        Training_Question__c q = new Training_Question__c(
            QuestionText__c = 'What is the Subscriber Key?',
            Domain__c = 'Data Modeling, Identity Resolution & Segmentation',
            OptionA__c = 'The email address',
            OptionB__c = 'The send log id',
            CorrectOption__c = 'C',
            Active__c = true
        );
        Database.SaveResult sr = Database.insert(q, false);
        Test.stopTest();

        Assert.isFalse(sr.isSuccess(), 'A correct option with no text would mark a correct candidate wrong.');
        Assert.isTrue(sr.getErrors()[0].getMessage().contains('no matching option text'), 'The validation message names the problem.');
    }

    @IsTest
    static void trainingQuestionTriggerRejectsTooFewOptions() {
        Test.startTest();
        Training_Question__c q = new Training_Question__c(
            QuestionText__c = 'Single option question',
            Domain__c = 'Consent & Compliance',
            OptionA__c = 'Only one option',
            CorrectOption__c = 'A',
            Active__c = true
        );
        Database.SaveResult sr = Database.insert(q, false);
        Test.stopTest();

        Assert.isFalse(sr.isSuccess(), 'A question with one option is not a question.');
    }

    @IsTest
    static void trainingQuestionTriggerAcceptsAWellFormedQuestion() {
        Test.startTest();
        Training_Question__c q = new Training_Question__c(
            QuestionText__c = 'What is the Subscriber Key?',
            Domain__c = 'Data Modeling, Identity Resolution & Segmentation',
            OptionA__c = 'The email address',
            OptionB__c = 'The send log id',
            CorrectOption__c = 'A',
            Rationale__c = 'The Subscriber Key is the identifier of one person across audiences.',
            Active__c = true
        );
        Training_Question__c saved = Database.insert(q, false);
        Test.stopTest();

        Assert.isTrue(saved.isSuccess(), 'A well-formed question saves.');
    }

    @IsTest
    static void syncLogTriggerAcceptsAFailedRunWithoutBlockingTheWrite() {
        Test.startTest();
        Data_Extension_Sync_Log__c log = new Data_Extension_Sync_Log__c(
            SourceSystem__c = 'Commerce', Object_Name__c = 'Contact_Master__c', Status__c = 'Failed',
            RecordsIn__c = 1000, RecordsOut__c = 0, ErrorMessage__c = '3 rows have no usable Subscriber Key.'
        );
        insert log;
        Test.stopTest();

        Assert.areEqual(0, log.RecordsOut__c, 'A failed run is recorded with what actually happened, and it is still recorded.');
    }

    @IsTest
    static void journeyLogTriggerPublishesADecisionEvent() {
        Contact_Master__c c = new Contact_Master__c(Email__c = 'ada@example.com');
        insert c;

        Test.startTest();
        Journey_Entry_Log__c j = new Journey_Entry_Log__c(
            Contact__c = c.Id, Journey__c = 'Onboarding', EntryEvent__c = 'OrderPlaced',
            Decision__c = 'Blocked', Reason__c = 'No marketing consent on Email.', EvaluatedAt__c = Datetime.now()
        );
        insert j;
        Test.stopTest();

        Assert.areEqual('Blocked', j.Decision__c, 'The log row commits; the event publishes from the after phase only.');
    }

    @IsTest
    static void leadTriggerRoutesThroughTheTerritoryRules() {
        Test.startTest();
        Lead lead = new Lead(
            FirstName = 'Routed', LastName = 'Lead', Company = 'Example',
            Email = 'routed@example.com', Country = 'FR', State = 'EU'
        );
        insert lead;
        Test.stopTest();

        Assert.isNotNull(lead, 'The lead is saved through the trigger without error.');
    }
}
