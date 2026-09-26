# 15 · Answers & Results

> Phase 15 of 17 · model answers for all 32 guided exercises and mini projects

**How to read this.** Every answer below is a *model* answer, not the only one.
Where a question has more than one defensible answer, the grading note says so. If
your answer differs, the question is whether you can defend it against the rule
the phase guide states — not whether it matches mine.

The four Real-World Use Cases are briefed in phase 16 and solved in
[17 · Use Case Solutions](17-Use-Case-Solutions.md).

The interactive answer key with your score and per-exercise feedback lives in the
academy: `docs/index.html` → **Curriculum** → any exercise.

## Phase 1 — Marketing Cloud Concepts, Editions & Architecture

### ex-01-1 · Product and Edition Selection Matrix

| # | Scenario | Decision | Rule |
|---|---|---|---|
| 1 | Professional org, wants Engagement, currently on a legacy tool | MCE | MCN needs Enterprise or Unlimited |
| 2 | Enterprise org, B2B and B2C together, wants one app | MCN, Advanced | Account Engagement is a separate MCE product |
| 3 | WhatsApp, loyalty programme, wants AI decisioning | Check the WhatsApp entitlement first, then MCN Advanced | The entitlement is the binding constraint |
| 4 | Existing Advertising Studio, renewal lapsing in 2026 | Migrate to Data 360 Ad Audiences | Advertising Studio non-renewable 15 Aug 2026 |
| 5 | Enterprise org, no Data 360, wants real-time CRM journeys | MCE with Marketing Cloud Connect | MCN journeys read Data 360; without it, MCE is the lower-risk path |
| 6 | Two brands, one legal entity, separate design | One BU per brand | Brand separation is a governance boundary |

**Grading note.** Scenario 5 is the one that generates disagreement. "Real-time
against CRM data" is a strong argument for MCN, but if there is no Data 360 org,
saying "confirm the Data 360 strategy before committing to MCN, otherwise MCE with
Marketing Cloud Connect" scores better than committing to either.

### ex-01-2 · First-Workshop Discovery Set

| # | Question | What it unblocks |
|---|---|---|
| 1 | Which core org edition, and is an upgrade planned? | The MCE / MCN decision, outright |
| 2 | How many brands and legal entities? | Business Unit design |
| 3 | Monthly send volume per channel, and the seasonal peak? | Dedicated IP decision, warm-up schedule, cost model |
| 4 | Which channels in scope in year one? | Entitlements: WhatsApp, MobileConnect, Personalization |
| 5 | Is there an AI requirement, and who approves generated content? | Agentforce scope and the human review gate |
| 6 | Which system holds profile data, and which holds consent? | System of record, and the identity model |
| 7 | Is there a Data 360 org, and is Identity Resolution configured? | MCN segmentation feasibility |
| 8 | How are DSRs handled today, and who owns it? | Compliance maturity, phase 10 scope |
| 9 | Is there an existing Data Cloud / MCN footprint to inherit? | Migration scope, and what must be rebuilt |
| 10 | What is the renewal date on anything being retired? | The deadline that makes the project urgent |

## Phase 2 — The Subscriber & Data Extension Model

### ex-02-1 · Design the Data Extension Model

| DE | Type | Primary key | Subscriber key | Retention |
|---|---|---|---|---|
| ContactMaster | Standard | EmailAddress | EmailAddress | 3 years rolling |
| ContactPreference | Standard | SubscriberKey | EmailAddress | **No purge** |
| OrderMaster | Standard | OrderId | EmailAddress | 3 years |
| SendEligible | Standard | SubscriberKey | EmailAddress | 90 days |
| Import_Staging | Standard | RowId | **None** | 30 days |
| OrderSendLog | List Management | System | n/a | 3 months |

**Why:** preference DEs hold the compliance evidence, so retention destroys the
record. Staging must not have a subscriber key or every run creates a duplicate
profile. SendEligible is a derived, rebuildable copy — overwrite it, never append.

**Grading note.** The two things that earn the mark are **no purge on consent**
and **no subscriber key on staging**. Everything else is defensible.

### ex-02-2 · Bounce Triage Query

```sql
SELECT
  s.BounceCategory,
  COUNT(*) AS affected,
  COUNT(DISTINCT s.EmailAddress) AS contacts,
  COUNT(DISTINCT s.IPAddress) AS ips
FROM ent.<childsendlog> s
WHERE s.SentDate >= DATEADD(day, -7, GETDATE())
  AND s.BounceCategory IS NOT NULL
GROUP BY s.BounceCategory
ORDER BY affected DESC
```

**Why:** the grouping is the diagnosis. One category dominating on one IP is
infrastructure; one category on many IPs with few distinct contacts is list
hygiene; a single IP failing against one mailbox provider is that provider's
filter list. The `COUNT(DISTINCT s.IPAddress)` column is what separates the three.

## Phase 3 — Data 360, Identity Resolution & Segmentation

### ex-03-1 · Unified Profile Field Map

| Source field | DMO | Match rule | Reconciliation rule |
|---|---|---|---|
| CRM `Email` | `Email` | Exact, normalised, **rule 1** | Most recent verified wins |
| Web `email_hash` | `EmailHash` | Exact, normalised, **rule 1** | Not for display; match only |
| Support `Phone` | `Phone` | Normalised E.164, **rule 2** | Most recent non-empty wins |
| Loyalty `loyalty_id` | `LoyaltyId` | Exact, **rule 2** | Most recent wins |
| Device token | `DeviceId` | Exact, **rule 3**, lowest priority | Most recent wins |
| `FirstName` | `FirstName` | n/a | Most recently verified CRM value wins |
| `consent_email` | `ConsentEmail` | n/a | **Opt-out always wins**, no recency rule |

**Why the order:** email first because it is the most reliable shared identifier;
phone second because it is shared within households; device ID last because
devices change and are shared. The consent rule is not a recency rule — a later
opt-out must not be overwritten by an earlier opt-in.

**Grading note.** Any answer that puts a hashed email against a plain email in
the same match rule is wrong. Hashing changes the value.

### ex-03-2 · Consumption Review

| Finding | Cost driver | Fix |
|---|---|---|
| One record-triggered flow per campaign | Flow evaluations × contacts | One flow per lifecycle program, campaigns as content |
| The welcome content reads 22 DMO fields | Fields per message | Read only the 5 the message uses |
| A nightly full refresh of 4M records | Data consumed | Delta where the source supports it, in the cheap window |
| 8% duplicate profiles | Every duplicate processed | Fix identity before scaling volume |
| Scoring writes back to CRM per contact | Record-triggered evaluations | One scheduled flow, batch |

**Why:** consumption is evaluations × records × fields. Every recommendation
reduces one of the three. The duplicate-profile finding matters most, because it
is both a cost problem and a message-twice problem.

