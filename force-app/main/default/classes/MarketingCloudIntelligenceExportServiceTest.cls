@IsTest
/**
 * MarketingCloudIntelligenceExportServiceTest
 *
 * Data Cloud ingestion planning, segment staleness, and the surface
 * distinction the roadmap keeps returning to: where a segment is actually
 * built.
 */
private class MarketingCloudIntelligenceExportServiceTest {
    @TestSetup
    static void seed() {
        insert new Contact_Master__c(Email__c = 'ada@example.com', FirstName__c = 'Ada', LastName__c = 'L');
    }

    @IsTest
    static void eligibleObjectGetsADataCloudIngestionPlan() {
        Test.startTest();
        MarketingCloudIntelligenceExportService.IngestionPlan p =
            MarketingCloudIntelligenceExportService.planIngestion('Contact');
        Test.stopTest();

        Assert.isTrue(p.isEligible, 'Contact is in the ingestion scope.');
        Assert.areEqual('Data Cloud', p.surface, 'Ingestion and resolution are Data Cloud surfaces.');
        Assert.areEqual('Profile tier', p.tier, 'Contact lands in the profile tier.');
    }

    @IsTest
    static void interactionObjectIsAnEventTierIngestion() {
        Test.startTest();
        MarketingCloudIntelligenceExportService.IngestionPlan p =
            MarketingCloudIntelligenceExportService.planIngestion('Marketing_Interaction__c');
        Test.stopTest();

        Assert.areEqual('Event tier', p.tier, 'Interactions are event tier, not profile tier.');
    }

    @IsTest
    static void campaignMemberHasNoIndependentIdentity() {
        Test.startTest();
        MarketingCloudIntelligenceExportService.IngestionPlan p =
            MarketingCloudIntelligenceExportService.planIngestion('CampaignMember');
        Test.stopTest();

        Assert.isTrue(p.isEligible, 'CampaignMember is ingested.');
        Assert.isTrue(p.resolutionRule.contains('unified profile'), 'It joins the profile rather than creating a second identity.');
    }

    @IsTest
    static void outOfScopeObjectIsRejectedWithAReason() {
        Test.startTest();
        MarketingCloudIntelligenceExportService.IngestionPlan p =
            MarketingCloudIntelligenceExportService.planIngestion('Opportunity');
        Test.stopTest();

        Assert.isFalse(p.isEligible, 'An out-of-scope object is not silently ingested.');
        Assert.isTrue(p.reason.contains('not in the ingestion scope'), 'The rejection is explained.');
    }

    @IsTest
    static void eligibilityCheckMatchesThePlan() {
        Test.startTest();
        Assert.isTrue(MarketingCloudIntelligenceExportService.isEligibleForIngestion('Lead'), 'Lead is eligible.');
        Assert.isFalse(MarketingCloudIntelligenceExportService.isEligibleForIngestion('Task'), 'Task is not.');
        Test.stopTest();
    }

    @IsTest
    static void staleSegmentIsReportedAsEmptyRatherThanUsed() {
        Datetime stale = Datetime.now().addDays(-7);

        Test.startTest();
        MarketingCloudIntelligenceExportService.SegmentResult r =
            MarketingCloudIntelligenceExportService.evaluateSegment('High intent', 5000, stale);
        Test.stopTest();

        Assert.isTrue(r.isStale, 'A week-old calculated insight is stale.');
        Assert.areEqual(0, r.memberCount, 'A stale segment is not used. The count is not trusted.');
    }

    @IsTest
    static void freshSegmentIsUsed() {
        Test.startTest();
        MarketingCloudIntelligenceExportService.SegmentResult r =
            MarketingCloudIntelligenceExportService.evaluateSegment('High intent', 5000, Datetime.now());
        Test.stopTest();

        Assert.isFalse(r.isStale, 'A freshly calculated segment is usable.');
        Assert.areEqual(5000, r.memberCount, 'The member count is carried through.');
    }

    @IsTest
    static void neverCalculatedSegmentIsStale() {
        Test.startTest();
        MarketingCloudIntelligenceExportService.SegmentResult r =
            MarketingCloudIntelligenceExportService.evaluateSegment('Never run', 100, null);
        Test.stopTest();

        Assert.isTrue(r.isStale, 'A segment that has never run is stale.');
    }

    @IsTest
    static void unifiedProfileReadReturnsTheResolvedContact() {
        Id contactId = [SELECT Id FROM Contact_Master__c WHERE Email__c = 'ada@example.com' LIMIT 1].Id;

        Test.startTest();
        List<Contact_Master__c> profile = MarketingCloudIntelligenceExportService.readUnifiedProfile(contactId);
        Test.stopTest();

        Assert.areEqual(1, profile.size(), 'One resolved profile.');
        Assert.areEqual('ada@example.com', profile[0].Email__c, 'Read from the resolved profile, not a source object.');
    }

    @IsTest
    static void segmentSurfacesAreDescribed() {
        Test.startTest();
        List<String> surfaces = MarketingCloudIntelligenceExportService.describeSegmentSurfaces();
        Test.stopTest();

        Assert.areEqual(3, surfaces.size(), 'Three distinct surfaces.');
        Assert.isTrue(surfaces[0].contains('calculated insight'), 'Data Cloud is the correct place for a profile-dependent segment.');
    }
}
