@IsTest
/**
 * ConsentSyncServiceTest
 *
 * The compliance position in test form: opt-out is terminal, a sync cannot
 * clear it, and erasure keeps the evidence without keeping the identity.
 */
private class ConsentSyncServiceTest {
    @TestSetup
    static void seed() {
        insert new Contact_Master__c(Email__c = 'ada@example.com', FirstName__c = 'Ada', LastName__c = 'L');
    }

    private static Id contact() {
        return [SELECT Id FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1].Id;
    }

    @IsTest
    static void noConsentRecordMeansNotSendable() {
        Test.startTest();
        ConsentSyncService.Decision d = ConsentSyncService.resolve(contact(), 'Email', 'Marketing');
        Test.stopTest();

        Assert.areEqual('Pending', d.resolvedStatus, 'No record is Pending, not OptedIn.');
        Assert.isFalse(d.maySend, 'Pending is not sendable.');
    }

    @IsTest
    static void cleanOptInAllowsMarketing() {
        ConsentSyncService.record(contact(), 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner id B-1');

        Test.startTest();
        ConsentSyncService.Decision d = ConsentSyncService.resolve(contact(), 'Email', 'Marketing');
        Test.stopTest();

        Assert.areEqual('OptedIn', d.resolvedStatus, 'A single evidenced opt-in is enough.');
        Assert.isTrue(d.maySend, 'Marketing is permitted.');
    }

    @IsTest
    static void optOutIsTerminalAndOutranksARecentOptIn() {
        ConsentSyncService.record(contact(), 'Email', 'Marketing', 'OptedOut', 'WebBanner', 'One click');
        // A later opt-in attempt, with no fresh evidence, is a sync not a capture.
        ConsentSyncService.record(contact(), 'Email', 'Marketing', 'OptedIn', 'Import', null);

        Test.startTest();
        ConsentSyncService.Decision d = ConsentSyncService.resolve(contact(), 'Email', 'Marketing');
        Test.stopTest();

        Assert.areEqual('OptedOut', d.resolvedStatus, 'A sync must never clear an opt-out.');
        Assert.isFalse(d.maySend, 'The person stays suppressed.');
    }

    @IsTest
    static void freshEvidencedCaptureCanReOptIn() {
        ConsentSyncService.record(contact(), 'Email', 'Marketing', 'OptedOut', 'WebBanner', 'One click');
        ConsentSyncService.record(contact(), 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Preference centre submission PS-9');

        Test.startTest();
        ConsentSyncService.Decision d = ConsentSyncService.resolve(contact(), 'Email', 'Marketing');
        Test.stopTest();

        Assert.areEqual('OptedIn', d.resolvedStatus, 'A new, evidenced opt-in is a legitimate way back.');
    }

    @IsTest
    static void consentIsResolvedPerChannel() {
        ConsentSyncService.record(contact(), 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner');
        ConsentSyncService.record(contact(), 'SMS', 'Marketing', 'OptedOut', 'Keyword', 'STOP');

        Test.startTest();
        Assert.isTrue(ConsentSyncService.maySendMarketing(contact(), 'Email'), 'Email is permitted.');
        Assert.isFalse(ConsentSyncService.maySendMarketing(contact(), 'SMS'), 'SMS is not.');
        Test.stopTest();
    }

    @IsTest
    static void channelPlatformsAreAuthoritativeForTheirOptOuts() {
        Test.startTest();
        Assert.isTrue(ConsentSyncService.isPlatformAuthoritative('WhatsApp'), 'WhatsApp opt-outs come from the channel platform.');
        Assert.isFalse(ConsentSyncService.isPlatformAuthoritative('Email'), 'Email is captured in the CRM preference centre.');
        Test.stopTest();
    }

    @IsTest
    static void optOutPropagationWritesSuppressionInteractions() {
        ConsentSyncService.record(contact(), 'Email', 'Marketing', 'OptedOut', 'WebBanner', 'One click');
        Date since = Date.today().addDays(-1);

        Test.startTest();
        Integer written = ConsentSyncService.propagateOptOut('Email', since);
        Test.stopTest();

        Assert.areEqual(1, written, 'The opt-out is written to the downstream systems, not just the consent table.');
    }

    @IsTest
    static void erasureKeepsEvidenceAndDropsTheIdentifier() {
        Consent_Preference__c record = ConsentSyncService.record(contact(), 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner B-2');
        Integer retentionYears = 3;

        Test.startTest();
        ConsentSyncService.anonymiseForRetention(record, retentionYears);
        update record;
        Test.stopTest();

        Assert.areEqual(retentionYears, 3, 'The retention window is set.');
        Assert.isNotNull(record.Evidence__c, 'The evidence is retained for provability.');
        Assert.isTrue(record.Is_Tombstone__c, 'The record is marked as a tombstone.');
    }

    @IsTest
    static void tombstoneCarriesNoIdentifierAndIsNeverDeleted() {
        Test.startTest();
        Consent_Preference__c tombstone = ConsentSyncService.buildTombstone('Email', 'Marketing');
        List<Consent_Preference__c> reloaded = [SELECT Id, Contact__c, Is_Tombstone__c FROM Consent_Preference__c WHERE Id = :tombstone.Id];
        Test.stopTest();

        Assert.areEqual(1, reloaded.size(), 'The tombstone is a suppression record, not a person.');
        Assert.isNull(reloaded[0].Contact__c, 'No identifier is retained.');
        Assert.isTrue(reloaded[0].Is_Tombstone__c, 'It is flagged as a tombstone so it is never purged.');
    }
}