## Phase 4 — Deliverability, Domain Reputation & IP Warming

### ex-04-1 · Authenticate the Sending Subdomain

| Record | Name | Type | Value |
|---|---|---|---|
| SPF | `@` on `mail.marketing.customer.com` | TXT | `v=spf1 include:_spf.salesforce.com include:spf.mta.customer.com ~all` |
| DKIM | `selector1._domainkey` | CNAME | `dkim1.customer.com` |
| DKIM | `selector2._domainkey` | CNAME | `dkim2.customer.com` |
| DMARC | `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:dmarc@customer.com; pct=100` |
| MTA-STS | `_mta-sts` | TXT | `v=STSv1; id=20260101000000` |
| TLS-RPT | `_smtp._tls` | TXT | `v=TLSRPTv1; rua=mailto:tls@customer.com` |

**Why:** a **dedicated marketing subdomain**, never the corporate domain. Start
DMARC at `p=none` and escalate only when the aggregate reports show all legitimate
senders aligned. SPF with `~all` (softfail) rather than `-all` on day one, because
you will find a sender you did not know about.

**Grading note.** A real answer includes the subdomain decision and the DMARC
policy progression. A list of records without the policy staging is half the mark.

### ex-04-2 · Diagnose the Delivery Collapse

| # | Symptom | Diagnosis | First fix |
|---|---|---|---|
| 1 | Delivery rate halved the day after a DNS change, all IPs | SPF/DKIM/DMARC misaligned | Fix alignment before touching anything else |
| 2 | One mailbox provider blocking 9%, others flat | Provider-specific filtering | Reduce volume, clean the list, request a review |
| 3 | Hard bounces concentrated in one import, 1 address repeated | List hygiene from a bad source | Fix the source, re-permission, exclude the addresses |
| 4 | Complaints up on a newly purchased segment | Targeting converters | Stop targeting converters; fix the predicate |

**The trap:** none of these is fixed by a subject-line A/B test, and none is fixed
by increasing volume. Each has a different first action, which is the point of the
question.

## Phase 5 — Content Building & Personalization

### ex-05-1 · Defensive Personalisation Block

```ampscript
%%[ SET @greeting = "Hi there," ]%%
%%[ IF NOT EMPTY(@firstName) THEN
      SET @greeting = CONCAT("Hi ", @firstName, ",")
   END IF ]%%
%%[ SET @body = "" ]%%
%%[ IF NOT EMPTY(@preferredStore) THEN
      SET @body = CONCAT(" New arrivals in your ", @preferredStore, " store.")
   END IF ]%%
<!DOCTYPE html>
<html><body>
<p>%%=v(@greeting)%%</p>
<p>%%=v(@body)%%</p>
<a href="%%=v(@UnsubscribeUrl)%%">Unsubscribe</a>
</body></html>
```

**Why:** every field has a fallback; the fallback is a complete grammatical
sentence; the unsubscribe link is present. The `%%=v(@var)%%` pattern also
prevents a null rendering as the literal text.

### ex-05-2 · Rebuild It in Handlebars

```handlebars
<p>{{#if firstName}}Hi {{firstName}},{{else}}Hi there,{{/if}}</p>
{{#if preferredStore}}<p>New arrivals in your {{preferredStore}} store.</p>{{/if}}
<a href="{{unsubscribeUrl}}">Unsubscribe</a>
```

**Three migration traps:**

1. `%%[ ... ]%%` / `%%= ... %%` percent directives are **not** the MCN template
   syntax. MCN content uses Handlebars block expressions.
2. `SET` and `IF` blocks do not exist in Handlebars — `{{#if}}` / `{{else}}` and
   inline helpers replace them.
3. Bindings come from the Data 360 unified profile, not a Data Extension row. A
   contact with no profile row renders as empty, not as an error.

## Phase 6 — Journey Builder & Flow Orchestration

### ex-06-1 · Pick the Orchestration

| # | Scenario | Choose | Nearest wrong answer, and why it fails |
|---|---|---|---|
| 1 | New subscriber, 5-email series over 3 weeks | Journey / record-triggered flow | Automation: no per-contact branching or re-entry rules |
| 2 | Nightly score of 2M records, then a send | Automation / scheduled flow | Journey: it is batch data work, not a lifecycle |
| 3 | Contact abandoned a cart, message in 1 hour if not converted | Journey, 1-hour wait, conversion exit | Automation: real-time trigger with a per-contact exit rule |
| 4 | Nightly file from SFTP, import, score, send | Automation | Journey: file transfer and SQL activities do not belong in a journey |
| 5 | One-shot newsletter from a DE on a fixed date | Triggered send | Journey: no lifecycle, no branching, no re-entry |
| 6 | Re-engagement, eligible if no open for 90 days | Journey with 90-day re-entry cooldown | Automation: the cooldown is native to the journey |

### ex-06-2 · Design the Exits

| Exit | Trigger | Why it earns the mark |
|---|---|---|
| Conversion | Order / subscription event | Stops "buy again" immediately |
| Goal met | Score threshold | Moves the contact to the next program |
| Global suppression | Unsubscribe, complaint | Stops everything, everywhere |
| Frequency cap | N contacts in M days, across channels | Stops cross-channel contact fatigue |
| Window expiry | 30 days since entry | Bounds the liability of a bad decision |
| Re-entry cooldown | 90 days after exit | Stops the trigger re-firing immediately |

**Why it earns the mark:** a lifecycle journey with no conversion exit is the most
expensive omission in this phase, and it is a named exam scenario.

## Phase 7 — Automation Studio & Data Operations

### ex-07-1 · Idempotent Scoring SQL

**Answer:** a **SQL query activity with the target DE set to Overwrite**, run from
an automation, preceded by an import into a staging DE.

**The two failure modes it kills:**

1. **Append target + retry = duplicate rows sent twice.** The send step fails, the
   automation retries, the activity appends the same rows again.
2. **Half-loaded staging DE promoted to the send DE.** An import fails midway, the
   run continues, and a send goes to a partial file.

**Why Overwrite:** the send DE is a derived, rebuildable artifact. Overwrite makes
the activity safe to repeat, which is the property that matters.

### ex-07-2 · Design the Failure Path

```text
1. File transfer   pull the CSV from SFTP, file name includes the run date
2. Import          into Staging_DE — never the live DE
3. SQL validation  row count + bad-address count, threshold decided with the customer
4. SQL scoring     overwrite the send DE
5. Send            runs only if validation passed
6. Data extract    results and the error DE for the next day
```

- **Retry:** transient file-transfer failures only, a fixed number of times.
- **Dead-letter:** rows failing validation into an error DE. Never delete them,
  never let them into the send DE.
- **Alert:** the monitoring report plus a distribution list. Not one person.
- **Ownership:** every automation names its owner in the alert email.

