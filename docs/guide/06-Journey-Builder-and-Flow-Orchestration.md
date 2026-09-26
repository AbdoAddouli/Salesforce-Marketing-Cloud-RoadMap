# 06 · Journey Builder & Flow Orchestration

> Phase 6 of 17 · choose the orchestration from the behaviour, not from the tool you know

## The four mechanisms

| Mechanism | Trigger | Right for | Wrong for |
|---|---|---|---|
| **Journey Builder** (MCE) | Contact enters from a DE / audience | Per-contact lifecycle programs with branching, waits and re-entry rules | Batch sends, nightly data work |
| **Flow** (MCN) | Record-triggered, scheduled or autolaunched | Lifecycle programs on Data 360 profiles; batch scoring | Complex file-based ETL |
| **Automation Studio** (MCE) | Scheduled or triggered | Batch data work, extracts, file transfer, SQL | Real-time per-contact branching |
| **Triggered send** (MCE) | Automation fires | A one-shot send from a DE at a moment in time | Anything with a lifecycle |

The test that settles it in one line:

- Does it need to behave differently **per contact**? → Journey / record-triggered flow.
- Does it need to move **data** on a schedule? → Automation / scheduled flow.
- Is it one send at one moment, with no per-contact logic? → Triggered send.

"Nightly SQL that scores a DE and then a triggered send fires" is an
**automation**, both halves. It is not a Journey: nothing in it is a per-contact
lifecycle program.

## Flow types in Marketing Cloud Next

| Type | Trigger | Use |
|---|---|---|
| **Record-triggered flow** | A record meets entry conditions | Cart abandonment, onboarding, claim registration, event-driven lifecycle |
| **Scheduled flow** | A schedule | Nightly scoring, batch segmentation, periodic re-evaluation |
| **Autolaunched flow** | Invoked by another flow or Apex | Sub-processes, reusable logic |
| **Orchestration** | Multiple flows in sequence with defined start and end | A whole program made of sub-flows |

In MCN, journey-style behaviour is a record-triggered flow whose entry is the
Data 360 contact point (or an Actionable List) for that event. A scheduled flow is
for batch. An autolaunched flow is a sub-process. The Campaign object is the
container that holds the assets, not the trigger.

## Journey canvas mechanics

```text
Entry source → Entry rule → [Wait] → [Decision] → [Treatment] → [Split] → Exit
                    │         │          │            │          │
             de-dup / re-entry   channel   exit criteria   wait + branch
```

| Element | What it does | Trap |
|---|---|---|
| Entry source | The DE / audience the journey can enter from | Changing the entry source mid-program orphans everyone in it |
| Re-entry rules | Allow / never / always re-entry, plus a window | "Never re-enter" plus a permanent DE = one message ever, forever |
| Wait | Delay before the next step | Waits stack: five waits of 3 days is 15 days, and the profile sits in the journey the whole time |
| Decision | Branch on data or a rule | A decision with no default path silently drops contacts |
| Split | Percentage or rule-based fan-out for A/B | Percentages are not stable between versions |
| Exit | Ends the journey, with an exit reason | **Every** lifecycle journey needs a conversion exit |
| Suppression | Contacts removed from the journey | Suppression at entry, not at send |

## The exits everyone forgets

A journey without a conversion exit will keep marketing to people who already
bought. This is the most expensive omission in lifecycle marketing and it appears
in exam scenarios as "contacts who converted should exit immediately".

| Exit type | Trigger | Why it matters |
|---|---|---|
| Conversion exit | Order placed, subscription started, form submitted | Stops the "buy again" message |
| Goal met | Score or engagement threshold reached | Moves the contact to the next program |
| Global suppression | Unsubscribed, complained, on the global suppression list | Stops everything, everywhere |
| Frequency cap exceeded | N contacts in M days across channels | Stops the annoying-month effect |
| Window expiry | 30 days since entry | Bounds the liability of a bad decision |
| Re-entry cooldown | 90 days after exit | Stops the same trigger re-firing immediately |

## Journey vs Automation: the decision table

| Requirement | Journey / record-triggered flow | Automation / scheduled flow |
|---|---|---|
| Send a welcome series per new subscriber | Yes | No |
| Score 2M records nightly | No | Yes |
| Branch on a contact's own data | Yes | Awkward |
| Move a file to FTP and import | No | Yes |
| Wait 3 days between touches | Native wait | Awkward (timing-based, brittle) |
| Re-entry with a cooldown | Native | No |
| A/B test a subject line | Yes (split) | No |
| Data extract for a BI team | No | Yes |

## Cross-channel frequency capping

Two channels chasing the same event within hours is how you lose a phone number.
The cap is a **data requirement**, not a setting: the interaction log has to be
queryable by contact, channel and date window, then applied in the entry rule of
the second channel.

In this repo the journey entry decisions are computed server-side by
`JourneyEntryEventService` and recorded in `Journey_Entry_Log__c`, so a contact who
entered through one path cannot be counted as a fresh entry through another.

## Exam traps

- Choosing Journey for a batch job because the tool is nicer.
- Recommending an automation for a real-time trigger.
- Omitting the conversion exit, which is exactly the "distractor that is actually
  the requirement".
- Treating the Campaign object as a journey entry source.
- Suggesting a flow that writes back to CRM on every contact as a scale answer.

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `force-app/main/default/classes/JourneyEntryEventService.cls` | Entry evaluation: de-duplication, re-entry cooldown, frequency cap |
| `force-app/main/default/objects/Journey_Entry_Log__c/` | One row per entry decision, with the reason it was allowed or blocked |
| `force-app/main/default/flows/Journey_Exit_Sync_To_CRM.flow-meta.xml` | The conversion exit written back to the CRM record |
| `force-app/main/default/flows/Consent_Capture_Preference_Centre.flow-meta.xml` | Consent capture and preference centre update |

## Exercises

- **ex-06-1 · Pick the Orchestration** — six scenarios, with the nearest wrong answer and why it fails.
- **ex-06-2 · Design the Exits** — conversion, re-entry, cooldown and cross-channel suppression.
- **MP-06** in [14 · Practical Exercises](14-Practical-Exercises-and-Mini-Projects.md) is the full lifecycle design.
