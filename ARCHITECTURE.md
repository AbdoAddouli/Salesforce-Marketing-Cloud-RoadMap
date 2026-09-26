# Architecture

Reference SFDX project for the Marketing Cloud Consultant Academy. It is a
teaching artifact first: every decision below is there because it is the answer
to a question the curriculum asks, and the reason is written next to it.

Nothing here has been deployed. There is no connected org, so nothing here has
been proven to run. Treat it as a worked reference, not a production system.

## What this project is modelling

Marketing Cloud Engagement has no custom object model, so this project mirrors
its concepts onto CRM objects. That mapping is the whole point of the design:

| Marketing Cloud concept | CRM representation | Why |
| --- | --- | --- |
| Data Extension | `Contact_Master__c` plus query results | A DE is a table with a Subscriber Key. An object is the only place a key can be unique. |
| Subscriber Key | `Contact_Master__c.Email__c`, unique | The key has to be enforced, not assumed. |
| Consent Management / suppression list | `Consent_Preference__c` | Consent is per channel and per purpose, with evidence and a terminal opt-out. |
| Send log | `Marketing_Interaction__c` | The frequency cap needs a per-contact, per-interaction grain. A row per campaign cannot produce it. |
| Journey entry decisioning | `Journey_Entry_Log__c` | Both allowed and blocked decisions are recorded with a reason. |
| Import / query audit | `Data_Extension_Sync_Log__c` | Row counts in, out, duplicates and failures, per run. |
| Question bank | `Training_Question__c` | The mock exam's bank, versioned beside the blueprint it is measured against. |

## Design rules

These are the invariants the tests exist to protect. If a change breaks one,
the test should fail before review does.

1. **Opt-out is terminal.** No recency rule, no source priority, and no
   evidence-free import ever clears an opt-out. Only a new, evidenced opt-in
   from the person does.
   `ConsentSyncService.record`, `SubscriberMergeService.reconcileConsent`.
2. **A tombstone never sends.** An erased person keeps a suppression record with
   no identifier. Deleting the tombstone lets the next ingest rebuild the
   profile and the person is messaged again.
   `TriggeredSendService.planSend`, `ConsentSyncService.buildTombstone`.
3. **Frequency cap is computed from the interaction grain.** Not from campaign
   membership, and not per journey.
   `JourneyEntryEventService.countRecentMarketingContacts`.
4. **Every decision is logged, both outcomes.** A block with no reason is as
   unauditable as an allow.
   `JourneyEntryEventService.evaluate`.
5. **Syncs are idempotent and key-safe.** Running a batch twice is the same as
   running it once, and a feed without a key is rejected rather than promoted.
   `DataExtensionSyncService.sync`.
6. **Quiet hours use the contact's time zone**, not the business unit's.
   `JourneyEntryEventService.isWithinQuietHours`.
7. **A bounce is not a consent event.** Only a block bounce is. Suppressing on a
   soft bounce shrinks a consented audience for no reason.
   `EmailPreferenceService.classifyBounce`.
8. **Direction of truth, per field, per sync.** Otherwise the CRM and the
   engagement layer update each other on a timer forever.
   `CampaignMemberSyncService`, `CampaignMemberSync__mdt`.
9. **An agent gets no wider view than an operator.** Consent applies to agents.
   `AgentforceMarketingActionService`.
10. **Triggers delegate.** All trigger logic lives in
    `MarketingCloudTriggerHandler`, so it is testable and reusable.

## Layers

```
force-app/main/default/
├── objects/                    6 custom objects + 4 fields on Campaign
├── customMetadata/             MC_Config__mdt, CampaignMemberSync__mdt,
│                               Certification_Setting__mdt
├── classes/                    10 services + 1 handler + 11 test classes
├── triggers/                   7 triggers, one call each
├── flows/                      Consent_Capture_Preference_Centre (screen),
│                               Journey_Exit_Sync_To_CRM (auto-launched)
├── platformEvents/             Journey_Entry_Decision__e
├── email/                      Preference_Change_Confirmation,
│                               Address_Undeliverable_Notice
├── reports/ dashboards/        Engagement_By_Channel,
│                               Journey_Entry_Block_Reasons, Marketing_Engagement
├── lwc/                        consentPreferenceCentre, journeyDecisionMonitor
├── permissionsets/             Marketing_Cloud_User
├── sharingrules/               Marketing_Cloud_Access
└── approvalProcesses/          Campaign_Launch_Approval
```

## Service map

| Service | Responsibility | Not its job |
| --- | --- | --- |
| `DataExtensionSyncService` | Validate and upsert an audience batch; row-count variance | Deciding who is sendable |
| `SubscriberMergeService` | Field-level survivor selection, consent reconciliation, merge apply | Consent capture |
| `ConsentSyncService` | Consent resolution per channel and purpose; opt-out propagation; tombstones | Deliverability classification |
| `EmailPreferenceService` | Preference read/write, global unsubscribe, bounce taxonomy | Journey entry |
| `JourneyEntryEventService` | Consent, frequency cap, re-entry, quiet hours, decision log | Sending |
| `LeadRoutingForCampaignsService` | Territory resolution and round robin | Campaign membership |
| `CampaignMemberSyncService` | Direction of truth between CRM and engagement | Consent |
| `MarketingCloudIntelligenceExportService` | Data Cloud ingestion planning, segment staleness | Segment definition |
| `AgentforceMarketingActionService` | Action allow-list, confirmations, send gate | Sending directly |
| `TriggeredSendService` | Suppression and consent gate for triggered sends | Journey logic |

## Data flows

**Import to send.** Feed → `DataExtensionSyncService.validate` (rejects
unusable keys) → `DataExtensionSyncService.sync` (idempotent upsert) →
`Data_Extension_Sync_Log__c` → consent gate → `TriggeredSendService` → send.

**Journey entry.** Entry event → `JourneyEntryEventService.evaluate` → decision
written to `Journey_Entry_Log__c` → `Journey_Entry_Decision__e` published →
`Journey_Exit_Sync_To_CRM` writes the outcome to `Contact_Master__c`.

**Consent change.** Preference centre → `Consent_Capture_Preference_Centre` flow
or `consentPreferenceCentre` LWC → `ConsentSyncService.record` → opt-out
propagation to downstream systems → next send is suppressed.

## Testing

11 test classes, 80+ assertions, no mocks. Coverage follows the rules above
rather than a percentage target: the tests that matter here are the ones that
prove a suppressed contact cannot be messaged, and that running a sync twice
does not create a second profile.

Run them in an org with the project deployed. `npm test` covers the LWC only and
needs `node_modules`, which is not installed in this checkout.

## Certification metadata

`Certification_Setting__mdt` holds one record per exam, and each record states
where its numbers came from.

The **Marketing Cloud Next Consultant** record is verified: `Is_Verified__c` is
`true`, and the pass mark (72%) and empty prerequisite come from the official
Salesforce Help exam guide, article `005387657`, rather than from working notes.

The **Marketing Cloud Engagement Consultant** record is deliberately still
`Is_Verified__c = false`. Its prerequisite is confirmed on the official Trailhead
credential page, but the 67% pass mark is only reported by third-party sources,
and Salesforce does not publish it. It stays unverified until an official exam
guide is found.
