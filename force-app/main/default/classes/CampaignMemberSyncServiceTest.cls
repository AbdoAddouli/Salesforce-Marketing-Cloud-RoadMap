@IsTest
/**
 * CampaignMemberSyncServiceTest
 *
 * Direction-of-truth rules. The test that matters is the one proving a
 * CRM-owned status is never written back, because that is what stops the
 * two systems looping on a timer forever.
 */
private class CampaignMemberSyncServiceTest {
    @TestSetup
    static void seed() {
        Campaign c = new Campaign(Name = 'Autumn');
        insert c;
        List<Contact> contacts = new List<Contact>{
            new Contact(LastName = 'One', Email = 'one@example.com'),
            new Contact(LastName = 'Two', Email = 'two@example.com')
        };
        insert contacts;
        insert new List<CampaignMember>{
            new CampaignMember(CampaignId = c.Id, ContactId = contacts[0].Id, Status = 'Sent'),
            new CampaignMember(CampaignId = c.Id, ContactId = contacts[1].Id, Status = 'Responded')
        };
    }

    @IsTest
    static void nullBatchProducesEmptyPayload() {
        Test.startTest();
        List<CampaignMember> payload = CampaignMemberSyncService.buildPushPayload(null, null);
        Test.stopTest();

        Assert.areEqual(0, payload.size(), 'A null batch is an empty payload.');
    }

    @IsTest
    static void unchangedRowsAreNotRepushed() {
        List<CampaignMember> members = [SELECT Id, CampaignId, ContactId, Status, LastModifiedDate FROM CampaignMember];
        Datetime future = Datetime.now().addDays(1);

        Test.startTest();
        List<CampaignMember> payload = CampaignMemberSyncService.buildPushPayload(members, future);
        Test.stopTest();

        Assert.areEqual(0, payload.size(), 'Rows untouched since the last run are skipped. This is what stops re-import churn.');
    }

    @IsTest
    static void changedRowsArePushed() {
        List<CampaignMember> members = [SELECT Id, CampaignId, ContactId, Status, LastModifiedDate FROM CampaignMember];

        Test.startTest();
        List<CampaignMember> payload = CampaignMemberSyncService.buildPushPayload(members, Datetime.now().addDays(-1));
        Test.stopTest();

        Assert.areEqual(2, payload.size(), 'Both members moved since yesterday.');
    }

    @IsTest
    static void crmOwnedStatusIsNeverPulledBackFromEngagement() {
        List<CampaignMember> updates = new List<CampaignMember>{
            new CampaignMember(Id = [SELECT Id FROM CampaignMember LIMIT 1].Id, Status = 'Sent')
        };

        Test.startTest();
        CampaignMemberSyncService.SyncResult r = CampaignMemberSyncService.pull(updates);
        Test.stopTest();

        Assert.areEqual(0, r.pulledFromEngagement, 'Sent is CRM-owned. Writing it back closes the loop.');
        Assert.areEqual(1, r.skipped, 'The skipped row is counted.');
        Assert.isTrue(!r.notes.isEmpty(), 'The skip is explained, not silent.');
    }

    @IsTest
    static void engagementOwnedStatusIsPulledBack() {
        List<CampaignMember> updates = new List<CampaignMember>{
            new CampaignMember(Id = [SELECT Id FROM CampaignMember LIMIT 1].Id, Status = 'Responded')
        };

        Test.startTest();
        CampaignMemberSyncService.SyncResult r = CampaignMemberSyncService.pull(updates);
        Test.stopTest();

        Assert.areEqual(1, r.pulledFromEngagement, 'Responded is engagement-owned and is written back.');
    }

    @IsTest
    static void engagementOwnershipIsExplicit() {
        Test.startTest();
        Assert.isTrue(CampaignMemberSyncService.isEngagementOwned('Responded'), 'Responded is engagement-owned.');
        Assert.isTrue(CampaignMemberSyncService.isEngagementOwned('Engaged'), 'Engaged is engagement-owned.');
        Assert.isFalse(CampaignMemberSyncService.isEngagementOwned('Sent'), 'Sent is CRM-owned.');
        Test.stopTest();
    }

    @IsTest
    static void equalCountsProduceNoVariance() {
        Id campaignId = [SELECT CampaignId FROM CampaignMember LIMIT 1].CampaignId;

        Test.startTest();
        List<String> variances = CampaignMemberSyncService.reconcileCounts(campaignId, 100, 100);
        Test.stopTest();

        Assert.areEqual(0, variances.size(), 'Agreement produces no work.');
    }

    @IsTest
    static void smallCountVarianceIsReportedWithoutEscalation() {
        Id campaignId = [SELECT CampaignId FROM CampaignMember LIMIT 1].CampaignId;

        Test.startTest();
        List<String> variances = CampaignMemberSyncService.reconcileCounts(campaignId, 100, 97);
        Test.stopTest();

        Assert.areEqual(1, variances.size(), 'The variance is reported.');
        Assert.isFalse(variances[0].contains('Above 5%'), 'Three percent is within tolerance.');
    }

    @IsTest
    static void largeCountVarianceIsEscalated() {
        Id campaignId = [SELECT CampaignId FROM CampaignMember LIMIT 1].CampaignId;

        Test.startTest();
        List<String> variances = CampaignMemberSyncService.reconcileCounts(campaignId, 100, 40);
        Test.stopTest();

        Assert.isTrue(variances[0].contains('Above 5%'), 'A 60 percent gap means the two systems disagree on entry criteria.');
    }

    @IsTest
    static void pullWithNoUpdatesIsANoOp() {
        Test.startTest();
        CampaignMemberSyncService.SyncResult r = CampaignMemberSyncService.pull(null);
        Test.stopTest();

        Assert.areEqual(0, r.membersRead, 'Nothing to read.');
        Assert.areEqual(0, r.pulledFromEngagement, 'Nothing to write.');
    }
}
