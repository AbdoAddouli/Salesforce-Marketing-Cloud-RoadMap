# 01 · Marketing Cloud Concepts, Editions & Architecture

> Phase 1 of 17 · two tracks, one decision: which Marketing Cloud is this customer actually buying?

## Why this phase comes first

Almost every wrong answer on either Marketing Cloud exam is a *platform* error: an
option that is correct for Marketing Cloud Engagement applied to a Marketing Cloud
Next scenario, or the reverse. Before you can configure anything defensibly you
have to be able to place the customer in the product map in one sentence.

## The two live products

| Aspect | Marketing Cloud Engagement (MCE) | Marketing Cloud Next (MCN) |
|---|---|---|
| Origin | The ExactTarget platform, connected to Salesforce | Built natively on Salesforce core + Data 360 |
| Editions | Per-feature entitlements on a connected tenant | Growth and Advanced editions of Marketing Cloud Next |
| Core org requirement | Works with Professional and above | Requires Enterprise or Unlimited |
| UI | Classic / setup + custom apps | Lightning Experience only |
| Data model | Data Extensions, batch sync, Contact Builder | Data Model Objects, unified profiles, Actionable Lists |
| Orchestration | Journey Builder, Automation Studio | Flow (record-triggered, scheduled, autolaunched) |
| CRM access | Marketing Cloud Connect, or the FTP / SOAP / REST integrations | Direct, same org, no connector |
| AI | Einstein bolt-ons (Send Time Optimization, Content Selection) | Agentforce Marketing |
| B2B | Separate product (Account Engagement) | One application for both B2B and B2C |
| Analytics | Data views, tracking extracts, Datorama/MCI | Insights on Data 360, pre-built dashboards, MCI |

The rename history matters because almost all study material is out of date:

- Marketing Cloud **Growth** and Marketing Cloud **Advanced** were separate
  step-stone products. They are now the two **editions of Marketing Cloud Next**.
- **Data Cloud** is now **Data 360**. "Data Cloud Ad Audiences" is "Data 360 Ad Audiences".
- **Interaction Studio** is now **Marketing Cloud Personalization**.
- **Datorama** is now **Marketing Cloud Intelligence** (MCI). Datorama is still
  the underlying platform name, which is why both appear in docs.
- **Einstein for Marketing** is now **Agentforce Marketing**.

## The consultant decision rule

1. Ask the **core org edition** first. If it is Professional, Marketing Cloud Next
   is not on the table and the whole conversation changes.
2. Ask whether the requirement is **real-time against CRM data**. If yes and the
   customer is on MCE, you are designing around a connector you will fight.
3. Ask the **channel set**. WhatsApp is inside the MCN entitlement set; on MCE it
   is a separate MobileConnect / Unified Messaging conversation.
4. Ask **B2B or B2C**. Account Engagement is not included in an MCN subscription.
5. Only then discuss features.

## Business Units: a governance boundary, not a container

A Business Unit is its own governance boundary: content, users and roles, and
sending configuration.

| Situation | Business Unit? | Why |
|---|---|---|
| Two brands, separate look and feel | Yes | Content and user governance must be separated |
| Two legal entities in one region | Yes | Regulatory and brand separation |
| Agency running two clients | Yes | Isolation is the point |
| 300k records in one Data Extension | No | Volume is a data design problem, not a governance one |
| One Business Unit per Data Space | No | Data Spaces are a Data 360 concept |
| One Business Unit per content variant | No | That is a content variation, not a structure |

BUs carry cost and operational overhead. If you cannot write a governance sentence
for a BU, you should not create it — and if you do create it, record the reason on
the BU so somebody can eventually decommission it.

## Licenses vs features

- A **license** is a commercial entitlement: per user, per org, or per subscriber
  depending on the product.
- A **feature** is a capability you switch on inside a licensed product.
- You cannot configure your way out of a missing license. This is the single most
  common discovery surprise: a customer buys the edition, then discovers the
  channel they promised their customers is a separate add-on.
- In MCN the commercial unit is the **org plus consumption credits**, so
  "how many messages" becomes an architecture question, not a procurement one.

## Discovery checklist for the first workshop

1. Which Salesforce core edition, and is an upgrade planned?
2. How many brands and how many legal entities need separation?
3. Monthly send volume per channel, and the seasonal peak.
4. Which channels are in scope in year one: email, SMS, WhatsApp, push, paid?
5. Is there an AI requirement, and who approves generated content?
6. Which system is the system of record for profile data, and for consent?
7. Do we have a Data 360 org, and is Identity Resolution configured?
8. What is the data subject request process today, and who owns it?
9. Is there an existing Data Cloud / MCN footprint to inherit?
10. What is the contractual renewal date on anything that is being retired?

Answers 1, 4 and 6 eliminate most of the wrong-architecture conversations.

## Exam traps

- **Advertising Studio** is non-renewable from 15 August 2026 and is replaced by
  Data 360 Ad Audiences. Any option recommending it is wrong.
- **Audience Studio** was retired in 2024; **Social Studio** has sunset.
- A "Marketing Cloud Consultant" answer key quoting a **68% pass mark** and an
  **Email Specialist** prerequisite is pre-2018-rename material.
- Recommending a Business Unit to solve a data volume problem is a wrong-scope
  distractor.

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `force-app/main/default/customMetadata/MC_Config__mdt/` | Business Unit and endpoint configuration as deployable metadata |
| `force-app/main/default/customMetadata/Certification_Setting__mdt/` | The exam facts from phase 13, version-controlled |
| `ARCHITECTURE.md` | The layered architecture and the data model this roadmap builds towards |
| `docs/assets/examfacts.js` | The verified exam facts that also drive the mock paper |

## Exercises

- **ex-01-1 · Product and Edition Selection Matrix** — six scenarios, one decision each.
- **ex-01-2 · First-Workshop Discovery Set** — ten questions, each mapped to the decision it unblocks.

Full solutions in [15 · Answers & Results](15-Answers-and-Results.md).

## Checklist before moving on

- [ ] I can name the current product, the current name and the retired name for Engagement, Next, Personalization and Intelligence.
- [ ] I can state the core org edition requirement for Marketing Cloud Next without hesitating.
- [ ] I can justify a Business Unit on governance grounds, or say no.
- [ ] I can write the first-workshop question that unblocks the edition decision.
