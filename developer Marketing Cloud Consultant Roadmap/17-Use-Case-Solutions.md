# 17 — Use Case Solutions

> Phase 17 of 17 — full worked solutions for all four scenarios.

**These are not model answers, they are worked solutions.** Each one states
the binding constraint, names the system of record for every attribute that
matters, gives a numeric threshold wherever a decision can be validated, and
ends with what it deliberately does **not** build.

Generated from `docs/assets/answers.js` and the phase 16 briefs in
`docs/assets/curriculum.js` by `scripts/sync-use-case-guides.js`, so the
Markdown and the in-browser academy cannot drift apart.

Briefs: [16 — Real-World Use Cases](16-Real-World-Use-Cases.md).

---

## What every solution below has in common

- Every solution states what it deliberately does **not** build.
- Every solution names the system of record per attribute.
- Every solution includes a rollback.
- Every solution validates before cutover, against a numeric threshold.
- Every solution carries a cost line and a named owner for each decision.

> **Read UC4 twice.** The coexistence migration is the scenario that most
> resembles the work consultants are actually being asked to do right now.


---


## UC1 Omnichannel Lifecycle Campaign (Retail)

### The brief

- Omnichannel retailer, 1.2M loyalty members, growing 2.5% monthly. Wants email, SMS and WhatsApp in one program.
- Journey Builder exists for email only. SMS consent sits in a spreadsheet. WhatsApp is not yet set up.
- Marketing Cloud Engagement, Professional core edition, so Marketing Cloud Next is not available.
- Constraint: the CRM is losing SMS opt-ins every week because two systems write the list.
- Success is defined as incremental revenue, not engagement metrics.

### The solution

### 1. Fix the consent data model first

**Nothing else can be trusted until this is fixed, and the reason is arithmetic
rather than philosophical.**

The CRM is losing SMS opt-ins every week because two systems write the list. Every
design decision downstream reads consent:

| Decision | Depends on |
|---|---|
| Which channel sends a contact | Consent state, per channel |
| Whether SMS is in the channel sequence at all | The SMS consent rate |
| What the suppression list contains | Consent history |
| What the frequency cap counts | The interaction log, written per consented send |
| The incrementality measurement | Whether the control group is consented |

**If consent is lossy, every one of those is unreliable.** A campaign planned on a
50% SMS consent rate that is really 35% sends 15% of the audience as though they
had opted out, and the resulting complaint rate is then read as a content problem
rather than a data problem. You would spend the whole programme optimising the
wrong thing.

**The fix:**

1. **One authoritative consent record per channel**, in the CRM, with the evidence
   artefact. Not a spreadsheet, and not a list that two systems write.
2. **Reconcile the two writers now**, before the channel sequence is designed.
   Count the opt-ins the CRM holds that the operational system does not, and the
   reverse. That difference is the size of the problem, and the business needs to
   see the number.
3. **Take writes from one system and suppress the other.** A channel where two
   systems write will keep losing consent, regardless of reconciliation frequency.
4. **Never let a sync overwrite an opt-out.** Opt-out is terminal until a fresh,
   evidenced opt-in. Recency is not the rule.
5. **Start measuring the weekly loss rate** as a metric, so the fix is provable.

### 2. The channel sequence and the per-channel gate

| Stage | Channel | Timing | Gate |
|---|---|---|---|
| 1 | **Email** | Immediately | Marketing consent and deliverable. The default, because it needs no registration and no lead time |
| 2 | **SMS** | +4 hours, **only if no email click** | SMS consent, current. Plus a frequency cap and quiet hours in the contact's local time |
| 3 | **WhatsApp** | +24 hours, **only if no click and no SMS** | WhatsApp consent, **and a pre-approved template**. The business case does not include the WhatsApp entitlement, so this stage is not in the year-one plan |
| - | **Never** | - | More than one channel per intent per window |

The sequence is ordered by **cost of registration, not cost per message**: email
needs no registration, SMS needs 8-12 weeks of 10DLC registration, WhatsApp needs
template approval. So email is primary, SMS is the escalation, and WhatsApp is out
of scope until the entitlement exists.

