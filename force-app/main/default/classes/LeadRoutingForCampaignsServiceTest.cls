@IsTest
/**
 * LeadRoutingForCampaignsServiceTest
 *
 * Territory resolution, the unrouted fallback, and the idempotence guarantee
 * that keeps a re-scored lead on the same owner.
 */
private class LeadRoutingForCampaignsServiceTest {
    private static Lead makeLead(String firstName, String country, String state) {
        return new Lead(
            FirstName = firstName,
            LastName = 'Test',
            Company = 'Example',
            Email = firstName + '@example.com',
            Country = country,
            State = state
        );
    }

    @IsTest
    static void missingLeadIsHandled() {
        Test.startTest();
        LeadRoutingForCampaignsService.Assignment a = LeadRoutingForCampaignsService.route(null);
        Test.stopTest();

        Assert.isFalse(a.changed, 'Nothing is assigned without a lead.');
        Assert.isNotNull(a.reason, 'The no-op is explained.');
    }

    @IsTest
    static void unmatchedTerritoryGoesToTheUnroutedQueue() {
        Lead lead = makeLead('Unmatched', 'JP', null);

        Test.startTest();
        LeadRoutingForCampaignsService.Assignment a = LeadRoutingForCampaignsService.route(lead);
        Test.stopTest();

        Assert.areEqual('Global_Unrouted', a.queueName, 'An unmatched lead is queued for review, not discarded.');
        Assert.isTrue(a.reason.contains('manual review'), 'The fallback is explicit.');
    }

    @IsTest
    static void mostSpecificTerritoryWinsOnPriority() {
        // US/NA appears twice in the rule set; the lower priority number must win.
        Lead lead = makeLead('Territory', 'US', 'NA');

        Test.startTest();
        LeadRoutingForCampaignsService.Assignment a = LeadRoutingForCampaignsService.route(lead);
        Test.stopTest();

        Assert.areEqual('NA_West', a.queueName, 'The lowest priority number resolves first.');
    }

    @IsTest
    static void routingIsIdempotentForTheSameLead() {
        Lead lead = makeLead('Stable', 'FR', 'EU');
        insert lead;

        Test.startTest();
        LeadRoutingForCampaignsService.Assignment first = LeadRoutingForCampaignsService.route(lead);
        LeadRoutingForCampaignsService.Assignment second = LeadRoutingForCampaignsService.route(lead);
        Test.stopTest();

        Assert.areEqual(first.queueName, second.queueName, 'The same lead lands in the same queue.');
        Assert.areEqual(first.assignedToId, second.assignedToId, 'Round robin is derived from the lead id, so it is stable.');
    }

    @IsTest
    static void batchRoutingIsAllOrNoneOff() {
        List<Lead> leads = new List<Lead>{ makeLead('One', 'FR', 'EU'), makeLead('Two', 'JP', null) };
        insert leads;

        Test.startTest();
        List<LeadRoutingForCampaignsService.Assignment> results = LeadRoutingForCampaignsService.routeAll(leads);
        Test.stopTest();

        Assert.areEqual(2, results.size(), 'One unroutable lead does not block the batch.');
    }

    @IsTest
    static void emptyBatchReturnsNoAssignments() {
        Test.startTest();
        List<LeadRoutingForCampaignsService.Assignment> results = LeadRoutingForCampaignsService.routeAll(null);
        Test.stopTest();

        Assert.areEqual(0, results.size(), 'A null batch is an empty result, not an exception.');
    }

    @IsTest
    static void convertedLeadIsNotReassigned() {
        Lead lead = makeLead('Converted', 'FR', 'EU');
        insert lead;
        lead.IsConverted = true;
        update lead;

        Test.startTest();
        Boolean reassign = LeadRoutingForCampaignsService.shouldReassign(lead);
        Test.stopTest();

        Assert.isFalse(reassign, 'A converted lead is left alone.');
    }

    @IsTest
    static void contactedLeadIsNotReassigned() {
        Lead lead = makeLead('Contacted', 'FR', 'EU');
        insert lead;
        lead.Status = 'Working - Contacted';
        update lead;

        Test.startTest();
        Boolean reassign = LeadRoutingForCampaignsService.shouldReassign(lead);
        Test.stopTest();

        Assert.isFalse(reassign, 'A lead already being worked stays with its owner.');
    }

    @IsTest
    static void pickOwnerIsNullWhenTheQueueIsEmpty() {
        Lead lead = makeLead('Empty', 'FR', 'EU');
        insert lead;

        Test.startTest();
        Id owner = LeadRoutingForCampaignsService.pickOwner('No_Such_Queue', lead);
        Test.stopTest();

        Assert.isNull(owner, 'An empty queue returns no owner rather than failing the batch.');
    }
}
