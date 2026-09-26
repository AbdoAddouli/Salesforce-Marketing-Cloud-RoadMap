# 02 · The Subscriber & Data Extension Model

> Phase 2 of 17 · the MCE data model is relational, and the keys decide everything

## The mental model

Marketing Cloud Engagement is **shared-nothing**. There is no shared contact
table. A Contact in Contact Builder is a row in the system data extension; every
Data Extension you create holds its own copy of whatever attributes it needs. The
only thing that ties records together across Data Extensions is the **Subscriber
Key**.

That single design decision explains most MCE data-modelling questions on the
exam and most MCE data disasters in production.

## Data Extension types

| Type | Send log | Relationship | Use for |
|---|---|---|---|
| Standard | Optional | None | Attribute storage, staging, most custom data |
| Data Extension for List Management | Yes (list) | None | Email list / newsletter sends with per-list unsubscribe state |
| Data Extension for Enterprise | Optional | None | Very large send populations |
| Salesforce Account/Lead/Contact sync | Yes | Linked to CRM objects | CRM-sourced data, no duplicate storage |
| Data Relationships | n/a | Parent/child | Model a relational structure inside MCE |
| Audience (Data Extension based) | n/a | n/a | Ad-platform audiences, 2018 vintage, still the mechanism for some paid syncs |

**Data Relationships are the answer to "how do I model this in MCE".** They are
virtual relationships between Data Extensions: you define a parent, a child and a
relationship field. No data is moved and no keys are copied, but you can
parent/child query like you would in Salesforce.

## Keys: the two decisions that ruin projects

1. **Primary key** — the uniqueness of a row inside the Data Extension.
2. **Subscriber key** — the value that identifies the same human across Data
   Extensions. Defaults to the primary key unless you set it explicitly.

| Situation | Primary key | Subscriber key | Why |
|---|---|---|---|
| Contact attributes | SubscriberKey = EmailAddress | EmailAddress | One row per human, the human is the row |
| Orders | OrderId | ContactEmail | Multiple rows per human, identified by contact |
| Consent / preference | SubscriberKey = EmailAddress | EmailAddress | Same human, different topic |
| Send log | System generated | n/a | Never editable, never used for matching |
| Staging import | Row number or surrogate | **Do not set** | The staging file is not an audience yet |

The trap: a Data Extension with the right primary key and **no subscriber key**
silently creates a second profile of the same person. Journey entry sources and
suppression lists then disagree about who that person is. This is the "merge
field renders empty for 8% of recipients" bug, the "journey will not enter
contacts who are definitely in the entry DE" bug, and the "why is this person
being emailed twice" bug.

## Normalised or denormalised

| Model | Shape | Pros | Cons |
|---|---|---|---|
| Denormalised | One wide attribute DE with everything on the row | Fast, simple sends | Wide updates, duplicate values, painful to maintain |
| Normalised | Contact + attribute + consent + engagement DEs, joined by SubscriberKey | One source per attribute, clean consent model | Requires a SQL activity or relationship to reassemble |

Default to **normalised for anything regulated** (consent, PII, anything
provable) and consider **denormalised for a send DE**, which is a derived,
rebuildable copy built by a query activity.

## Retention is a design decision, not a default

| Data Extension | Retention | Reason |
|---|---|---|
| Preference / consent | **Never purge** | It is the evidence of what the customer agreed to. Deleting it destroys the compliance record. |
| Contact attributes | 3 years rolling | Beyond that the attributes are not useful and are harder to justify holding |
| Send log DE | 3 months (via Data Extension policy) | Volume explodes; the standard send log view already gives you delivery data |
| Import / staging | 30 days | Debugging window only |
| Journey / participation logs | 13 months | Enough for annual analysis, not enough to become a second system of record |
| Product / catalogue DE | As needed | Rarely changes |

Retention policies are set **on the Data Extension**, not per send. Setting
retention on a send log means paying to store rows you can already query from the
built-in views.

## Data views: the built-in reporting layer

Data views are the reporting answer in MCE and the most commonly under-used
feature on the exam.

| Data view | Use |
|---|---|
| `_Sent` | What was sent, by journey/send |
| `_Bounce` | Delivery failures with category |
| `_Open`, `_Click` | Engagement per message |
| `_Conversion` | Conversion tracking |
| `_Unsubscribe`, `_ListUnsubscribe` | Opt-out evidence |
| `_JourneyActivity` | Journey entry/exit/treatment, the closest thing to a funnel |
| `_Survey` | Survey responses |
| `_Social` | Social engagement |

You cannot change a data view. You can filter and query it, and you can set
retention on the Data Extension behind it.

## Subscriber merge

When the same human arrives with two different email addresses (or the same
address with two SubscriberKeys), you have a duplicate profile. Merging is not a
one-click operation: you export both attribute sets, decide the surviving value
per field, and update — then you must also fix the **send log and suppression
lists**, because a merged profile with a stale send history will re-enter
journeys. In this repo the merge decision logic lives in
`SubscriberMergeService` and the audit trail in `Data_Extension_Sync_Log__c`.

## Checklist

- [ ] Every audience DE has an explicit subscriber key.
- [ ] Consent DEs have no purge date and are not deleted by any automation.
- [ ] Staging DEs have no subscriber key.
- [ ] Every "why is this person on two lists" question has a data-model answer.

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `force-app/main/default/classes/DataExtensionSyncService.cls` | Mapping an external feed onto a Data Extension key model |
| `force-app/main/default/classes/SubscriberMergeService.cls` | Field-level survivor selection for a subscriber merge |
| `force-app/main/default/objects/Data_Extension_Sync_Log__c/` | The audit log every sync and merge writes to |

## Exercises

- **ex-02-1 · Design the Data Extension Model** — DE table with keys and retention.
- **ex-02-2 · Write the Bounce Triage Query** — send log to delivery diagnosis.
- **MP-02** in [14 · Practical Exercises](14-Practical-Exercises-and-Mini-Projects.md) is the full version of ex-02-1.