**The gate is in the entry rule, for every channel.** Not in the content, not at
send time. At activation the profile is never treated as marketable if it is not
consentable - which matters because the WhatsApp and paid paths transfer the data
to a third party.

### 3. Suppression and frequency policy across all three channels

| Rule | Value | Why |
|---|---|---|
| **Cross-channel frequency cap** | **4 contacts per member per 30 days**, rolling, all channels | 4 a month is comfortable for a loyalty programme. Above 5-6, complaint rates rise sharply in retail |
| **Service exceptions** | Transactional and service messages **excluded** from the cap | A cap that suppresses a delivery notification is worse than fatigue |
| **One intent, one owner channel** | If email is sent for a basket or a churn risk, SMS is suppressed for the same intent | Stops the customer getting the same message twice in four hours |
| **Channel sub-limit** | Marketing may use at most 2 of the 4 | Guarantees headroom for transactional messages |
| **Converter suppression** | A member who bought in the last 30 days is excluded from the reactivation path | The classic "why are you advertising me the thing I just bought" |
| **Global suppression** | Unsubscribe or complaint suppresses across all three channels, permanently, as an **anonymised tombstone** | If the tombstone is deleted, the next import rebuilds the profile and they are messaged after unsubscribing |
| **Soft degradation** | At 3 contacts, drop the lowest-priority promotional channel first | Degrades gracefully rather than hitting a wall |

**Enforcement is at entry, on the interaction log, before activation.** A cap
measured after the fact is a report, not a control.

### 4. What I would NOT build, and why

| Would not build | Why |
|---|---|
| **The WhatsApp stage this year** | The business case does not include the WhatsApp entitlement, and the core edition is Professional, so MCN is unavailable. WhatsApp is an MCN entitlement. Stage 3 stays on the roadmap, not in the build |
| **Personalisation beyond name and store** | 1.2M members growing 2.5% monthly, with consent data that is currently lossy. Anything richer depends on a profile that is not yet trustworthy, and it will be wrong at scale rather than obviously wrong |
| **A Marketing Cloud Next migration in year one** | Professional core. The org upgrade is a separate, larger decision and should be made on its own merits, not as a dependency of a loyalty programme |
| **AI decisioning** | Not an MCE capability at that level. Einstein is available, but the profile quality next-best-action requires does not exist yet. Consent fix first, then profile, then decisioning |
| **A fourth channel** | Three channels with a working consent model is worth more than four channels with a lossy one |
| **Per-member dashboards** | The success metric is incremental revenue, not engagement. A dashboard per member would measure the wrong thing and cost the team its attention |


---


## UC2 B2B Account-Based Marketing and Lead Nurture

### The brief

- B2B software company, 40,000 contacts across Sales Cloud and Marketing Cloud, 600 target accounts.
- Leads captured by three systems. Marketing Cloud Connect is configured but scoped to one user.
- Sales asks for leads scored on buying intent; Marketing wants to nurture the whole buying group.
- Constraint: the buying group has 4-7 people and only one of them is ever in Marketing Cloud.
- Compliance: GDPR applies to EU contacts and the customer has no consent record for them.

### The solution

### 1. Identity resolution across Lead, Contact and account

| Order | Source | Key | Normalisation | Authority |
|---|---|---|---|---|
| **1** | Contact | Email | Trim, lowercase, plus-addressing stripped | **Authoritative** for email |
| **2** | Lead | WorkEmail | Same normalisation | Not authoritative - the Lead email is often a personal address the person will not check |
| **3** | Lead/Contact | WorkPhone | E.164 | Secondary. Shared in households, frequently stale on Leads |
| **4** | Lead/Contact | MobilePhone | E.164 | Secondary |
| **5** | Contact | AccountId and title | Not a person match | **Account match only** - never used to merge two people |
| **6** | Any | DeviceId | Exact | Last resort |

**Rules that matter specifically here:**

