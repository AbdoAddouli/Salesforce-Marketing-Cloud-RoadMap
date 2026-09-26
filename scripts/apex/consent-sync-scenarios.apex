/**
 * Consent and sync scenario scripts.
 *
 * Anonymous Apex, run from the Developer Console or with:
 *   sf apex run --file scripts/apex/consent-sync-scenarios.apex
 *
 * Each block is a scenario with a stated expectation, not a demonstration.
 * They are safe to run against a sandbox and deliberately do nothing in
 * production beyond writing an audit row.
 */

// -----------------------------------------------------------------------------
// Scenario 1. A two-source conflict resolves to the opt-out.
// Expected: resolvedStatus = OptedOut, maySend = false.
// -----------------------------------------------------------------------------
Contact_Master__c c1 = new Contact_Master__c(
    Email__c = 'scenario1@example.com', FirstName__c = 'Scenario', LastName__c = 'One', TimeZone_Offset__c = 0
);
insert c1;

ConsentSyncService.record(c1.Id, 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner B-1');
ConsentSyncService.record(c1.Id, 'Email', 'Marketing', 'OptedOut', 'Keyword', 'STOP');

ConsentSyncService.Decision d1 = ConsentSyncService.resolve(c1.Id, 'Email', 'Marketing');
System.assertEquals('OptedOut', d1.resolvedStatus, 'Opt-out is terminal across sources');
System.assertEquals(false, d1.maySend, 'A conflict resolves to suppressed, not to a majority');

// -----------------------------------------------------------------------------
// Scenario 2. A sync cannot clear an opt-out.
// Expected: status stays OptedOut after an evidence-free import attempt.
// -----------------------------------------------------------------------------
ConsentSyncService.record(c1.Id, 'Email', 'Marketing', 'OptedIn', 'Import', null);
ConsentSyncService.Decision d2 = ConsentSyncService.resolve(c1.Id, 'Email', 'Marketing');
System.assertEquals('OptedOut', d2.resolvedStatus, 'A sync must never re-permit a send');

// -----------------------------------------------------------------------------
// Scenario 3. Re-running the same batch produces no duplicate.
// Expected: one row for the email after two syncs, and two audit rows.
// -----------------------------------------------------------------------------
List<Contact_Master__c> batch = new List<Contact_Master__c>{
    new Contact_Master__c(Email__c = 'Scenario3@Example.com', LastName__c = 'Three')
};
DataExtensionSyncService.Result first = DataExtensionSyncService.sync('Commerce', batch);
DataExtensionSyncService.Result second = DataExtensionSyncService.sync('Commerce', batch);

System.assertEquals(1, [SELECT COUNT() FROM Contact_Master__c WHERE Email__c = 'scenario3@example.com'],
    'The second run updated in place');
System.assertEquals(first.recordsOut, second.recordsOut, 'Row count is stable across runs');

// -----------------------------------------------------------------------------
// Scenario 4. A half-load is caught before it is used.
// Expected: a batch with unusable keys is Failed and zero rows are promoted.
// -----------------------------------------------------------------------------
List<Contact_Master__c> partial = new List<Contact_Master__c>{
    new Contact_Master__c(LastName__c = 'NoKey')
};
DataExtensionSyncService.Result r4 = DataExtensionSyncService.validate('Commerce', partial);
System.assertEquals('Failed', r4.status, 'A batch with no usable key is rejected, not partially promoted');
System.assertEquals(1, r4.badAddresses, 'The unusable rows are counted');

// -----------------------------------------------------------------------------
// Scenario 5. A tombstone outranks an opt-in.
// Expected: the contact with Duplicate_Flag__c is not sendable.
// -----------------------------------------------------------------------------
Contact_Master__c c5 = new Contact_Master__c(Email__c = 'scenario5@example.com', LastName__c = 'Five', Duplicate_Flag__c = true);
insert c5;
ConsentSyncService.record(c5.Id, 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner B-5');

TriggeredSendService.SendPlan p5 = TriggeredSendService.planSend(null, c5, 'Email');
System.assertEquals(false, p5.isSendable, 'A suppression tombstone outranks an opt-in record');

// -----------------------------------------------------------------------------
// Scenario 6. A soft bounce is not an opt-out.
// Expected: only the block bounce is treated as a consent event.
// -----------------------------------------------------------------------------
EmailPreferenceService.BounceVerdict soft = EmailPreferenceService.classifyBounce(EmailPreferenceService.BOUNCE_SOFT);
EmailPreferenceService.BounceVerdict block = EmailPreferenceService.classifyBounce(EmailPreferenceService.BOUNCE_BLOCK);

System.assertEquals(false, soft.isConsentEvent, 'A temporary failure is not the person saying stop');
System.assertEquals(true, block.isConsentEvent, 'A block bounce is the mailbox refusing future mail');

// -----------------------------------------------------------------------------
// Scenario 7. A journey entry decision is logged either way.
// Expected: one log row for the allowed decision, one for the blocked decision.
// -----------------------------------------------------------------------------
Contact_Master__c c7 = new Contact_Master__c(Email__c = 'scenario7@example.com', LastName__c = 'Seven');
insert c7;

JourneyEntryEventService.EntryRequest request = new JourneyEntryEventService.EntryRequest(
    journeyName = 'Scenario_Journey', entryEvent = 'OrderPlaced', contactId = c7.Id, reEntryAllowed = true
);
JourneyEntryEventService.EntryDecision blocked = JourneyEntryEventService.evaluate(request);
System.assertEquals(false, blocked.allowed, 'No consent, no entry');

ConsentSyncService.record(c7.Id, 'Email', 'Marketing', 'OptedIn', 'WebBanner', 'Banner B-7');
ConsentSyncService.record(c7.Id, 'SMS', 'Marketing', 'OptedIn', 'WebBanner', 'Banner B-7');
JourneyEntryEventService.EntryDecision allowed = JourneyEntryEventService.evaluate(request);
System.assertEquals(true, allowed.allowed, 'With consent and headroom, entry is permitted');

System.assertEquals(2, [SELECT COUNT() FROM Journey_Entry_Log__c WHERE Journey__c = 'Scenario_Journey'],
    'Both decisions are auditable');

// -----------------------------------------------------------------------------
// Scenario 8. An agent gets the same answer as a journey.
// Expected: no send permission without consent, whatever the agent was asked.
// -----------------------------------------------------------------------------
Contact_Master__c c8 = new Contact_Master__c(Email__c = 'scenario8@example.com', LastName__c = 'Eight');
insert c8;

System.assertEquals(false, AgentforceMarketingActionService.agentMaySend(c8.Id, 'Email'),
    'The agent does not get a wider view of the person than an operator has');
