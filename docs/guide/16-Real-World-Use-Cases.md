# 16 — Real-World Use Cases

> Phase 16 of 17 — four consulting scenarios, briefed not solved.

Read each case **twice**: once for the story, once for the constraints. The
binding constraint decides the architecture. The story is decoration.

Attempt them the way you would attempt a real engagement, and find the
binding constraint before you propose anything.

Answers: [17 — Use Case Solutions](17-Use-Case-Solutions.md).

---

## How to read a brief

1. Find the sentence that says what is *constraining* the work. That is the
   binding constraint, and it decides the architecture.
2. Ask what the system of record is for every attribute before proposing a
   single sync.
3. State the cost. A recommendation without a cost line loses to a cheaper
   one by default.
4. Always produce a rollback. A cutover with no rollback is a bet, not a
   plan.
5. Name what you would **not** build. Scope discipline is the skill being
   tested.

| Case | Shape | The hard part |
| --- | --- | --- |
| UC1 | Omnichannel lifecycle, retail | Sequencing three channels without annoying anyone |
| UC2 | B2B ABM and lead nurture | Identity across Sales and Marketing with consent |
| UC3 | AI-powered consent-first engagement | Agentforce on SMS and WhatsApp without breaking consent |
| UC4 | Marketing Cloud Engagement to Next migration | Running two platforms without losing the audience |


---


## UC1 Omnichannel Lifecycle Campaign (Retail)

**Objective.** Design a consent-safe, three-channel lifecycle program for a retailer.

**Verified by.** A recommendation document covering channel sequence, consent gates, suppression, exits and measurement.

**The brief**

- Omnichannel retailer, 1.2M loyalty members, growing 2.5% monthly. Wants email, SMS and WhatsApp in one program.
- Journey Builder exists for email only. SMS consent sits in a spreadsheet. WhatsApp is not yet set up.
- Marketing Cloud Engagement, Professional core edition, so Marketing Cloud Next is not available.
- Constraint: the CRM is losing SMS opt-ins every week because two systems write the list.
- Success is defined as incremental revenue, not engagement metrics.

**Deliver**

1. Fix the consent data model first, and explain why nothing else can be trusted until it is fixed
2. Design the channel sequence and the per-channel consent gate
3. Design the suppression and frequency policy across all three channels
4. Say what you would NOT build, and why

> Attempt this before reading phase 17. The value is in the attempt, and
> the specific mistake you make is what tells you what to re-read.


---


## UC2 B2B Account-Based Marketing and Lead Nurture

**Objective.** Unify identity across Sales and Marketing and nurture without breaching consent.

**Verified by.** A design covering identity resolution, account selection, nurture orchestration and attribution.

**The brief**

- B2B software company, 40,000 contacts across Sales Cloud and Marketing Cloud, 600 target accounts.
- Leads captured by three systems. Marketing Cloud Connect is configured but scoped to one user.
- Sales asks for leads scored on buying intent; Marketing wants to nurture the whole buying group.
- Constraint: the buying group has 4-7 people and only one of them is ever in Marketing Cloud.
- Compliance: GDPR applies to EU contacts and the customer has no consent record for them.

**Deliver**

1. Design the identity resolution across Lead, Contact and account
2. Decide the account selection model and justify it
3. Design the nurture orchestration including the non-contact buying group members
4. Design the attribution approach for a 6-month sales cycle

> Attempt this before reading phase 17. The value is in the attempt, and
> the specific mistake you make is what tells you what to re-read.


---


## UC3 AI-Powered Consent-First Engagement

**Objective.** Deploy Agentforce on SMS and WhatsApp with consent as a hard gate.

**Verified by.** A design with the agent scope, consent enforcement, human escalation and an intelligence dashboard.

**The brief**

- Financial services, 300k customers. Wants an Agentforce agent handling inbound SMS and WhatsApp.
- Two high-volume intents: balance enquiries and card-replacement requests. Everything else must go to a human.
- Regulated sector. No PII may be retained in the conversation beyond the retention window.
- Marketing Cloud Personalization is already deployed against a weak Data 360 profile.

**Deliver**

1. Define the agent scope, the escalation path and the human handoff criteria
2. Design where consent is checked, and what the agent does when there is none
3. Explain how you would fix the Data 360 profile so Personalization becomes useful
4. Define the dashboard and the three metrics you would escalate on

> Attempt this before reading phase 17. The value is in the attempt, and
> the specific mistake you make is what tells you what to re-read.


---


## UC4 Marketing Cloud Engagement to Marketing Cloud Next Migration

**Objective.** Plan a coexistence migration that does not lose the audience or the audit trail.

**Verified by.** A phased migration plan with cutover, validation and rollback criteria.

**The brief**

- Subscription retailer, 8 years on Marketing Cloud Engagement, 45 journeys, 120 Data Extensions, core edition upgrading to Enterprise.
- Legal requires the full historical consent and send record to remain provable.
- Two Business Units today, with content built by an agency under a shared login.
- Constraint: the business case requires the WhatsApp channel, which the current edition does not include.

**Deliver**

1. Sequence the migration and state what stays in Engagement during coexistence
2. Design the consent and send-record portability that satisfies legal
3. Plan the agency access and content governance change
4. Define the cutover criteria, the validation and the rollback trigger

> Attempt this before reading phase 17. The value is in the attempt, and
> the specific mistake you make is what tells you what to re-read.