**Why it earns the mark:** validation before transformation, staging before
promotion, and a named distribution list. Those three are what the scenario
answers were checking for.

## Phase 8 · Unified Messaging

### ex-08-1 · Channel Selection Matrix

| # | Need | Channel | Constraint that decides it |
|---|---|---|---|
| 1 | Order confirmation | Email, transactional | Exempt from marketing consent, not from accuracy |
| 2 | Appointment reminder, 2 hours' notice | SMS | Needs SMS consent; time-critical |
| 3 | Loyalty programme, monthly, rich content | Email | Marketing consent + unsubscribe |
| 4 | Customer replies to a service message | WhatsApp, session message | Inside the 24-hour window; no template needed |
| 5 | New arrivals, weekly broadcast | Email | A WhatsApp broadcast would need a pre-approved template |
| 6 | Basket prompt while the app is open | Mobile push | The SDK is installed; no marketing opt-in needed for the permission |

**Grading note.** The marks are in the **constraints** column: 10DLC registration
for SMS, template pre-approval for a WhatsApp broadcast, and the fact that push is
a permission, not an opt-in.

### ex-08-2 · Time-Zone-Aware Quiet Hours

```sql
SELECT
  c.MobileNumber,
  c.TimeZone_Offset,
  CASE
    WHEN (HOUR - c.TimeZone_Offset + 24) % 24 BETWEEN 8 AND 20 THEN 'Send now'
    ELSE 'Defer'
  END AS Send_Window,
  DATEADD(hour, (HOUR - c.TimeZone_Offset + 24) % 24, GETDATE()) AS Earliest_Local
FROM Mobile_Reachable__c c
WHERE c.SMS_Consent__c = 1
  AND c.IsOptedOut__c = 0
  AND c.MobileNumber LIKE '+%'
```

**Two rules that earn the mark:**

1. **Defer, do not drop.** A contact outside their window goes to a deferred set
   with a next-send field, and the next run picks them up.
2. **Re-check consent on re-entry.** They may have unsubscribed while deferred.
   Consent that was valid at send time is not the requirement; consent that is
   valid *now* is.

## Phase 9 — Paid Audiences & Ad Activation

### ex-09-1 · Retired-Product Triage

| Recommendation | Verdict | Replacement |
|---|---|---|
| "Use Advertising Studio for the new audience" | **Fails** | Advertising Studio non-renewable from 15 Aug 2026. Use Data 360 Ad Audiences |
| "Model segments in Audience Studio" | **Fails** | Audience Studio retired in 2024. Use Data 360 segments |
| "Migrate the existing Advertising Studio audiences to Data 360 Ad Audiences" | **Survives** | Correct, and the only Advertising Studio answer that does |
| "Use platform-native audiences keyed on customer ID" | **Survives** | No PII leaves the platform; best match rate |
| "Use Social Studio for the paid social programme" | **Fails** | Social Studio has sunset |

### ex-09-2 · Audience Design with Suppression

| Element | Answer |
|---|---|
| Segment | Engaged 90-day, excluding converters and in-flight journey contacts |
| Destination | Meta, Google, LinkedIn |
| Match key | Platform customer ID first; hashed email only where consent allows |
| System of record | Data 360 segments; Data 360 Ad Audiences for cross-channel suppression |
| Refresh | Daily at 02:00, delta where the platform supports it |
| Suppression | Per-channel advertising opt-out, global suppression list, in-flight journey exclusions, frequency cap |
| Test | 500-contact seed audience, match rate verified before scaling |

**Why it earns the mark:** naming the suppression list is the part most answers
miss. Advertising use has its own consent, separate from the email opt-out.

## Phase 10 — Consent Management & Compliance

### ex-10-1 · Consent Model Design

| Field | Purpose |
|---|---|
| `Contact__c` | The human |
| `Channel__c` | Email / SMS / WhatsApp / Push / Advertising |
| `Purpose__c` | Marketing / Transactional / Analytics / Advertising |
| `Status__c` | OptedIn / OptedOut / Pending / Transferred |
| `OptedInDate__c`, `OptedOutDate__c` | Evidence and recency |
| `Source__c` | Form / Import / Keyword / App |
| `Evidence__c` | URL, keyword, timestamp, IP where applicable |

**Transitions:** `Pending → OptedIn` on capture with evidence. `OptedIn → OptedOut`
is always allowed and never blocked by recency. `OptedOut → OptedIn` requires a new
opt-in action with fresh evidence, never a sync from an old field.

**Grading note.** The two marks are **per channel and per purpose** (not one
boolean), and **`OptedOut → OptedIn` requires fresh evidence**.

### ex-10-2 · Run an Erasure Request

| Location | Action |
|---|---|
| CRM records | Delete, or anonymise where a legal basis requires the record to remain |
| Data Extensions | Null the identifying columns; keep the row if an aggregate needs it |
| Data 360 | Delete at source, then re-run identity resolution, or the profile rebuilds |
| Send log | Keep the send, anonymise the address. You cannot un-send it |
| Journey / flow state | Remove from every in-flight journey |
| Suppression lists | **Keep as an anonymised tombstone, forever** |
| Paid platforms | Send a deletion request downstream |
| Web tracking | Honour the browser consent signal |

**The rule that earns the mark:** suppression must be anonymised, not deleted. If
you delete it, the next ingest rebuilds the profile and the person is messaged
again. And then verify 30 days later that it held.

## Phase 11 · Platform Setup, Governance & Business Units

### ex-11-1 · BU and Role Design

| # | Scenario | BU design | Role set |
|---|---|---|---|
| 1 | Two brands, one legal entity, separate design | One BU per brand | Per-BU: Administrator, Content Manager, Data Manager, Campaign Manager, Analyst |
| 2 | Agency, two clients, isolation required | One BU per client | Client-scoped Campaign Manager; no cross-BU visibility |
| 3 | One brand, 5M records, DE count is high | **No new BU** | Volume is a data design problem. Consolidate the DEs |
| 4 | Two regions, different quiet hours and IPs | One BU per region | Per-BU sender profile and IP; shared Content Manager |

**Grading note.** Scenario 3 is the trap. Business Units are a governance boundary;
if you cannot write a governance sentence for one, do not create it.

### ex-11-2 · Governance Review

**Findings:**

1. The Administrator role is held in all three BUs by one user. A single
   credential spanning every BU is a segregation-of-duties failure, and it makes
   the permission model impossible to review.
2. Marketing and transactional contacts are in the same entry DE, so send
   classification cannot be enforced. Split them, and classify the sends.
3. Consent is readable by every role. A restriction rule is required on the
   consent and interaction objects.
4. Two BUs share one dedicated IP, so one brand's complaint rate damages the other.

**Fix order:** install the permission set and review it as code, then add the
restriction rule, then split the audiences by classification, then split the IPs
if the volume supports separate warm-ups.

