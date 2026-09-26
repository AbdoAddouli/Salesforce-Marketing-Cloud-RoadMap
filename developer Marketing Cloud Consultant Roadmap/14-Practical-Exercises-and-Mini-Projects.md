# 14 · Practical Exercises & Mini-Projects

> Phase 14 of 17 · eight projects, one per skill, all of them deployable in this repo

## How to use this phase

Each project produces a **deployable artifact** in `force-app/main/default`, not
a document. If you cannot deploy it, you have not finished it.

Every project follows the same loop:

1. Read the phase guide it belongs to.
2. Answer the numbered exercise in that phase.
3. Deploy the artifact to a scratch org.
4. Run the test class next to it. A test class per service class, 11 in total.
5. Commit the metadata, not a screenshot.

```bash
sf project deploy start --source-dir force-app --target-org acme-scratch
sf apex run test --test-level RunLocalTests --code-coverage --result-format human --wait 30
```

## The eight projects

| # | Project | Deliverable | Tests |
|---|---|---|---|
| MP-01 | Marketing Cloud account readiness audit | `EmailPreferenceService.cls` + `EmailPreferenceServiceTest.cls` | Consent read/write, suppression precedence |
| MP-02 | Data Extension model for a retail programme | `DataExtensionSyncService.cls` + `SubscriberMergeService.cls` | Key safety, field-level merge survivors |
| MP-03 | Unified profile and identity resolution design | `Data_Extension_Sync_Log__c` + `CampaignMemberSyncService.cls` | Source priority, de-duplication, conflict resolution |
| MP-04 | Deliverability programme | `MarketingCloudIntelligenceExportService.cls` + `scripts/soql/deliverability-triage.soql` | Field allow-list, retention, audit write |
| MP-05 | Consent and compliance programme | `ConsentSyncService.cls` + `Consent_Preference__c` + capture flow | Per-channel state, conflict resolution, tombstone |
| MP-06 | Lifecycle orchestration design | `JourneyEntryEventService.cls` + `Journey_Entry_Log__c` + exit flow | De-duplication, re-entry cooldown, frequency cap |
| MP-07 | SMS consent-aware send gate | `TriggeredSendService.cls` + `scripts/soql/quiet-hours.sql` | Quiet hours, deferral, hard-bounce suppression |
| MP-08 | Agentforce decisioning and reporting | `AgentforceMarketingActionService.cls` + `LeadRoutingForCampaignsService.cls` + reports | Human review gate, routing, consent gate |

## Project briefs

### MP-01 · Account readiness audit

A retail customer has three Business Units, two of which share a dedicated IP, and
a user who holds the Administrator role in all three. Audit the account and
produce the configuration you would standardise: the permission set, the sender
profiles, the send classification, and the missing consent gate.

Deploy: `permissionsets/Marketing_Cloud_Consultant.permissionset-meta.xml`,
`email/` templates.

### MP-02 · Data Extension model

Design the DE set for a retail programme: contacts, orders, consent, and a derived
send DE. Specify keys, retention, and the automation that builds the send DE.
Then implement the key-safe sync and the subscriber merge with field-level
survivor selection.

Deploy: `classes/DataExtensionSyncService.cls`, `classes/SubscriberMergeService.cls`.

### MP-03 · Identity resolution and campaign sync

A customer has three sources with three different identifiers and one duplicate
problem. Define the match rules, the reconciliation rules, and the campaign member
sync with a configured source priority. Every sync writes an audit row.

Deploy: `customMetadata/CampaignMemberSync__mdt`, `objects/Data_Extension_Sync_Log__c`.

### MP-04 · Deliverability programme

Produce the DNS record set for a new sending subdomain, a 14-day warm-up
schedule, and the triage query. Implement the governed extract that feeds
Marketing Cloud Intelligence with a field allow-list and a retention policy.

Deploy: `classes/MarketingCloudIntelligenceExportService.cls`,
`scripts/soql/deliverability-triage.soql`.

### MP-05 · Consent and compliance

Implement per-channel, per-purpose consent with evidence, a capture flow, a
preference centre, and the erasure workflow — including the anonymised suppression
tombstone that must survive the erasure.

Deploy: `objects/Consent_Preference__c`, `classes/ConsentSyncService.cls`,
`flows/Consent_Capture_Preference_Centre.flow-meta.xml`.

### MP-06 · Lifecycle orchestration

Design a welcome program with de-duplication, a 90-day re-entry cooldown, a
conversion exit, and a cross-channel frequency cap. Implement the entry evaluation
so the rules are testable rather than tribal knowledge.

Deploy: `classes/JourneyEntryEventService.cls`, `objects/Journey_Entry_Log__c`,
`flows/Journey_Exit_Sync_To_CRM.flow-meta.xml`.

### MP-07 · SMS consent-aware send gate

Build the gate: SMS consent required, quiet hours evaluated per contact time zone,
deferred rather than dropped, hard-bounced numbers suppressed permanently.

Deploy: `classes/TriggeredSendService.cls`, `scripts/soql/quiet-hours.sql`.

### MP-08 · Agentforce decisioning and reporting

Add an Agentforce-driven next-best-action with a **human review gate** — the
generated content is a proposal until a person approves it. Add lead routing into
campaign membership. Then report on the whole thing.

Deploy: `classes/AgentforceMarketingActionService.cls`,
`classes/LeadRoutingForCampaignsService.cls`,
`reports/Marketing_Cloud_Engagement_Dashboard.report-meta.xml`.

## Definition of done

A project is done when:

- [ ] It deploys to a scratch org without errors.
- [ ] Its test class passes, and coverage is on the business logic, not the
      generated getters.
- [ ] The metadata is in `force-app`, not in a local-only folder.
- [ ] The exercise in the phase guide is answered, and the answer is in
      [15 · Answers & Results](15-Answers-and-Results.md).
- [ ] You can explain the design in three minutes without the docs open.

## Related

- [16 · Real-World Use Cases](16-Real-World-Use-Cases.md) — four full scenarios.
- [17 · Use-Case Solutions](17-Use-Case-Solutions.md) — the recommended answers.
