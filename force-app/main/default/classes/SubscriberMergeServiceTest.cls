@IsTest
/**
 * SubscriberMergeServiceTest
 *
 * The merge rules, with emphasis on the two that get argued about: opt-out is
 * terminal, and consent history survives the merge.
 */
private class SubscriberMergeServiceTest {
    @TestSetup
    static void seed() {
        Contact_Master__c crm = new Contact_Master__c(
            Email__c = 'ada@example.com', FirstName__c = 'Ada', LastName__c = 'L', TimeZone_Offset__c = 1
        );
        Contact_Master__c web = new Contact_Master__c(
            Email__c = 'ada@example.com', FirstName__c = 'Ada', LastName__c = 'Lovelace', TimeZone_Offset__c = 5
        );
        insert new List<Contact_Master__c>{ crm, web };
    }

    @IsTest
    static void planPrefersTheSurvivorValues() {
        Contact_Master__c survivor = [SELECT Id, Email__c, LastName__c FROM Contact_Master__c WHERE LastName__c = 'L' LIMIT 1];
        Contact_Master__c duplicate = [SELECT Id, Email__c, LastName__c FROM Contact_Master__c WHERE LastName__c = 'Lovelace' LIMIT 1];

        Test.startTest();
        SubscriberMergeService.MergePlan p = SubscriberMergeService.plan(survivor, duplicate);
        Test.stopTest();

        Assert.isFalse(p.isBlocked, 'A complete pair plans cleanly.');
        Assert.areEqual('L', p.fieldDecisions.get('LastName__c'), 'The survivor value wins the field.');
    }

    @IsTest
    static void planFillsABlankFromTheDuplicate() {
        Contact_Master__c survivor = [SELECT Id, Email__c, MobilePhone__c FROM Contact_Master__c WHERE MobilePhone__c = null LIMIT 1];
        Contact_Master__c duplicate = [SELECT Id, Email__c, MobilePhone__c FROM Contact_Master__c WHERE MobilePhone__c != null LIMIT 1];

        Test.startTest();
        SubscriberMergeService.MergePlan p = SubscriberMergeService.plan(survivor, duplicate);
        Test.stopTest();

        Assert.areNotEquals(null, p.fieldDecisions.get('MobilePhone__c'), 'A blank survivor field is filled from the duplicate.');
    }

    @IsTest
    static void planBlocksAnIncompletePair() {
        Test.startTest();
        SubscriberMergeService.MergePlan p = SubscriberMergeService.plan(new Contact_Master__c(Email__c = 'x@example.com'), null);
        Test.stopTest();

        Assert.isTrue(p.isBlocked, 'A merge needs both records.');
    }

    @IsTest
    static void consentReconciliationReturnsOptedOutWhenAnySourceOptedOut() {
        List<Consent_Preference__c> records = new List<Consent_Preference__c>{
            new Consent_Preference__c(Channel__c = 'Email', Purpose__c = 'Marketing', Status__c = 'OptedIn', CapturedDate__c = Datetime.now()),
            new Consent_Preference__c(Channel__c = 'Email', Purpose__c = 'Marketing', Status__c = 'OptedOut', CapturedDate__c = Datetime.now())
        };

        Test.startTest();
        String resolved = SubscriberMergeService.reconcileConsent(records);
        Test.stopTest();

        Assert.areEqual('OptedOut', resolved, 'The opt-out wins even though the opt-in is present.');
    }

    @IsTest
    static void consentReconciliationIsPendingWhenSourcesDisagree() {
        List<Consent_Preference__c> records = new List<Consent_Preference__c>{
            new Consent_Preference__c(Channel__c = 'Email', Purpose__c = 'Marketing', Status__c = 'OptedIn', CapturedDate__c = Datetime.now()),
            new Consent_Preference__c(Channel__c = 'Email', Purpose__c = 'Marketing', Status__c = 'Pending', CapturedDate__c = Datetime.now())
        };

        Test.startTest();
        String resolved = SubscriberMergeService.reconcileConsent(records);
        Test.stopTest();

        Assert.areEqual('Pending', resolved, 'Agreement is required, not a majority.');
    }

    @IsTest
    static void consentReconciliationIsOptedInWhenAllSourcesAgree() {
        List<Consent_Preference__c> records = new List<Consent_Preference__c>{
            new Consent_Preference__c(Channel__c = 'Email', Purpose__c = 'Marketing', Status__c = 'OptedIn', CapturedDate__c = Datetime.now()),
            new Consent_Preference__c(Channel__c = 'Email', Purpose__c = 'Marketing', Status__c = 'OptedIn', CapturedDate__c = Datetime.now())
        };

        Test.startTest();
        String resolved = SubscriberMergeService.reconcileConsent(records);
        Test.stopTest();

        Assert.areEqual('OptedIn', resolved, 'All sources opted in.');
    }

    @IsTest
    static void applyRepointsHistoryAndDeletesTheDuplicate() {
        Contact_Master__c survivor = [SELECT Id, Email__c FROM Contact_Master__c WHERE LastName__c = 'L' LIMIT 1];
        Contact_Master__c duplicate = [SELECT Id, Email__c FROM Contact_Master__c WHERE LastName__c = 'Lovelace' LIMIT 1];
        Id duplicateId = duplicate.Id;

        insert new Consent_Preference__c(
            Contact__c = duplicateId, Channel__c = 'Email', Purpose__c = 'Marketing',
            Status__c = 'OptedOut', CapturedDate__c = Datetime.now(), Source__c = 'WebBanner'
        );
        insert new Marketing_Interaction__c(
            Contact__c = duplicateId, Channel__c = 'Email', InteractionType__c = 'Open',
            InteractionDate__c = Datetime.now(), Marketing__c = true
        );

        Test.startTest();
        SubscriberMergeService.MergeResult result = SubscriberMergeService.apply(survivor, duplicate);
        Test.stopTest();

        Assert.isTrue(result.merged, 'The merge ran.');
        Assert.areEqual(0, [SELECT COUNT() FROM Contact_Master__c WHERE Id = :duplicateId], 'The duplicate is deleted.');
        Assert.areEqual(1, [SELECT COUNT() FROM Consent_Preference__c WHERE Contact__c = :survivor.Id], 'Consent history is repointed, not destroyed.');
        Assert.areEqual(1, [SELECT COUNT() FROM Marketing_Interaction__c WHERE Contact__c = :survivor.Id], 'Interaction history is repointed.');
    }

    @IsTest
    static void anonymiseRemovesTheIdentityFields() {
        Contact_Master__c c = new Contact_Master__c(Email__c = 'x@example.com', FirstName__c = 'X', MobilePhone__c = '555');

        Test.startTest();
        SubscriberMergeService.anonymise(c);
        Test.stopTest();

        Assert.isNull(c.FirstName__c, 'The given name is removed.');
        Assert.isNull(c.MobilePhone__c, 'The mobile number is removed.');
        Assert.isTrue(c.Duplicate_Flag__c, 'The record is marked as an anonymised duplicate.');
    }
}
