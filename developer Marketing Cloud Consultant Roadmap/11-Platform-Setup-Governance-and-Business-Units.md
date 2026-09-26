# 11 · Platform Setup, Governance & Business Units

> Phase 11 of 17 · what an architect is accountable for before anyone sends anything

## Setup checklist: the order matters

Build in this order and each step is testable. Build out of order and you get
permission errors, silent sends and unexplainable sends to the wrong people.

| # | Step | Why it must come here |
|---|---|---|
| 1 | Confirm the edition and entitlements | Everything below is unavailable if the license is wrong |
| 2 | Create the sending subdomain, warm the IP | Takes weeks; nothing sends until this is done |
| 3 | Business Unit and user structure | Determines who can see what |
| 4 | Roles and permissions | Governs step 3's isolation |
| 5 | Data model and keys | Determines who receives what |
| 6 | Sender profiles and dedicated IPs | Per BU, and aligned to the warm-up schedule |
| 7 | Send classification and quiet hours | Compliance control, before any journey exists |
| 8 | Consent and suppression | The gate every send depends on |
| 9 | Content Builder templates | Only now, so they can use real merge fields |
| 10 | Orchestration | Only now, so it can reference real DEs and content |
| 11 | Tracking, attribution, reporting | So you can measure step 10 |
| 12 | Monitoring and governance | So you learn about failures |

## Business Unit design

| Decision | Options | Choose when |
|---|---|---|
| BU per brand | Yes / No | Brands need separate content, users and sending config |
| BU per legal entity | Yes | Regulatory separation is required |
| BU per region | Sometimes | Only if sending config actually differs (quiet hours, IP, sender profile) |
| BU per campaign | Never | A campaign is content plus a send, not a governance boundary |
| BU per environment (dev/prod) | Sometimes | Worth it if you build campaigns as code, as this repo does |

The failure mode: 12 Business Units created "for organisation", with sending IPs
spread thin, no warm-up, and nobody who can be named as the owner. Every BU needs
a documented purpose, an owner, and a review date.

## Roles, permissions and the permission set

| Role | Sees | Cannot |
|---|---|---|
| Administrator | Everything | — |
| Data Manager | DEs, data extensions, queries, automations | Content, journeys |
| Content Manager | Content Builder, templates, assets | Data |
| Campaign Manager / Sender | Sends, journeys, reports for their BU | Other BUs |
| Analyst | Reports, data views, extracts | Sends |

**Install the permission set last, and review it as code.** In this repo the
permission set is a deployable artifact, so the review happens in a pull request
rather than by trusting a screen:

`force-app/main/default/permissionsets/Marketing_Cloud_Consultant.permissionset-meta.xml`

| Rule type | Use for | Trap |
|---|---|---|
| **Permission set** | The baseline capability a role needs | Over-broad sets defeat the BU structure |
| **Permission set group** | Combine sets per BU without duplication | Groups are additive; they never subtract |
| **Sharing rules** | Controlled access to records | Too permissive = the BU isolation is cosmetic |
| **Restriction rule / criteria-based sharing** | Sensitive objects such as consent | If consent is broadly readable, your governance story is a fiction |

## IP and domain management

- Warm every dedicated IP before it carries production volume. See
  [04 · Deliverability](04-Deliverability-Domain-Reputation-and-IP-Warming.md).
- One sender profile per BU per domain, with a from-name and reply-to that the
  business recognises.
- Keep a **reply-to** the support team monitors; an ignored reply is a complaint
  in slow motion.
- A dedicated IP per BU is the clean isolation model. A shared IP across BUs means
  one brand's complaint rate damages the others — acceptable only with a
  deliberate, monitored reason.

## Send classification

| Classification | Use for | Consequence |
|---|---|---|
| **Marketing** | Promotional | Applies consent, unsubscribe, quiet hours |
| **Transactional** | Receipts, confirmations | Exempt from unsubscribe, but not from SFTP/accuracy |
| **Operational** | Password resets, alerts | Exempt from marketing consent, not from relevance |

Classification is a data requirement: the send activity has to read it, and the
entry rule has to honour it. A journey that mixes marketing and transactional
contacts in one DE will eventually send a promotion to somebody who should only
have received a receipt — and you will not be able to prove which.

## Tracking, attribution and reporting

| Need | Mechanism | Trap |
|---|---|---|
| Click tracking | Tracking codes, link wrapping | Deduplicate by content ID or you double-count |
| Conversion tracking | Conversion definitions, not a query | A "conversion" measured by open is a fiction |
| Multi-touch attribution | Most recent click, or a defined model | Pick one, document it, stop arguing |
| Reporting | Insights on Data 360, data views, MCI | Two sources of truth is worse than one |
| Data subject request log | Custom object | Never rely on the CRM Activity log alone |

## Entitlements and product limits

| Limit | Where it bites |
|---|---|
| Data Extensions per BU | Consolidating hundreds of one-off DEs |
| Contacts / Data Cloud credits | MCN consumption-based billing |
| Number of automations that can run concurrently | Scheduled automations queuing at 02:00 |
| Send log retention | Storage cost |
| Number of Business Units | Operational overhead |
| Core org edition | MCN needs Enterprise or Unlimited |

## Exam traps

- Creating BUs "per campaign" for governance.
- Adding more Business Units as a fix for a data volume problem.
- Mixing marketing and transactional sends in one audience.
- Assigning permission sets outside the standardise-then-review flow.
- Sharing a dedicated IP across brands without acknowledging the reputation
  coupling.
- Building orchestration before the consent gate exists.

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `force-app/main/default/permissionsets/Marketing_Cloud_Consultant.permissionset-meta.xml` | The baseline permission set, reviewed as code |
| `force-app/main/default/customMetadata/MC_Config__mdt/` | Sender, IP and Business Unit configuration as metadata |
| `force-app/main/default/sharingrules/Marketing_Interaction__shrdl` | Restriction rule keeping consent and interaction data controlled |
| `force-app/main/default/flows/Consent_Capture_Preference_Centre.flow-meta.xml` | The capture and preference flow the governance model depends on |

## Exercises

- **ex-11-1 · BU and Role Design** — four scenarios, the BU boundary and the role set.
- **ex-11-2 · Governance Review** — a configuration that fails the standardise-then-review test.
