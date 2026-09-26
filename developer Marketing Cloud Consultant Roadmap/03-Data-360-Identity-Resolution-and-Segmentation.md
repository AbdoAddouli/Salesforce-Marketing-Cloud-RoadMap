# 03 · Data 360, Identity Resolution & Segmentation

> Phase 3 of 17 · 25% of the MCN paper, and the half you cannot answer from MCE experience

## Why this phase is worth the most

Data Modeling, Identity Resolution & Segmentation is **25%** of the Marketing Cloud
Next Consultant exam. It is also the domain where MCE experience actively hurts,
because in MCE you are used to *building* the profile yourself. In Data 360 the
profile is assembled by rules you configure once and then have to trust.

## The four verbs in the objective

The blueprint objective says: *connect, harmonize, unify, activate*. Read those
four words literally and you have the whole phase.

| Verb | What it means in Data 360 | What you configure |
|---|---|---|
| Connect | Bring data in from a source | Data Streams, Ingestion, or the Marketing Data Kit for CRM objects |
| Harmonize | Make two sources speak the same shape | Field mapping, data types, identity keys, a harmonized schema |
| Unify | Decide when two records are the same person | **Identity Resolution match rules**, then **reconciliation rules** |
| Activate | Turn a segment into something a campaign can use | Segments → **Actionable Lists** → campaign entry |

## Match rules vs reconciliation rules

This is the single most confused pair in Data 360 and it is directly examinable.

| | Match rules | Reconciliation rules |
|---|---|---|
| Question answered | "Are these two records the same person?" | "This field disagrees — which value survives?" |
| Operates on | Rulesets, evaluated in order | Rulesets, applied after matching |
| Output | A unified profile link | The resolved value per field |
| Typical configuration | Exact match on email, fuzzy match on name + phone, normalized phone | Email: most recent verified wins. Phone: most recent non-empty wins |

Match rules evaluate **in order you choose**, and the first rule that resolves
two records wins. Reconciliation rules then resolve field-level conflicts *inside*
a resolved pair.

**Hashed identifiers change everything.** If one source only has a hashed email
(SHA-256, not the platform's own normalisation), you cannot match it by value
against a plain email. You either match it against the same hashed value from
another source, or you match on a weaker key such as a device ID, and you accept
the false-positive risk. Saying "we will match on hashed email" without noticing
this is the classic wrong answer.

## The unified profile is a model with trade-offs

What it should contain:

- One canonical identity per human.
- One resolved value per attribute, with a survivorship rule.
- Consent state per channel, so activation can be gated.
- Engagement history, so predictive features (fit score, engagement score,
  Send Time Optimization) have something to learn from.

What it should deliberately not contain:

- Raw transactional detail. Data 360 is not your order system.
- Anything you cannot justify holding under a retention policy.
- Two records for the same person because a match rule was too loose — a
  duplicated profile is worse than a missing one, because it will be messaged
  twice.

## Marketing Data Kit

The **Marketing Data Kit** installs the standard CRM-to-Data 360 mapping objects
that support segmentation and activation. It is not a send-history migration tool,
it is not authentication, and it is not the mobile SDK. Candidates who answer
"to migrate historical sends" are answering a different question.

## Actionable Lists

An **Actionable List** is the MCN activation surface: a governed, reusable
audience built from Data 360 segments and used as a campaign entry source. It is
the MCN equivalent of "a DE that a journey can enter from", with the difference
that it is created from Data 360 and can be governed like Data 360 content.

| Need | MCE answer | MCN answer |
|---|---|---|
| Reusable audience definition | Data Extension + query activity | Segment → Actionable List |
| Ad platform audience | Audience DE / Advertising Studio | Data 360 Ad Audiences |
| Suppression | Suppression DE / global suppression list | Consent state on the profile + excluded Actionable List |

## Consumption-based entitlements

Data 360 consumption is billed by consumption of data and credits. The design
decisions that move the number:

| Driver | How it inflates consumption | How to reduce it |
|---|---|---|
| A record-triggered flow per campaign | Every contact is re-evaluated by every flow | One flow per lifecycle program, not per campaign |
| Wide attribute pulls in content | Each rendered message reads more DMO fields | Read only what the message uses |
| Frequent full refreshes | Each refresh consumes | Delta where possible, scheduled in the cheap window |
| Duplicate records | Every duplicate is processed | Fix identity before you scale volume |
| Splitting one flow into many | Flow evaluations multiply | Collapse into one flow with decisions |

The exam asks you to "evaluate how marketing automation design decisions impact
platform consumption and usage". The answer is always: fewer evaluations of
fewer records reading fewer fields.

## Segmentation that survives contact with reality

```text
Segment = base audience
        ∩ consent gate
        ∩ exclusions (buyers, unsubscribes, in-flight journeys, frequency caps)
```

Order matters. Exclusions applied after activation are too late to be a
compliance control — the profile has already been treated as marketable, and in
most consent frameworks the damage is done at activation, not at send.

## Exam traps

- Confusing a Data Space (a logical boundary in Data 360) with a Business Unit.
- Saying Identity Resolution decides "which profile wins" — that is the
  reconciliation rule; match rules only decide *whether* they are the same person.
- Recommending Advertising Studio for a new build (retired).
- Treating send-time filtering as a consent control.

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `force-app/main/default/classes/LeadRoutingForCampaignsService.cls` | Lead → campaign member → Data 360 activation path |
| `force-app/main/default/classes/CampaignMemberSyncService.cls` | Keeping CRM campaign membership and marketing segments in step |
| `force-app/main/default/customMetadata/CampaignMemberSync__mdt` | Source priority order as configuration rather than code |
| `force-app/main/default/objects/Consent_Preference__c/` | Channel consent state that gates activation |

## Exercises

- **ex-03-1 · Unified Profile Field Map** — source field to DMO to match rule to reconciliation rule.
- **ex-03-2 · Consumption Review** — find the four design decisions billing the customer.
- **MP-03** in [14 · Practical Exercises](14-Practical-Exercises-and-Mini-Projects.md) is the full version of ex-03-1.