- **A Lead and a Contact are frequently the same person**, and with a 4-7 person
  buying group that is the norm, not the exception. Leaving them unmerged is
  exactly why "only one of them is ever in Marketing Cloud".
- **Name plus postcode must not be a person match rule.** In a 600-account target
  list "James Smith at Smith Ltd" collides, and a false positive in account-based
  marketing means you market to the wrong person's activity.
- **Account matching is a separate ruleset** from person matching, and it runs
  after the person is resolved. Matching a person to an account and merging two
  people are different operations with different failure modes.

### 2. Account selection model

**Fit Score, computed from firmographic attributes, applied at the account level.**

| Alternative | Verdict |
|---|---|
| **Fit score (chosen)** | Firmographic and technographic attributes scored 1-100 per account. Explicit, reviewable, and a sales team can argue with a number they can see |
| Engagement score | Useful as an **input** to fit, not as the selector. High webinar engagement is common in accounts that will never buy, and it biases toward accounts marketing already targets |
| Combined fit and engagement | **The right answer for the nurture selector**, and it needs a decision: use engagement as a filter **within** the fit tier, not as a tie-breaker between tiers |

**Justification:** 600 accounts is small enough that a sales team can review the
whole list. Fit score is auditable, and auditability is what makes a sales team
trust a marketing selection. Engagement-only selection produces a list marketing
generated, and sales will not work it.

**Tier the 600 accounts:** Tier 1 (top 100 by fit) gets the high-touch,
account-specific programme; Tier 2 gets the standard nurture. One programme across
600 accounts is the same as no personalisation.

### 3. Nurture orchestration, including the non-contact buying group

| Element | Design |
|---|---|
| **Flow type** | Record-triggered flow (MCN) or Journey (MCE) per tier, entered from an account-based segment rather than a contact list |
| **Entry** | The account enters the programme, and the resolved buying group enters with it |
| **Buying group** | Contacts matched to the account by email, phone and account ID, plus **the identifiable non-contact buying group**: email addresses collected in the same content interaction, associated to the account, and consent-checked individually |
| **Non-contact members** | Receive content, but are **not** scored as leads and are **never** counted in attribution as individuals. They are evidence that the account is engaged, and that is all |
| **Scoring** | Fit score sets the tier. Engagement and intent signals are the decision criteria **inside** the tier. Nobody enters Tier 1 on engagement alone |
| **Frequency** | **Per contact, across all accounts they are in.** A person in three buying groups is messaged once, not three times |
| **Re-entry** | Cooldown **per account**, not per contact. An account that re-engages does not restart a contact's programme mid-flow |
| **Sales handoff** | On intent threshold, create or update the lead, alert the account owner, and set a re-entry cooldown. The nurture then **withdraws** from that contact for 30 days |
| **Consent** | Per contact, per channel. An EU contact with no consent record gets content-only, non-tracking, no profiling |

**The rule that earns the mark:** a non-contact buying group member is
**individually consent-checked**. "They are a contact at our target account" is
not a lawful basis. They may be reached through the account's marketing, but the
consent requirement applies to them exactly as it applies to anyone else, which is
why the 6% GDPR-ineligible population is excluded from every tracked activity.

### 4. Attribution for a 6-month sales cycle

| Element | Recommendation | Reason against the cycle |
|---|---|---|
| **Primary model** | **Last click, 90-day lookback, all channels** | A 6-month cycle spreads touches widely. A 30-day window structurally under-credits the campaign that closed a deal decided over months |
| **Secondary, labelled diagnostic** | **First touch, 90-day lookback** | Shows which content opened the account. Diagnostic, never the scorecard |
| **Also reported** | **Time-to-conversion distribution by campaign** | The most useful number in the design. If A converts at 30 days and B at 150, B works in this cycle and no attribution model will show it |
| **Level** | Attribution is reported at **account** level, then decomposed to contacts | With a 4-7 person buying group, contact-level attribution is noise. The account is the buying unit |
| **Excluded** | Marketing-sourced versus sales-sourced lead attribution | It answers "who filled in the form", which is not the question |
| **Incrementality** | A holdout group of target accounts receiving no nurture for one quarter | The only number that answers "did this cause revenue". Attribution says where a deal started; only a holdout says what would have happened anyway |