## Phase 12 — Reports, Dashboards & MCI

### ex-12-1 · Metric Definition Table

| Metric | Definition | The trap |
|---|---|---|
| Delivery rate | Delivered ÷ sent | Comparing it across campaigns with different audiences |
| Bounce rate | Bounces ÷ sent | Treating a soft bounce as opt-out |
| Open rate | Opens ÷ delivered | Apple MPP pre-fetches; post threshold, unreliable |
| CTOR | Clicks ÷ opens | The denominator is broken, so the ratio is not comparable |
| Conversion rate | Conversions ÷ delivered | Comparing platforms with different attribution windows |
| Complaint rate | Complaints ÷ delivered | Being "optimised for" it |
| Frequency | Contacts per person per period | Measuring it per campaign instead of per person |
| Revenue per recipient | Revenue ÷ delivered | Nothing else |

### ex-12-2 · Dataset Grain Design

| Dataset | Grain | Join key |
|---|---|---|
| Contact | One row per person | `ContactKey` |
| Send | One row per **message sent to a person** | `ContactKey` + `SendDate` |
| Open / Click | One row per interaction | `ContactKey` + `MessageID` |
| Conversion | One row per conversion event | `ContactKey` + date |
| Consent | Current state per channel | `ContactKey` |
| Cost | One row per spend line | Date + channel |

**Why it earns the mark:** if `Send` is one row per campaign, per-contact frequency
is not computable, and frequency capping stops being measurable. The grain is
the whole answer.

## Phase 14 — Practical Exercises & Mini Projects

<!-- projects:start -->
Eight multi-part builds, one per project. Each answer opens with the
recommendation, then the build, then the thing it deliberately does not do.

Generated from `docs/assets/answers.js` by `scripts/sync-use-case-guides.js`.

### proj-01

### Edition recommendation

**Marketing Cloud Engagement, today, with a documented path to Marketing Cloud
Next Advanced once the core org is upgraded.**

The fashion retailer is on **Salesforce Professional**, with 2 brands, 3 regions,
900k contacts and 2.5M emails a month.

| Requirement | Available on MCE? | Note |
|---|---|---|
| Email and SMS at 2.5M/month | Yes | 3 regions is a sound reason for per-region sender configuration |
| 2 brands | Yes | Business Units, which is the right tool for this |
| AI campaign creation | **Not Agentforce** | Einstein features are available on MCE; Agentforce campaign creation is an MCN capability |
| WhatsApp | **Only as a mobile messaging add-on** | It is not part of the core MCE entitlement in the same way |

**The core org constraint decides it.** MCN requires **Enterprise or Unlimited**.
The retailer cannot buy its way into MCN without an org upgrade, and the org
upgrade is not a marketing decision. Recommending MCN to a Professional customer
is recommending something they cannot deploy.

**The cost implication you must state:** the path to Agentforce and first-party
WhatsApp is a **core org upgrade plus the MCN Advanced subscription**, which is
materially larger than the mobile messaging add-on. Price both, and let the
retailer choose the sequence rather than the reverse.

### Business Unit count: four

| BU | Governance justification | Owner |
|---|---|---|
| Brand A | Brand identity, content governance and reputation must not be coupled to Brand B | Brand A marketing director |
| Brand B | As above, and deliberately isolated so Brand A's complaint rate cannot damage Brand B | Brand B marketing director |
| Region 1 / 2 / 3 | **Three regional BUs, not one.** Different local quiet-hour windows, sender profiles and regulatory requirements per market. That is a governance boundary | Regional marketing ops |
| **Do not add** | A BU per campaign, per language, or per channel | - |

**The number to defend: four**, with the justification that each carries content
governance *and* an independent sending configuration. If a proposed BU cannot be
justified on both counts, it is a content variation or a sender profile, not a BU.

**The 2.5M/month figure cuts the other way too:** at that volume a dedicated IP
per region is justified, so each regional BU can warm its own IP. With one BU for
all three regions, the three sending patterns would be mixed on one IP and the
warm-up history would be meaningless.

### The one thing that blocks go-live

**The WhatsApp entitlement, and specifically the pre-approval of the message
templates.**

Not the org edition - that is a roadmap item, and the MCE path does not need it.

| Step | Lead time | Compressible? |
|---|---|---|
| Entitlement purchase | Days | Yes |
| Business verification | Days to weeks | Partly |
| **Template pre-approval** | **Days per template, and text changes need re-approval** | **No** |
| First production send | 1 day | Yes |

**How to sequence around it:** start template drafting and business verification in
month one, before the design is finished, and treat the template list as a
deliverable with its own deadline. A loyalty programme needs several templates -
welcome, tier achieved, reward expiring, opt-in confirmation - and they are the
long pole, not the integration.

**State the risk plainly:** if the templates are not approved before launch, the
channel launches without the loyalty programme, which is the requirement the
business case was built on. Everything else in the plan can slip; this cannot.

### proj-02

### The DE set

| DE | Purpose | Type | Primary key | Subscriber key | Send log | Retention |
|---|---|---|---|---|---|---|
| ContactMaster | Attributes, joined from the two upstream systems | Standard | EmailAddress | EmailAddress | No | 3 years rolling |
| ContactPreference | Per-channel consent with evidence | Standard | SubscriberKey | EmailAddress | No | **Never purge** |
| ConsentEvidence | Append-only consent event log | Standard | EventId | EmailAddress | No | **Never purge** |
| DailyEngagement | Yesterday's engaged segment | Standard | SubscriberKey | EmailAddress | No | 45 days |
| SendEligible | Derived audience the send reads | Standard | SubscriberKey | EmailAddress | No | 90 days |
| GlobalSuppression | Cross-channel suppression | Standard | SubscriberKey | EmailAddress | No | **Never purge** |
| OrderMaster | Orders, one row per order | Standard | OrderId | EmailAddress | No | 3 years |
| Import_Staging | Landing zone for both attribute feeds | Standard | RowId | **None** | No | 30 days |
| StoreSendLog | Per-send record for reporting | List Management | System | n/a | Yes | 3 months |

### Normalised, with one deliberate exception

**Normalised.** Two systems both write contact attributes and Marketing Cloud is
not the system of record, so a denormalised attribute DE would create a second
copy of the truth with no defined owner. The copies diverge silently, and nobody
notices until a consent decision is made on a stale value.

**The deliberate exception: SendEligible is denormalised.** It is a derived,
rebuildable projection built by a SQL activity with the target set to **Overwrite**.
A failure costs one night's rebuild, not data integrity. Wide and fast to send
from, disposable by design, never a source of truth.

**The other deliberate choice: ConsentEvidence is an append-only event log** in
addition to the current-state record. Current state answers "may we send"; the
event log answers "can we prove we could". The second is the one an auditor asks,
and it cannot be answered from a current-state row.

