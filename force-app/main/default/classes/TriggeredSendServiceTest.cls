@IsTest
/**
 * TriggeredSendServiceTest
 *
 * A triggered send gets the same gate as a journey. The tombstone test is the
 * one that matters: a suppression record must never be sendable.
 */
private class TriggeredSendServiceTest {
    @TestSetup
    static void seed() {
        insert new List<Contact_Master__c>{
            new Contact_Master__c(Email__c = 'ada@example.com', FirstName__c = 'Ada', LastName__c = 'L'),
            new Contact_Master__c(Email__c = 'tom@example.com', FirstName__c = 'Tom', LastName__c = 'R')
        };
    }

    private static Id contact(String email) {
        return [SELECT Id FROM Contact_Master__c WHERE Email__c = :email LIMIT 1].Id;
    }

    @IsTest
    static void nullSubscriberIsNotSendable() {
        Test.startTest();
        TriggeredSendService.SendPlan p = TriggeredSendService.planSend(null, null, 'Email');
        Test.stopTest();

        Assert.isFalse(p.isSendable, 'No subscriber, no send.');
    }

    @IsTest
    static void contactWithoutConsentIsSuppressed() {
        Contact_Master__c c = [SELECT Id, Email__c FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1];

        Test.startTest();
        TriggeredSendService.SendPlan p = TriggeredSendService.planSend(null, c, 'Email');
        Test.stopTest();

        Assert.isFalse(p.isSendable, 'No consent, no send.');
        Assert.isTrue(p.suppressionReasons[0].contains('No marketing consent'), 'The reason is recorded.');
    }

    @IsTest
    static void tombstoneIsNeverSendable() {
        Contact_Master__c c = [SELECT Id, Email__c FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1];
        c.Duplicate_Flag__c = true;
        update c;
        ConsentSyncService.record(c.Id, 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');

        Test.startTest();
        TriggeredSendService.SendPlan p = TriggeredSendService.planSend(null, c, 'Email');
        Test.stopTest();

        Assert.isFalse(p.isSendable, 'A tombstone outranks an opt-in record.');
        Assert.isTrue(String.join(p.suppressionReasons, ' ').contains('tombstone'), 'The tombstone reason is explicit.');
    }

    @IsTest
    static void doNotMarketFlagSuppresses() {
        Contact_Master__c c = [SELECT Id, Email__c FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1];
        c.DoNotMarket__c = true;
        update c;
        ConsentSyncService.record(c.Id, 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');

        Test.startTest();
        TriggeredSendService.SendPlan p = TriggeredSendService.planSend(null, c, 'Email');
        Test.stopTest();

        Assert.isFalse(p.isSendable, 'The profile-level flag suppresses the send.');
    }

    @IsTest
    static void consentedContactWithHeadroomIsSendable() {
        Contact_Master__c c = [SELECT Id, Email__c FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1];
        ConsentSyncService.record(c.Id, 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');

        Test.startTest();
        TriggeredSendService.SendPlan p = TriggeredSendService.planSend(null, c, 'Email');
        Test.stopTest();

        Assert.isTrue(p.isSendable, 'Consent and headroom permit the send.');
        Assert.areEqual('ada@example.com', p.subscriberKey, 'The Subscriber Key is set explicitly.');
    }

    @IsTest
    static void sendClassDiffersByChannel() {
        Contact_Master__c c = [SELECT Id, Email__c FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1];
        ConsentSyncService.record(c.Id, 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');
        ConsentSyncService.record(c.Id, 'SMS', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');

        Test.startTest();
        String emailClass = TriggeredSendService.planSend(null, c, 'Email').sendClass;
        String smsClass = TriggeredSendService.planSend(null, c, 'SMS').sendClass;
        Test.stopTest();

        Assert.areEqual('Default', emailClass, 'Email uses the default send class.');
        Assert.areEqual('MobilePush/CloudMessaging', smsClass, 'SMS uses the mobile send class.');
    }

    @IsTest
    static void batchSeparatesSubmittedFromSuppressed() {
        Contact_Master__c ada = [SELECT Id, Email__c FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1];
        Contact_Master__c tom = [SELECT Id, Email__c FROM Contact_Master__c WHERE Email__c = 'tom@example.com' LIMIT 1];
        ConsentSyncService.record(ada.Id, 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');

        Test.startTest();
        TriggeredSendService.BatchResult r = TriggeredSendService.planBatch(null, new List<Contact_Master__c>{ ada, tom }, 'Email');
        Test.stopTest();

        Assert.areEqual(1, r.submitted, 'One contact is sendable.');
        Assert.areEqual(1, r.suppressed, 'One contact is suppressed.');
        Assert.isTrue(!r.reasons.isEmpty(), 'Each suppression carries its reason.');
    }

    @IsTest
    static void nullBatchIsHandled() {
        Test.startTest();
        TriggeredSendService.BatchResult r = TriggeredSendService.planBatch(null, null, 'Email');
        Test.stopTest();

        Assert.areEqual(0, r.submitted, 'A null batch submits nothing.');
    }

    @IsTest
    static void sendableQueryExcludesSuppressionFlags() {
        Test.startTest();
        String query = TriggeredSendService.suppressionQuery();
        Test.stopTest();

        Assert.isTrue(query.contains('Duplicate_Flag__c = true'), 'Tombstones are in the suppression list.');
        Assert.isTrue(query.contains('DoNotMarket__c = true'), 'The global flag is in the suppression list.');
    }

    @IsTest
    static void sendableQueryJoinsConsentBecauseConsentIsAChildRecord() {
        Test.startTest();
        List<Contact_Master__c> sendable = TriggeredSendService.querySendable('Email', 'Marketing');
        Test.stopTest();

        Assert.areEqual(0, sendable.size(), 'No consent has been granted yet, so the query returns nobody.');
    }

    @IsTest
    static void sendableQueryReturnsConsentedContactsOnly() {
        Id contactId = contact('ada@example.com');
        ConsentSyncService.record(contactId, 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');

        Test.startTest();
        List<Contact_Master__c> sendable = TriggeredSendService.querySendable('Email', 'Marketing');
        Test.stopTest();

        Assert.areEqual(1, sendable.size(), 'The consented contact is returned by the child-record join.');
    }
}