**The sentence for the client:** "Over a 6-month cycle, last-click at 90 days
across all channels is the only model we can defend to your finance team, and we
report first-touch beside it so you can see which content opens accounts - but the
number we will hold ourselves to is the holdout, because attribution tells you
where a deal started and only a holdout tells you what would have happened
without us."


---


## UC3 AI-Powered Consent-First Engagement

### The brief

- Financial services, 300k customers. Wants an Agentforce agent handling inbound SMS and WhatsApp.
- Two high-volume intents: balance enquiries and card-replacement requests. Everything else must go to a human.
- Regulated sector. No PII may be retained in the conversation beyond the retention window.
- Marketing Cloud Personalization is already deployed against a weak Data 360 profile.

### The solution

### 1. Agent scope, escalation path and handoff criteria

**Two intents, and only two. Everything else is a handoff.**

| Intent | The agent handles | Authority | What the agent may **not** do |
|---|---|---|---|
| **Balance enquiry** | Retrieve and state the balance | Read-only on the balance | Give financial advice. Recommend a product. Explain a balance movement beyond the transaction record |
| **Card replacement** | Collect the request, verify identity, raise the case, confirm the temporary card | Raise a case against an existing account | Approve a permanent replacement. Unblock a card. Change a limit |
| **Everything else** | **Nothing.** Acknowledge and hand off | - | - |

The two high-volume intents are the whole business case, and they are also the two
with a natural termination. An agent that handles only these is auditable,
testable, and cheap to run in simulation before it touches a customer.

**Forbidden in a regulated sector:** giving advice, approving a limit or permanent
replacement, changing account details, or making a recommendation. Each is either
regulated advice or a fraud vector, and no volume saving justifies it.

### Escalation and handoff

| Condition | Action |
|---|---|
| Intent outside the two above | Immediate handoff, with a stated expected response time |
| Customer asks for a person | Immediate handoff. No retention attempt, no "are you sure" |
| Sentiment deteriorates, or two failed turns | Handoff to a human |
| Any case requiring a write to a financial record | Handoff, and the agent tells the customer it is being escalated rather than pretending to complete it |
| Customer disputes a balance, or mentions fraud | **Priority handoff** to the fraud team, not the general queue |
| Agent confidence below threshold on the two in-scope intents | Handoff. A wrong balance is a conduct breach, not a quality dip |
| Channel failure or no response within the session window | Handoff with a transcript |

**The handoff must carry state:** the transcript, the verified identity level, the
intent, and what has already been told the customer. A handoff that restarts the
conversation is worse than no agent at all - the customer explains themselves
twice, and they will not forgive it.

**The retention constraint, enforced in the conversation:** PII is retained only
for the retention window. That means **no free-text retention in the transcript**,
a structured field for anything the agent needs to remember, and a hard expiry on
the transcript. The agent must not write a customer's full account details into a
summary field "for context", because that field outlives the window.

### 2. Where consent is checked, and what happens when there is none

| Point | What is checked | If there is no consent |
|---|---|---|
| **Before the conversation starts** | Is this channel consented for this purpose | The agent does not start a marketing-adjacent conversation. It states it can only assist with service, and closes |
| **At identity verification** | Is the identity verified to the level the intent requires | Below the level for a card replacement, the agent stops and hands off. It does not proceed "for information only" |
| **Before any transactional action** | Is the action permitted for this account | The agent explains it cannot do that, and hands off |
| **Before any data leaves the conversation** | Is the disclosure permitted | Nothing leaves. No email summary, no case attachment beyond the minimum |
| **At close** | Is a follow-up permitted | **No follow-up. The case reference only.** The interaction is recorded as a service interaction, not a marketing interaction |

**The critical distinction: inbound service is not consent to market.** The fact
that a customer messaged the bank does not create a marketing relationship. The
consent gate for any subsequent campaign is evaluated independently, and a
customer who used WhatsApp for a card replacement has **not** opted in to
promotional WhatsApp.