### Retention, justified

| DE | Retention | Justification |
|---|---|---|
| ContactPreference | **Never purge** | The legal evidence of what the customer agreed to. The provability requirement is satisfied by retaining the evidence, not by deleting it |
| ConsentEvidence | **Never purge** | Same, plus append-only. An audit needs the sequence, not just the current state |
| GlobalSuppression | **Never purge** | If purged, the next import rebuilds the profile and the person is messaged after unsubscribing. **Permanent by design** |
| ContactMaster | 3 years rolling | Matches the provability window. Beyond it the attributes are not useful and are harder to justify holding |
| OrderMaster | 3 years | Same window, and it is the transactional record |
| SendEligible | 90 days | A rebuildable projection. A month of history is enough to investigate a bad send |
| DailyEngagement | 45 days | Enough for a month-on-month comparison |
| StoreSendLog | 3 months | The built-in data views already give delivery data. Keeping a year is storage cost with no analytical return |
| Import_Staging | 30 days | A debugging window, nothing more |

**Retention is set on the Data Extension, not per send.** Setting it on the send
log means paying to store rows you can already query from the built-in views.

### The two decisions that cost the most when wrong

1. **A Subscriber key on Import_Staging.** Every run then creates a second
   profile for every contact, and the journeys disagree with each other about who
   that person is. It presents as a merge-field problem, and the actual cause is
   duplicated history.
2. **A purge on anything holding consent.** Deleting the evidence is not
   compliance, it is the loss of the defence. The retention requirement is
   provability, and provability requires the record to still exist.

### proj-03

### Match rules, in evaluation order

| Order | Source | Key | Normalisation | Authority |
|---|---|---|---|---|
| **1** | Contact | Email | Trim, lowercase, plus-addressing stripped | **Authoritative** for email |
| **2** | Commerce buyer | EmailHash | SHA-256 of the normalised plain address | Match key **only** - never authoritative |
| **3** | Lead | WorkPhone | E.164, country code required | Not authoritative - the stale field in this case |
| **4** | Contact | MobilePhone | E.164 | **Authoritative** for mobile |
| **5** | Any | DeviceId | Exact | Last resort. Devices change and are shared |
| **6** | Any | FullName + Postcode | Normalised | **Weakest.** Name collisions produce false positives, so it is last or omitted |

**Why email is rule 1:** it is the only identifier that is both reliably present
and reliably unique per human. Rule 2 is hashed commerce data, which can only
match another hashed value - never a plain address. Rules 3 and 4 are phone
numbers, shared within households and frequently stale on Leads.

**FullName + Postcode must not be a person match rule in B2B.** In a 600-account
target list, "James Smith at Smith Ltd" collides, and a false positive in account
based marketing means you market to the wrong person's activity.

### Reconciliation rules, field by field

| Field | Rule | Why |
|---|---|---|
| Email (display) | **Contact wins, always** | System of record. Recency would let a stale Lead email overwrite a verified Contact email |
| EmailHash | Contact's plain email, hashed at rest if the platform requires it; otherwise **not stored** next to the plain value | A hash is a match key. Storing both creates a second value to keep in sync and no new capability |
| WorkPhone | **Contact if non-empty, else the most recent non-empty Lead value** | **Source priority beats recency.** Recency alone resurrects the stale Lead phone, which is the actual bug in this scenario |
| MobilePhone | Contact if non-empty, else most recent non-empty | Same |
| FullName | Most recently **verified** CRM value. Never the commerce name | An unverified commerce name is a shipping label, not an identity |
| AccountId | The Contact's account wins. The Lead's account only if the Contact has none | Prevents a Lead record silently moving the person's company |
| Consent, per channel | **Opt-out always wins. No recency rule, no source priority** | A stale opt-in must never overwrite an opt-out the person just gave |
| Consent evidence | **Union of all sources**, keyed by channel and date. An erasure removes identifiers, never the event | The record of what was agreed has to survive the identifier |

### The unified profile afterwards

**One row per human**, containing:

- One canonical identity, with the source of every value recorded.
- One resolved value per field, each with the survivorship rule that chose it.
- Consent state **per channel and per purpose**, with the opt-out-terminal rule.
- Engagement history across email, SMS and WhatsApp, for frequency capping and
  for fit and engagement scoring.
- Every original source value retained for audit beside the resolved value, so a
  merge is reversible and the reasoning is inspectable.

**What it deliberately does not contain:** the commerce hash beside the plain
email address; the stale Lead work phone; the commerce name; raw order lines,
because Data 360 is not the order system; and any field with no downstream
consumer or no retention policy.

**The test to apply to the finished profile:** every field in it has a named
consumer, and every field excluded from it has a named reason. A profile that
fails either test is a data-quality incident within two ingest cycles.

### proj-04

### 1. The DNS record set

Subdomain: mail.marketing.customer.com - **dedicated to marketing, never the
corporate domain.**

| Record | Name | Type | Value |
|---|---|---|---|
| SPF | @ | TXT | v=spf1 include:_spf.salesforce.com include:spf.mta.customer.com ~all |
| DKIM | selector1._domainkey | CNAME | dkim1.customer.com |
| DKIM | selector2._domainkey | CNAME | dkim2.customer.com |
| DMARC | _dmarc | TXT | v=DMARC1; p=none; rua=mailto:dmarc@customer.com; pct=100 |
| MTA-STS | _mta-sts | TXT | v=STSv1; id=20260101000000 |
| TLS-RPT | _smtp._tls | TXT | v=TLSRPTv1; rua=mailto:tls@customer.com |

**Two decisions that matter:** a **second DKIM selector**, so the key can be
rotated without invalidating messages already in flight; and **~all (softfail)**
rather than -all on day one, because there is always a legitimate sender you did
not know about.

DMARC escalates p=none to p=quarantine to p=reject, and the signal that makes it
safe to move is **zero unidentified senders in the DMARC aggregate reports** for a
full reporting period.

### 2. The 14-day warm-up schedule

**Principles:** ramp slowly, send to the most engaged first, never ramp into a
peak. Stop immediately if a reputation metric moves against you - a warm-up that
resets is a restart, not a delay.

| Day | Volume | Audience | Why this segment |
|---|---|---|---|
| 1-2 | 20,000 (5%) | Opened in the last 30 days | The most engaged people. Lowest complaint risk, and their engagement trains the IP in the right direction |
| 3-4 | 50,000 (12.5%) | Engaged in the last 90 days | Wider, still strongly engaged |
| 5-6 | 100,000 (25%) | Active in the last 180 days | Mainstream engaged |
| 7-8 | 200,000 (50%) | Full qualified audience, excluding 180-day lapsed | The IP now has real volume and a real pattern |
| 9-10 | 300,000 (75%) | Full audience, marketing only | The remaining audience |
| 11-12 | 400,000 (100%) | Full audience | Full volume reached |
| 13-14 | 400,000 | Normal cadence | Exit warm-up. From here it is an ordinary send |

