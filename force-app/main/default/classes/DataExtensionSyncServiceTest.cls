@IsTest
/**
 * DataExtensionSyncServiceTest
 *
 * Covers the two properties the sync has to hold: it is key-safe, and it is
 * idempotent. Running the same batch twice must not create a second profile.
 */
private class DataExtensionSyncServiceTest {
    @TestSetup
    static void seed() {
        insert new List<Contact_Master__c>{
            new Contact_Master__c(Email__c = 'ada@example.com', FirstName__c = 'Ada', LastName__c = 'L'),
            new Contact_Master__c(Email__c = 'grace@example.com', FirstName__c = 'Grace', LastName__c = 'H')
        };
    }

    @IsTest
    static void normaliseKeyLowercasesAndStripsPlusAddressing() {
        Test.startTest();
        String a = DataExtensionSyncService.normaliseKey('  Ada+news@Example.COM ');
        Test.stopTest();

        Assert.areEqual('ada@example.com', a, 'Case and plus-addressing are both normalised.');
    }

    @IsTest
    static void emptyBatchIsRejected() {
        Test.startTest();
        DataExtensionSyncService.Result r = DataExtensionSyncService.validate('Feed', new List<Contact_Master__c>());
        Test.stopTest();

        Assert.areEqual('Failed', r.status, 'An empty batch is a failure, not a no-op.');
        Assert.isTrue(String.isNotBlank(r.errorMessage), 'The failure carries a message.');
    }

    @IsTest
    static void batchWithMissingKeyIsRejectedBeforePromotion() {
        List<Contact_Master__c> batch = new List<Contact_Master__c>{
            new Contact_Master__c(FirstName__c = 'No', LastName__c = 'Key')
        };

        Test.startTest();
        DataExtensionSyncService.Result r = DataExtensionSyncService.validate('Feed', batch);
        Test.stopTest();

        Assert.areEqual('Failed', r.status, 'Validation runs before the transformation.');
        Assert.areEqual(1, r.badAddresses, 'The unusable row is counted.');
    }

    @IsTest
    static void duplicateRowsInsideTheBatchAreReportedAsPartial() {
        List<Contact_Master__c> batch = new List<Contact_Master__c>{
            new Contact_Master__c(Email__c = 'ada@example.com'),
            new Contact_Master__c(Email__c = 'ADA@example.com')
        };

        Test.startTest();
        DataExtensionSyncService.Result r = DataExtensionSyncService.validate('Feed', batch);
        Test.stopTest();

        Assert.areEqual('Partial', r.status, 'A batch with internal duplicates is Partial, not Success.');
        Assert.areEqual(1, r.duplicates, 'The second occurrence is the duplicate.');
    }

    @IsTest
    static void syncIsIdempotentAcrossRepeatedRuns() {
        List<Contact_Master__c> batch = new List<Contact_Master__c>{
            new Contact_Master__c(Email__c = 'ada@example.com', LastName__c = 'Lovelace')
        };

        Test.startTest();
        DataExtensionSyncService.Result first = DataExtensionSyncService.sync('Feed', batch);
        DataExtensionSyncService.Result second = DataExtensionSyncService.sync('Feed', batch);
        Integer total = [SELECT COUNT() FROM Contact_Master__c WHERE Email__c = 'ada@example.com'];
        Test.stopTest();

        Assert.areEqual(1, total, 'The second run updated in place instead of inserting a duplicate.');
        Assert.areEqual(first.recordsOut, second.recordsOut, 'Row count is unchanged between runs.');
        Assert.isTrue(second.idempotent, 'The run is recorded as idempotent.');
    }

    @IsTest
    static void everyRunWritesAnAuditRecord() {
        List<Contact_Master__c> batch = new List<Contact_Master__c>{
            new Contact_Master__c(Email__c = 'ada@example.com')
        };

        Test.startTest();
        DataExtensionSyncService.sync('Feed', batch);
        List<Data_Extension_Sync_Log__c> logs = [SELECT Id, RecordsOut__c, Idempotent__c FROM Data_Extension_Sync_Log__c];
        Test.stopTest();

        Assert.areEqual(1, logs.size(), 'A sync with no audit record is not a sync.');
        Assert.areEqual(1, logs[0].RecordsOut__c, 'The audit row counts the records written.');
    }

    @IsTest
    static void rowVarianceIsMeasuredAgainstThePriorRun() {
        Data_Extension_Sync_Log__c prior = new Data_Extension_Sync_Log__c(RecordsOut__c = 100);

        Test.startTest();
        Decimal small = DataExtensionSyncService.rowVariancePct(prior, 103);
        Decimal large = DataExtensionSyncService.rowVariancePct(prior, 40);
        Test.stopTest();

        Assert.areEqual(3, small, 'Three rows out of one hundred is 3 percent.');
        Assert.isTrue(large > 20, 'A 60 percent drop is not a normal day and must be flagged.');
    }

    @IsTest
    static void abnormalRowCountIsFlagged() {
        Data_Extension_Sync_Log__c prior = new Data_Extension_Sync_Log__c(RecordsOut__c = 100);

        Test.startTest();
        Assert.isFalse(DataExtensionSyncService.isAbnormalRowCount(prior, 102), 'A small variance is normal.');
        Assert.isTrue(DataExtensionSyncService.isAbnormalRowCount(prior, 20), 'A large variance is flagged.');
        Test.stopTest();
    }
}