This is the specific mistake the scenario tests. In financial services it produces
a marketing consent record derived from a service interaction, and it produces a
regulatory finding.

### 3. Fixing the Data 360 profile so Personalization becomes useful

Marketing Cloud Personalization is deployed against a weak profile. The problem is
not the tool, and adding a second tool would make it worse.

| Problem | Fix | Order |
|---|---|---|
| **Match rate is low** | Tighten match rules: email normalised as rule 1, a strong secondary key second, device ID last. Measure the match rate before and after | **1** |
| **Duplicates** | Re-run identity resolution, then **measure and enforce a duplicate rate**. A duplicated profile in Personalization means the same person gets two experiences | **2** |
| **Unreconciled fields** | Add reconciliation rules with field-level survivorship. Recency alone resurrects stale values | **3** |
| **No behavioural data** | Identity resolution first, then consent-safe event collection, then fit and engagement scoring | **4** |
| **No consent state on the profile** | Per-channel consent, opt-out terminal. **Personalization must not render an experience to a contact who has not consented to the channel** | **5** |
| **No event stream** | Streaming events into Data 360 so Personalization has something to decide on | **6** |

**The order is the answer.** Personalization is a decisioning layer, and a
decisioning layer on a weak profile does not get better - it gets confidently
wrong at scale. Every hour on the profile is worth more than every hour on
Personalization configuration.

**The gate:** do not move Personalization from rule-based to model-driven until the
match rate and duplicate rate are measured and stable. A model-driven experience
on a 60% matched profile is a compliance incident delivered individually.

### 4. The dashboard and the three escalation metrics

**Dashboard: one screen, four panels, for the agent owner and the DPO together.**

| Panel | Contents |
|---|---|
| **Volume and intent mix** | Conversation volume split by intent and channel, with the handoff rate |
| **Deflection and containment** | Percentage resolved without a human, and **percentage escalated for cause** - fraud, dispute, sentiment, low confidence |
| **Consent and compliance** | Conversations blocked for lack of consent. Transcripts past the retention window: **must be zero**. PII written into free text: must trend to zero |
| **Quality** | Sampled accuracy on the two in-scope intents, plus post-conversation satisfaction |

**The three metrics to escalate on:**

| # | Metric | Threshold | Why this one |
|---|---|---|---|
| **1** | **False-answer rate on the two in-scope intents**, from audited sampling | **Any confirmed incorrect balance, or above 0.5%** | In a regulated sector this is the metric that ends the programme. A wrong balance is a conduct breach, and sampling is the only way to surface it. This cannot be measured passively |
| **2** | **Handoff rate, split into justified and unjustified** | **Above 40% overall, or any rise in *unjustified* handoffs** | Too high and the business case fails. Too low and the agent is answering things it should not be. The split is the point: a rising unjustified rate means scope creep, the most likely failure |
| **3** | **Opt-out rate during service conversations** | **Above 2%, or any rise in contacts who engaged with the agent and then blocked the number** | The earliest signal that the agent is being used for something other than service. It also predicts registration and deliverability consequences, so it is the metric with teeth |

**Why not volume, CSAT or cost per conversation:** volume is not a quality metric,
CSAT lags, and cost per conversation improves right up until the agent becomes
unsafe. The three above all fail before the cost metric does.


---


## UC4 Marketing Cloud Engagement to Marketing Cloud Next Migration

### The brief

- Subscription retailer, 8 years on Marketing Cloud Engagement, 45 journeys, 120 Data Extensions, core edition upgrading to Enterprise.
- Legal requires the full historical consent and send record to remain provable.
- Two Business Units today, with content built by an agency under a shared login.
- Constraint: the business case requires the WhatsApp channel, which the current edition does not include.

### The solution

### 1. Migration sequence, and what stays in Engagement

**The principle: the org upgrade comes first, and nothing that carries the audit
trail moves until a second system can prove it.**