**Three constraints:**

1. **Never ramp into a peak.** If a promotional peak lands in the window, hold the
   ramp and start after it. A peak on a cold IP is the fastest route to a
   blocklist.
2. **Marketing only.** Transactional traffic stays on its own stream or IP.
   Mixing the two makes the pattern unpredictable and the reputation meaningless.
3. **Hold at 20,000 as long as the metrics warrant.** There is no rule that says
   14 days. There is a rule that says do not advance while the complaint rate is
   above target.

### 3. The triage query

```sql
SELECT
  s.IPAddress,
  s.BounceCategory,
  COUNT(*)                                       AS Affected,
  COUNT(DISTINCT s.EmailAddress)                  AS Contacts,
  COUNT(*) * 1.0 / COUNT(DISTINCT s.EmailAddress) AS RepeatsPerContact,
  MIN(s.SentDate)                                AS FirstSeen,
  MAX(s.SentDate)                                AS LastSeen,
  MIN(s.BounceDescription)                       AS SampleReason
FROM ent.<childsendlog> s
WHERE s.BounceCategory IS NOT NULL
  AND s.SentDate >= DATEADD(day, -7, GETDATE())
GROUP BY s.IPAddress, s.BounceCategory
HAVING COUNT(*) > 50
ORDER BY Affected DESC
```

**The RepeatsPerContact ratio is the diagnostic, and it is the column that
identifies the failure mode:**

| Ratio | IP pattern | Failure mode | First fix |
|---|---|---|---|
| **Low** (near 1.0) | One or two IPs | **Infrastructure or IP reputation.** Many distinct contacts, each failing once | Slow or restart the ramp. Request a reputation review |
| **High** (much above 1.0) | Spread across all IPs | **List hygiene.** The same address failing repeatedly across sends | Fix the import source. Re-permission and exclude the addresses |
| Low, **one destination only** | All IPs | **Provider filter list** | Reduce volume to that destination and request a review |
| Low, all IPs, **step change on a date** | All IPs | **Authentication** | Fix SPF/DKIM/DMARC alignment |

Run it daily during the warm-up and weekly afterwards. The guard rail is the
threshold, not the query: **any day with a hard-bounce rate above 2% or a
complaint rate above 0.1% halts the ramp**, and the ramp does not resume until the
cause is identified.

**The most common mistake in this runbook:** sending the full 400,000 on day one
because the audience is ready. The audience being ready is not evidence that the
IP is.

### proj-05

### The MCE version, AMPscript

```ampscript
%%[ SET @heroDesktop = "https://cdn.example.com/hero/desktop.jpg" ]%%
%%[ SET @heroMobile  = "https://cdn.example.com/hero/mobile.jpg"  ]%%

%%[ IF RequestMobileContent == "true" OR MobileInfo[0] IS NOT NULL THEN
      SET @hero = @heroMobile
   ELSE
      SET @hero = @heroDesktop
   END IF ]%%

%%[ SET @greeting = "Hi there," ]%%
%%[ IF NOT EMPTY(@FirstName) THEN
      SET @greeting = CONCAT("Hi ", @FirstName, ",")
   END IF ]%%
<!DOCTYPE html>
<html><body>
  <p>%%=v(@greeting)%%</p>
  <img src="%%=v(@hero)%%" width="600" alt="New arrivals" style="max-width:100%%;" />
  <ul>
%%[ FOR @rec = 1 TO 3 ]%%
%%[ IF NOT EMPTY(@Product_@rec) THEN ]%%
    <li>%%=v(@Product_@rec)%%</li>
%%[   ELSE ]%%   [ EXIT FOR ]%%
%%[ END IF ]%%
%%[ NEXT ]%%
  </ul>
  <a href="%%=v(@UnsubscribeUrl)%%">Unsubscribe</a>
  <a href="%%=v(@PreferenceCenterUrl)%%">Manage preferences</a>
</body></html>
```

Four things in there that are the difference between working and broken:

1. **Every variable is initialised before the IF.** An unset AMPscript variable
   renders as empty; an uninitialised @hero renders as a broken image.
2. **The repeat block exits on the first gap.** Without the ELSE [ EXIT FOR ], a
   contact with one recommendation gets two empty list items. This is the most
   common repeat-block bug and it is invisible until a contact with partial data
   receives it.
3. **Two hero assets, not one stretched image.** A single image across desktop and
   mobile destroys the text-to-image ratio in Gmail and Outlook, and it costs the
   inbox.
4. **Both the unsubscribe link and the preference centre link.** The preference
   centre is not a substitute for unsubscribe, and neither substitutes for the
   other.

### The MCN version, Handlebars

```handlebars
<p>{{#if firstName}}Hi {{firstName}},{{else}}Hi there,{{/if}}</p>

{{#if mobile}}
  <img src="{{heroMobileUrl}}" width="600" alt="New arrivals" class="mkto-img">
{{else}}
  <img src="{{heroDesktopUrl}}" width="600" alt="New arrivals" class="mkto-img">
{{/if}}

<ul>
  {{#each recommendations}}
    <li>{{this.name}} - {{this.price}}</li>
  {{/each}}
</ul>

<a href="{{unsubscribeUrl}}">Unsubscribe</a>
<a href="{{preferenceCenterUrl}}">Manage preferences</a>
```

### The three things that would break the AMPscript version in MCN

| # | What breaks | Why | What replaces it |
|---|---|---|---|
| 1 | The percent directive syntax | **MCE percent directives.** Not the MCN content template syntax at all, so the block never executes and the tag text can reach the customer | Handlebars expressions and block helpers: {{#if}}, {{#each}} |
| 2 | SET, IF/END IF, FOR/NEXT, EXIT FOR | **No imperative statements exist in Handlebars.** No SET, no explicit terminator, no loop control flow. The block closes itself | {{#if}} / {{else}} / {{/if}} and {{#each}}. Iteration is data-driven, so "exit on the first gap" becomes "iterate a list that is already only as long as the results" |
| 3 | FOR over numbered DE columns, and the DE row bindings | In MCE the bindings come from the Data Extension row on the send. In MCN they come from the **Data 360 unified profile as DMO fields**, and a list is a single field with a repeating value, not numbered columns | Data 360 DMO field names, and a **repeating field** for the recommendations. {{#each recommendations}} iterates a list, so a contact with one recommendation gets one item - the EXIT FOR problem does not exist in MCN |

**A fourth, worth naming because it costs real money:** in MCE an unresolved
attribute is a send-log bounce. In MCN a contact with no profile row renders the
fallback and the send succeeds - better behaviour, but it means a profile problem
shows up as 100% fallback greetings in reporting rather than as a send failure.
Watch the fallback rate, not the bounce rate.

### proj-06

### Flow type and entry source

| Element | Design | Justification |
|---|---|---|
| **Flow type** | **Record-triggered flow** in MCN, or a **Journey** in MCE | The behaviour is per-contact and real-time: a cart event creates an entry, and a decision at +4 hours is evaluated on that one person. A batch mechanism cannot make that decision |
| **Entry source** | The abandoned-cart audience, refreshed on the cart event, keyed on basket ID | The entry source is the basket, not a static list. A contact with two abandoned baskets in a week needs the de-duplication below |
| **Entry rule** | Basket value above threshold, cart not converted, no open basket in the last 7 days | Evaluated at entry, so a converted contact never activates |
| **Consent gate** | Marketing consent current for the channel, **in the entry rule** | Gated at activation, not at send |
| **De-duplication** | One active entry per contact **across all three tiers** | Without it a contact can be in tier 1 and tier 2 simultaneously: two messages about the same basket |

### The tier decision and the wait logic

| Tier | Basket value | Step 1 | Wait | Step 2 | Wait | Step 3 |
|---|---|---|---|---|---|---|
| **High** | over 200 | Email: we saved your basket | 4h | **SMS** (if SMS consent) | 20h | Email: last chance, with the basket link |
| **Medium** | 50 to 200 | Email: recommendations | 24h | Email: last chance | - | - |
| **Low** | under 50 | Email: recommendations | - | - | - | - |

Two rules that earn the mark:

- **The 4-hour decision is re-evaluated at step 1, not assumed.** If the cart
  converted during the wait, the contact exits and no SMS is sent. This is the
  whole point of a decision step after a wait.
- **SMS appears only in the high tier, and only with SMS consent.** The value
  threshold makes SMS cost-justified; the consent check makes it lawful. Both, or
  it is a compliance incident with a good ROI story.

### Conversion exit, re-entry and suppression

| Element | Design |
|---|---|
| **Conversion event** | Order placed or payment confirmed. **Not** "the cart is no longer in the audience" - that is a symptom and it fires late |
| **How fast** | Evaluated at **every** step boundary. A contact who converts at +3 hours exits before the +4h SMS, not at day 30 |
| **Remaining paths** | Contacts mid-wait are removed from **all** remaining steps immediately, across all tiers |
| **Exit reason** | Recorded as Converted, so an exit is distinguishable from a suppression or a timeout |
| **Second exit** | Window expiry at 30 days, reason WindowExpired |
| **Re-entry** | Allowed after exit, with a **90-day cooldown** measured from the exit date. One abandoned basket a year is a programme; five is a complaint |
| **Global suppression** | Unsubscribe or complaint suppresses across all channels permanently, as an anonymised tombstone |
| **Cross-channel suppression** | If email was sent for this basket, SMS is suppressed for the same basket event. **One intent, one owner channel** |
| **Frequency cap** | N contacts in M days across all channels, evaluated at entry against the interaction log |
| **Converter exclusion** | A contact with an order in the last 90 days is excluded from entry entirely |

### Why the exits are the design, not the afterthought

A cart-abandonment journey with no conversion exit markets a product the customer
bought four hours ago, at the moment they are most likely to be annoyed. It is the
most expensive omission in lifecycle marketing, it appears in every exam scenario,
and it is invisible in the design review - because on the canvas it looks
complete.

**The two that are usually both missing:** the conversion exit evaluated at each
wait boundary rather than only at the end of the window, and the cross-channel
suppression that stops email and SMS chasing the same basket on the same day.

**Implementation note:** put the entry evaluation in JourneyEntryEventService
rather than in the canvas, and write every allow or block decision to
Journey_Entry_Log__c with its reason. The canvas rules are then testable, and "why
was this person messaged twice" has a queryable answer.

### proj-07

```sql
SELECT
  s.EmailAddress,
  s.MobileNumber,
  c.TimeZone_Offset,
  MAX(CASE
        WHEN (HOUR - c.TimeZone_Offset + 24) % 24 BETWEEN 8 AND 20
        THEN 1 ELSE 0 END)                AS In_Window,
  MIN(DATEADD(hour,
        CASE WHEN (HOUR - c.TimeZone_Offset + 24) % 24 >= 8
             THEN (HOUR - c.TimeZone_Offset + 24) % 24 - 8
             ELSE (HOUR - c.TimeZone_Offset + 24) % 24 + 16
        END, GETDATE()))                  AS Earliest_Send
FROM SMS_Candidates_10DLC s
JOIN Contact_TimeZone__c c
  ON c.EmailAddress = s.EmailAddress
LEFT JOIN GlobalSuppression__c g
  ON g.EmailAddress = s.EmailAddress
 AND g.SuppressionType__c = 'SMS'
WHERE s.SMS_Consent__c = 1
  AND s.OptedOut__c = 0
  AND s.MobileNumber LIKE '+%'
  AND g.EmailAddress IS NULL
  AND s.EmailAddress NOT IN (
        SELECT EmailAddress FROM Marketing_Interaction__c
        WHERE Channel__c = 'SMS'
          AND InteractionDate >= DATEADD(day, -7, GETDATE()))
  AND s.MobileNumber NOT IN (
        SELECT MobileNumber FROM HardBounce__c
        WHERE BouncedDate >= DATEADD(day, -365, GETDATE()))
GROUP BY s.EmailAddress, s.MobileNumber, c.TimeZone_Offset
```

### The three predicates, and why each is not optional

**1. Consent - SMS_Consent__c = 1 and OptedOut__c = 0.** 10DLC requires explicit
opt-in for marketing, and the aggregator requires the evidence as part of
registration. Without this predicate you have a compliance incident *and* a
registration that cannot be renewed, because the evidence trail does not exist.

**2. Quiet hours, per contact time zone.** The messaging window is defined in the
**contact's local time**, not the sender's. One contact is deferred where another
sends. A global send window is either a breach for some time zones or an
unnecessarily small audience for all of them.

**3. Suppression, de-duplication and hard-bounce exclusion.** A contact who hard
bounced once will hard bounce again, and a carrier treats repeated failures as
spam. The 7-day SMS exclusion stops two systems messaging the same person about
the same event, which is the failure that loses a 10DLC registration.

### The deferral design, not a drop

Rows with In_Window = 0 go to a **deferred DE** with Earliest_Send written to
Deferred_Send_Date. The deferred DE is a first-class audience, not a leftover.

**The rule that makes this compliant:** a deferred row is a **scheduling
instruction, not a permission**. The next run re-evaluates the consent and
suppression predicates before selecting anything, so a contact who unsubscribed
during the deferral never matches the send branch.

A queue built from a snapshot of consent taken at 02:00 will send at 09:00 to
someone who stopped at 06:00, and it will do it invisibly, because the queue looks
like it is working.

### The four time zones, and what actually happens

| Time zone | Consequence at a 02:00 UTC run |
|---|---|
| UTC-5 / UTC-6 | Mid-afternoon local: sends immediately |
| UTC+1 | 03:00 local: **deferred**, picks up at 08:00 local |
| UTC+9 | 11:00 local: sends immediately |
| UTC+13 | 15:00 local: sends immediately |

**So a single overnight run does not reach the whole audience.** The deferred DE
is not an edge case, it is roughly a third of the list, and an automation with no
deferral step simply drops that third. Report sends and deferrals separately, or
the campaign will look under-delivered for reasons that have nothing to do with
deliverability.

### proj-08

### Capability map

| Advertising Studio capability | Data 360 equivalent | Fidelity | Gap | Mitigation |
|---|---|---|---|---|
| **Audience building** | Data 360 segments | **Exact** | None | Port the definitions directly as segments |
| **Exclusions** | Segment criteria | **Exact** | None | Put exclusions **inside** the segment definition, not in a separate list a refresh can forget |
| **Suppression** | Per-channel advertising consent on the profile | **Approximate** | AS had a single global list. Data 360 requires suppression to be expressed as per-channel consent - a model change, not a setting | Build the consent fields **first**. This is the longest-lead item in the whole migration |
| **Frequency capping** | Cross-channel frequency logic over the interaction log | **Approximate** | AS capped per audience; Data 360 caps per contact across channels, which is better and is **not automatic** | Build it explicitly. Expect the first cycle to run uncapped, and cap manually during it |
| **Meta sync** | Data 360 Ad Audiences | **Approximate** | New connection and new audience identifiers in the Meta Ads Manager. AS audience IDs do not survive | Reconnect, and re-learn audiences by name with a documented mapping. Never rely on the AS IDs |
| **Google Customer Match sync** | Data 360 Ad Audiences plus the Google Ads integration | **No exact equivalent** | The 2023 Customer Match configuration is **tied to the AS connection**, not to your data. It breaks at cutover even if the audiences are byte-identical | **Rebuild the Customer Match list from scratch in Google Ads** and confirm eligibility before the AS subscription ends |
| **Exclusion lists at the destination** | Data 360 Ad Audiences exclusions | **Approximate** | Destination-side lists are additive and go stale | Push exclusions on every refresh and audit the destination lists monthly |
| **Reporting** | Insights on Data 360 | **Approximate** | Different metric definitions. AS campaign counts will not reconcile | Publish a **mapping document** before cutover, so nobody reconciles two sets of numbers |

### Sequencing so the contract is not the deadline

The contract ends **March 2027**, which is the failure mode: work scheduled
backwards from a contract date arrives at that date unfinished. The sequence is
built forwards from the two items with external lead times.

| Phase | Weeks | Work | Why here |
|---|---|---|---|
| **0. Risk removal** | 1-2 | **Rebuild the Google Customer Match list in Google Ads and confirm eligibility.** Nothing else starts until this is verified | It depends on Google's review queue, not on your project plan. It is the one item that can make you miss the date, and you cannot compress it |
| 1. Foundation | 2-4 | Per-channel consent fields, interaction log in place, match rate measured on current AS data | Everything downstream depends on consent and identity. Starting here is what keeps the rest short |
| 2. Parallel run | 4-6 | Segments built in Data 360, sent to Meta and Google **alongside** AS | Dual running proves the audiences and gives a match-rate comparison. Both are live, so there is no gap |
| 3. Validate and cut over | 2 | Cutover criteria met, AS switched off, Data 360 becomes the source | The criteria below |
| 4. Decommission | 1-2 | AS retired, reporting remapped, runbooks updated | Do not skip this. Two systems both "the source of truth" is how data diverges permanently |

**Total: 12-17 weeks against a contract that runs to March 2027.** The plan
finishes with margin, and the margin is what absorbs the phase-0 surprise.

### Match-rate validation

| Metric | Baseline (from AS today) | Target at cutover | Why |
|---|---|---|---|
| **Match rate, Meta** | Record it in week 1 | **90% or better of the AS baseline** | Below this you are paying for unmatched audience and the campaign gets worse |
| **Match rate, Google Customer Match** | Record it in week 1 | **90% or better of the AS baseline, and eligibility confirmed** | Eligibility is binary. A pending review is not a partial success |
| **Audience member count per segment** | Record per segment | **Within 2%** | A material difference means a segment definition did not port |
| **Suppressed contacts per audience** | Record per segment | **Equal or higher** | Fewer suppressions means the consent fields are not wired |
| **Post-campaign delivery and frequency** | 30-day baseline | **No increase in frequency for any contact** | The whole point of the migration. If frequency rises, duplicates leaked in |

**Validation method:** run the same segment in both systems for two weeks, compare
counts daily, and reconcile the difference at contact level. A count difference
you cannot explain at contact level is a failed validation, however small.

### Rollback trigger

**Any one of these, immediately, without a meeting:**

| Trigger | Threshold | Action |
|---|---|---|
| Match rate collapses | **Below 70% of the AS baseline** on either platform | Roll back |
| Audience size changes | **More than 10%** from the validated figure on any segment | Investigate; roll back if unexplained within 24 hours |
| Duplicate profiles activate | **Any contact appearing twice in one audience** | Fix identity, then roll back if not fixed the same day |
| Suppression failure | **Any suppressed contact present in an audience** | Roll back immediately. This is a compliance failure, not a performance one |
| Google eligibility | **Pending or rejected at cutover** | Do not cut over Google. Leave AS running for Google only and cut over Meta |
| Contact frequency rises | **Above the pre-migration 30-day maximum for any contact** | Roll back. This is the incident the whole programme exists to end |

**The rollback architecture, decided in phase 0 and not in week 12:** AS stays
**fully configured and unexpired** for the whole parallel run, with the
subscription extended if necessary. Rollback is then a switch of the source
system, not a rebuild. A rollback plan that requires rebuilding an audience is not
a rollback plan.

**The single hardest constraint, stated plainly:** the AS subscription must not be
allowed to lapse while the migration is in flight. Extend it, even at a cost, and
treat the extension as the insurance premium. Expiring the contract to force a
deadline is how this migration fails on day one.

<!-- projects:end -->

## Result

| Outcome | What it means | What to do |
|---|---|---|
| 54+ / 60 (90%) | Exam-ready | Sit the mock twice more under time, then book |
| 45–53 (75–88%) | Strong, with identifiable gaps | Close the gaps in the two lowest-confidence domains above 80% |
| 36–44 (60–73%) | Blueprint not yet covered | Return to the 30% and 25% domains first |
| Below 36 | Not ready | Work phases 1–12 in order, then re-audit |

**Target: 39 correct is the floor** (65% of 60). Anything above 45 gives you
headroom for the questions that surprise you on the day.