| Phase | Work | What stays in Engagement |
|---|---|---|
| **0. Upgrade readiness** | Core org upgraded to Enterprise. **Nothing else starts** - MCN is unavailable until this completes | Everything. No migration activity |
| **1. Foundation** | Data 360 instance, identity resolution, consent model, reporting, running **alongside** | All 45 journeys, 120 DEs, all sending. **No coexistence risk yet** |
| **2. Content rebuild** | Rebuild the agency's content in MCN, highest-value journeys first, not all 45 | Everything still in Engagement. **The agency works in parallel, in both systems, for the whole phase** |
| **3. Parallel send test** | A small percentage of the audience sent from MCN, with real measurement | All journeys running. **This is the coexistence period, and it is where the audit trail splits** |
| **4. Cutover, by journey** | Move journeys in batches, each validated before the next | Journeys already migrated run in MCN. **The remainder stay in Engagement** |
| **5. Decommission** | Engagement retained read-only for the legal retention period, then archived | **Frozen, not deleted.** That is the point |

**The four things that stay in Engagement for the whole coexistence period:**

| Stays | Why |
|---|---|
| **The consent and send record** | Legal requires it provable. It stays as the system of record, and MCN is built around it rather than replacing it |
| **Any journey mid-flight at cutover** | Migrating a live journey orphans everyone in it. Let it complete, then migrate the next cohort |
| **The DEs that are the audit source** | The 120 DEs include the consent and suppression evidence. Freezing them preserves provenance |
| **The agency login** | Not a system of record, but a shared login across 2 BUs is a control failure that must be fixed **before** either system goes live |

**What moves last, and is deliberately not moved:** the historical send log and
consent evidence. Both stay read-only in Engagement for the retention period, and
MCN is populated with **current-state consent**, not history. History stays where
it was generated, which is also the easiest answer to prove.

### 2. Consent and send-record portability that satisfies legal

**The design principle: portability of the current state, preservation of the
history in place.**

| Asset | Moves to MCN? | How |
|---|---|---|
| **Current consent state** | **Yes** | Carried as current state into the MCN consent object, one record per contact per channel, with source and captured date preserved |
| **Consent evidence history** | **No** | **Stays in Engagement, read-only, for the retention period.** Referred to, not copied |
| **Send log, 8 years** | **No** | Stays. The built-in data views remain queryable in the frozen tenant |
| **Global suppression** | **Yes, as a tombstone** | Every suppressed contact, anonymised, carried into MCN **before** any journey goes live. Non-negotiable |
| **Marketing Cloud Connect** | **Yes** | Repointed to the new org, then the old connection retired |
| **The agency shared login** | **Removed** | Replaced with named agency users in an Enhanced CMS Workspace per brand |

**The portability mechanism that satisfies legal:**

1. **Anonymised consent history travels as a reference, not a copy.** The MCN
   consent record carries a pointer to the Engagement consent event, so "what did
   this person agree to, and when" is answerable from MCN without duplicating the
   personal data.
2. **Current-state consent migrates first**, and is validated before anything else
   is switched on. A count reconciliation on consent records, channel by channel,
   is the migration's acceptance test.
3. **The suppression tombstone list migrates first of all**, before the first MCN
   journey exists. A suppressed contact must never have a path to a send in the
   new system.
4. **Every migration step writes an audit record**: what moved, when, by whom, and
   the validation result. That record is what proves portability to an auditor six
   months later.
5. **The frozen Engagement tenant is retained**, with its retention policy intact,
   until the longest applicable retention period expires.

**What this design explicitly does not do:** copy 8 years of PII into a new
system to prove a point. Preservation in place, plus references, satisfies the
requirement with the minimum data movement - and minimum data movement is itself a
compliance posture.

### 3. Agency access and content governance

**The shared login is the finding. It is a control failure, not a process
problem, and it has to be fixed before either system goes live.**

| Today | Change |
|---|---|
| One login shared by the agency across 2 BUs | **Named agency users**, one per person. No shared credentials |
| One shared content library | **An Enhanced CMS Workspace per brand**, with a **Personal workspace per agency user**, so drafts are invisible to the client and to other agency users |
| Agency can publish | **Agency can create and edit. Admin or brand owner approves and publishes** - a second, deliberate act by someone who did not write it |
| No content attribution | **Content owner and approver recorded on every asset**, in the content record |
| Agency can see all 2 BUs | **Scoped to the BUs they are contracted for**, via permission set groups |
| Offboarding = remove the shared login | **Offboarding = deprovision named users, and content ownership is reassigned** to an internal owner, so no asset is orphaned when an individual leaves |

**Why this must come before the migration:** the agency is rebuilding 45 journeys'
worth of content in MCN under whatever access model exists at that moment. Fixing
access **after** the rebuild means re-scoping hundreds of assets and losing the
audit trail of who changed what, during the most expensive phase of the project.

### 4. Cutover criteria, validation and the rollback trigger

**Cutover is by journey batch, and each batch must clear all six criteria:**

| # | Criterion | Threshold |
|---|---|---|
| 1 | **Consent state reconciles** | MCN consent record count equals the Engagement count **per channel**, zero unexplained difference |
| 2 | **Suppression list is complete** | Every suppressed contact in Engagement exists as a tombstone in MCN. **Zero tolerance - a compliance criterion, not a quality one** |
| 3 | **Audience count reconciles** | MCN segment count within 1% of the Engagement DE count for that journey's entry source |
| 4 | **Content parity** | Every asset in the migrated journey exists, with the same personalisation and the same unsubscribe handling |
| 5 | **A test send has landed** | Seed-list test per segment, in every migrated time zone, and the bounce reason for any failure is the send DE rather than content |
| 6 | **Rollback is proven** | The batch can be switched back to Engagement within the agreed window, and this has been rehearsed |

### The validation plan

| Window | What you do | What proves it |
|---|---|---|
| **T-14 days** | Freeze the batch. No new content, no new DE changes in the scope of that batch | A frozen scope is what makes a count comparison meaningful |
| **T-10 days** | Backfill and reconcile consent, suppression and audience counts | Criteria 1, 2 and 3 pass with zero unexplained difference |
| **T-7 days** | Seed-list test sends, every segment, every time zone | Criterion 5 |
| **T-5 to T-2** | **5% of the audience served from MCN**, remainder from Engagement, with a holdout | Delivery, bounce, complaint and unsubscribe rates are within tolerance of the Engagement baseline |
| **T-2** | Go or no-go against all six criteria, signed off by marketing, ops and the DPO | A documented decision, not a verbal one |
| **T-0** | Cut over the batch | - |
| **T+7** | Full comparison against the Engagement baseline. **Rollback window closes at T+7** | The window is closed only after the comparison, not on a date |

### The rollback trigger

**Any one of these fires the rollback immediately, without a meeting:**

| Trigger | Threshold | Why it is immediate |
|---|---|---|
| **Suppression failure** | Any suppressed contact present in an MCN audience | This is a compliance failure, not a performance one. There is no acceptable rate |
| **Consent divergence** | Any contact messaged without a valid current consent record | Same. It is the failure the whole plan exists to prevent |
| **Match or audience collapse** | Audience count or match rate more than 5% off the validated figure | The audience is wrong, and everything downstream of it is wrong |
| **Deliverability** | Bounce rate up more than 2 points, or complaint rate above 0.1%, on the migrated batch | Reputation damage compounds. Fixing it later is far more expensive than reverting now |
| **Control group breach** | The holdout is contacted by any migrated journey | The incrementality measurement is destroyed, and the business case loses its only defensible number |
| **Any criterion unprovable** | If you cannot evidence criteria 1 or 2, you do not cut over | An unprovable migration is a failed migration with extra steps |

**The rollback architecture, decided in phase 0:** the Engagement tenant stays
**fully configured, unexpired and warm** for the whole coexistence period, with
the 45 journeys intact and sending-capable. Rollback is then a switch of the
source system, not a rebuild.

**A rollback plan that requires rebuilding an audience is not a rollback plan.**
And the AS-style lesson applies here: do not let the Marketing Cloud Engagement
subscription lapse while the migration is in flight.
