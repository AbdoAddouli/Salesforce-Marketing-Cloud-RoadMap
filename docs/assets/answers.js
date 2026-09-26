/* Answers & Results - the answer key behind every exercise in the academy.
 *
 * Contract (enforced by scripts/validate-docs.js):
 *   - every key must be an exercise id that exists in curriculum.js
 *   - no key may exist without a matching exercise
 *   - every answer is rendered through app.js md(), so markdown + fenced code work
 *
 * Every answer is a MODEL answer, not the only defensible one. Where a question
 * has more than one good answer, the grading note says so.
 */
const EXERCISE_ANSWERS = {

  /* ------------------------------------------------------------------ phase 1 */
  'ex-01-1': `### Six rows, one decision each

| # | Scenario | Product | The single binding constraint |
|---|---|---|---|
| 1 | B2B software, Enterprise, 40k contacts, account-based nurture + 6 journeys, no AI | **MCE + Account Engagement** | Account-based marketing is a separate product in both worlds. It is not an edition of Marketing Cloud, and there is no AI requirement pulling them to MCN |
| 2 | Same firm 18 months later, Agentforce campaign creation + WhatsApp in two markets | **MCN Advanced** | Agentforce campaign creation and WhatsApp are MCN entitlements. Neither is available as an add-on to an MCE subscription |
| 3 | Retail chain on Professional, 1.2M loyalty members, email + SMS, 2.5M emails/month | **MCE** | MCN requires a core org on **Enterprise or Unlimited**. The org edition is the constraint, not the volume and not the budget |
| 4 | D2C apparel on Unlimited, wants no Marketing Cloud, only abandoned-cart and post-purchase on its own storefront | **None** | Both automations are CRM-native. Buying Marketing Cloud to run two flows adds a connector, a data model and a send system for no channel |
| 5 | Regulated bank on Enterprise, 300k customers, Agentforce on inbound SMS and WhatsApp, hard consent gate | **MCN Advanced**, plus the mobile messaging entitlement | Agentforce is an MCN capability, so this is MCN. In a regulated sector the real constraint is that inbound conversational channels need a DPA, a data-residency position and a consent gate that is enforced rather than documented |
| 6 | Media publisher pushing subscriber counts to an external warehouse every night | **None** | There is no marketing interaction in this requirement. A nightly count to a warehouse is an integration, not a Marketing Cloud product |

**Where you decline, say what you would propose instead:**

- Scenario 4: no Marketing Cloud. If onsite personalisation is wanted later,
  **Marketing Cloud Personalization** is a separate add-on to the org, not a
  Marketing Cloud edition. Price it as its own line.
- Scenario 6: **Data 360** with a Data Stream into the warehouse, or a plain CRM
  integration. If the counts are already in the CRM, the warehouse can read the
  CRM directly.

**Grading note.** The two rows that earn the mark are 3 and 4. Row 3 is the org
edition constraint - a volume-based answer is wrong. Row 4 is the declining
answer: "the customer asked and we said no" is a real consulting output, and it is
only wrong if you cannot name the alternative and its cost.
`,

  'ex-01-2': `### Ten questions, in the order you would ask them

| # | Question | Decision it unblocks | When |
|---|---|---|---|
| 1 | Which Salesforce core edition are you on, and is an upgrade already planned? | **Edition**: MCE vs MCN. MCN needs Enterprise or Unlimited | Day 1 |
| 2 | Is there already a Data 360 org, and is Identity Resolution configured? | **Data architecture**: whether MCN segmentation is feasible at all | Day 1 |
| 3 | What is the renewal date on anything you own today, including any Advertising Studio subscription? | **Timeline**: retirement deadlines force the sequence | Day 1 |
| 4 | Which channels are in scope in year one, and which are only in the business case? | **Channel set**: WhatsApp and mobile messaging are separate entitlements | Week 1 |
| 5 | What is the monthly and peak send volume per channel? | **Infrastructure**: dedicated IP vs shared, warm-up schedule, cost model | Week 1 |
| 6 | How many brands and how many legal entities need separation? | **Business Unit count** | Week 1 |
| 7 | Which system is authoritative for profile data, and which for consent? | **Data architecture**: system of record per domain, and the identity model | Week 1 |
| 8 | Is there an AI requirement, and who approves generated content? | **Edition**, and the human review gate | Week 2 |
| 9 | How are data subject requests handled today, and who owns the process? | **Compliance scope**: whether phase 10 is a build or a repair | Week 2 |
| 10 | What is the implementation deadline, and who signs off on go-live? | **Timeline**: the only real schedule constraint | Week 2 |

### The two that would most change the recommendation

**Question 1, the core org edition.** It is binary, it gates the largest possible
purchase, and it invalidates the platform team's stated plan on its own. No
amount of feature mapping survives a Professional org.

**Question 3, the renewal date on a retiring product.** It converts a preference
into a deadline. If Advertising Studio cannot renew after 15 August 2026, the
migration stops being a preference and becomes a dated obligation, which changes
the sequencing, the resourcing, and the conversation about taking the dependency
risk.

**Grading note.** Questions 1 to 3 in that order is the answer. The mark is for
"which decision does each question unblock", not for the wording of the question.
`,

  /* ------------------------------------------------------------------ phase 2 */
  'ex-02-1': `### The DE set

| DE | Purpose | Type | Primary key | Subscriber key | Send log | Retention |
|---|---|---|---|---|---|---|
| ContactMaster | Contact attributes, joined from two upstream systems | Standard | EmailAddress | EmailAddress | No | 3 years rolling |
| ContactPreference | Per-channel consent with evidence | Standard | SubscriberKey | EmailAddress | No | **Never purge** |
| DailyEngagement | Yesterday's engaged segment, rebuilt nightly | Standard | SubscriberKey | EmailAddress | No | 45 days |
| SendEligible | The derived audience the send reads | Standard | SubscriberKey | EmailAddress | No | 90 days |
| GlobalSuppression | Cross-channel suppression, written by unsubscribe and complaint | Standard | SubscriberKey | EmailAddress | No | **Never purge** |
| Import_Staging | Landing zone for both attribute feeds | Standard | RowId | **None** | No | 30 days |
| StoreSendLog | Per-send record for reporting | List Management | System | n/a | Yes | 3 months |

### Normalised, with one deliberate exception

The attribute set is **normalised**, because two systems both write contact
attributes and Marketing Cloud is not the system of record. A denormalised
attribute DE would create a second copy of the truth with no defined owner, and
the two copies would diverge silently - and nobody notices until a consent
decision is made on a stale value.

**SendEligible is the one denormalised DE in the design, and that is the point.**
It is a derived, rebuildable projection built by a SQL activity, so a failure
costs one night's rebuild rather than data integrity.

### Retention, justified

- **ContactPreference, never purge.** It is the legal evidence of what the
  customer agreed to. The 3-year provability requirement is satisfied by
  retaining the evidence, not by deleting it. Deleting it destroys the proof
  rather than complying with the requirement.
- **GlobalSuppression, never purge.** Same reason, plus one more: if a
  suppression record is purged, the next import rebuilds the profile and the
  person is messaged again after unsubscribing. It is a tombstone.
- **ContactMaster, 3 years rolling.** Matches the provability window. Beyond it
  the attributes are not useful and are harder to justify holding.
- **SendEligible, 90 days.** A rebuildable projection; a month of history is
  enough to investigate a bad send.
- **DailyEngagement, 45 days.** Enough for a month-on-month comparison.
- **StoreSendLog, 3 months.** The built-in data views already give you delivery
  data. Keeping a year here is storage cost with no analytical return.
- **Import_Staging, 30 days.** A debugging window and nothing more.

**Grading note.** Two marks: **ContactPreference and GlobalSuppression never
expiring**, and **no Subscriber key on staging**. A staging DE with a Subscriber
key creates a duplicate profile on every run, and it presents months later as a
merge-field problem.
`,

  'ex-02-2': `### The query

\`\`\`sql
SELECT
  CASE
    WHEN s.BounceCategory = 'Hard bounce'  THEN 'HARD'
    WHEN s.BounceCategory = 'Block bounce' THEN 'BLOCK'
    WHEN s.BounceCategory = 'Soft bounce'  THEN 'SOFT'
    ELSE 'OTHER'
  END                              AS BounceType,
  COUNT(*)                         AS Affected,
  COUNT(DISTINCT s.EmailAddress)   AS Contacts,
  COUNT(DISTINCT s.IPAddress)      AS IPs,
  MIN(s.BounceDescription)         AS SampleReason
FROM ent.<childsendlog> s
WHERE s.BounceCategory IS NOT NULL
  AND s.SentDate >= DATEADD(day, -7, GETDATE())
GROUP BY CASE
    WHEN s.BounceCategory = 'Hard bounce'  THEN 'HARD'
    WHEN s.BounceCategory = 'Block bounce' THEN 'BLOCK'
    WHEN s.BounceCategory = 'Soft bounce'  THEN 'SOFT'
    ELSE 'OTHER'
  END
ORDER BY Affected DESC
\`\`\`

### Isolating the IP responsible

Run the same aggregation **grouped by IP as well**, and read the two outputs
together:

\`\`\`sql
SELECT
  s.IPAddress,
  s.BounceCategory,
  COUNT(*)                       AS Affected,
  COUNT(DISTINCT s.EmailAddress) AS Contacts
FROM ent.<childsendlog> s
WHERE s.BounceCategory IN ('Hard bounce','Block bounce')
  AND s.SentDate >= DATEADD(day, -7, GETDATE())
GROUP BY s.IPAddress, s.BounceCategory
HAVING COUNT(*) > 100
ORDER BY Affected DESC
\`\`\`

The diagnosis is the **shape**, not the number:

| Shape | Diagnosis |
|---|---|
| Hard bounces on **one** IP, many distinct contacts | Sending infrastructure or that IP's reputation |
| Hard bounces across **all** IPs, **few** distinct contacts | List hygiene from a bad import |
| Block bounces from **one** mailbox provider, one IP | That provider's filter list |

### Activity type: Overwrite

**Overwrite**, into a diagnostic DE, with a date-stamped name or a RunDate field.

**Why overwrite rather than append:** appending means running this twice
accumulates the same bounces twice, so the second run reports double the impact
and the trend you are trying to read becomes fictional. Overwrite makes the
activity idempotent, which is the only property that matters for something you
will re-run every time a bounce spike appears.

**Safe to run twice** is the test: after a second run at 02:05, the diagnostic DE
must be identical to the first run's, or the numbers you quote in a client
meeting are wrong.

**Grading note.** The COUNT(DISTINCT IPAddress) column is what earns the
IP-isolation mark. Without it, a list-hygiene incident and an IP-reputation
incident look identical in the send log.
`,

  /* ------------------------------------------------------------------ phase 3 */
  'ex-03-1': `### Match rules, in evaluation order

| Order | Source | Key | Normalisation | Authority |
|---|---|---|---|---|
| **1** | Contact | Email | Trim, lowercase, plus-addressing stripped | **Authoritative** for email |
| **2** | Commerce buyer | EmailHash | SHA-256 of the normalised plain address | Match key **only** |
| **3** | Lead | WorkPhone | E.164, country code required | Not authoritative - the stale field here |
| **4** | Lead/Contact | MobilePhone | E.164 | Contact authoritative for mobile |
| **5** | Commerce | DeviceId | Exact | Last resort: devices change and are shared |

**Why this order:** email is the only identifier that is both reliably present
and reliably unique per human. Rule 2 is hashed commerce data, so it can only ever
match another hashed value - never a plain address. Phone numbers are shared in
households and go stale on Leads. Device IDs change.

### Reconciliation rules, field by field

| Field | Rule | Why |
|---|---|---|
| Email (display) | Contact wins, always | System of record. Recency would let a stale Lead email overwrite a verified Contact email |
| EmailHash | Contact's plain email, hashed at rest if the platform requires it; otherwise not stored at all | A hash is a match key. Storing it beside the plain address adds no capability and creates a second value to keep in sync |
| WorkPhone | Contact if non-empty, else the most recent non-empty Lead value | **Source priority beats recency here.** Recency alone resurrects the stale value, which is the actual bug in this scenario |
| MobilePhone | Contact if non-empty, else most recent non-empty | Same |
| FirstName | Most recently **verified** CRM value | An unverified commerce name is a shipping label, not an identity |
| Consent (per channel) | **Opt-out always wins. No recency rule** | A stale opt-in must never overwrite an opt-out the person just gave |
| Consent evidence | Union of all sources, keyed by channel and date; an erasure removes identifiers, never the event | The record of what was agreed has to survive the identifier |

### The unified profile afterwards

**Contains:** one canonical identity, one resolved value per field, consent state
per channel and per purpose, engagement history for fit and engagement scoring,
and the source of every value for audit.

**Deliberately does not contain:** raw order lines, the hash beside the plain
address, the stale Lead phone number, the commerce name, any field with no
downstream consumer, and anything without a retention policy.

**The principle:** a duplicated profile is worse than a missing one. A missing
one is invisible; a duplicate one gets messaged twice.

**Grading note.** Two marks: the hashed email is a **match-only** value that never
competes with a plain address in the same rule, and consent reconciliation is
**opt-out-wins, not recency-wins**.
`,

  'ex-03-2': `### The four drivers, in order of impact

**Consumption = flow evaluations x records x fields read.** Every real fix
reduces one of the three. That is how you tell a fix from one that just moves the
cost elsewhere.

| # | Design decision | The change | Why consumption falls rather than moving |
|---|---|---|---|
| 1 | **One record-triggered flow per campaign.** A 12-touch onboarding program runs 12 flows, so every contact is evaluated 12 times | **One flow per lifecycle program**, with 12 decision branches or waits. Campaigns become content plus a send, not a flow | Evaluations fall roughly 12x for the same contacts. The same work, counted once, instead of the same contacts evaluated 12 times |
| 2 | **Duplicate profiles.** Loose identity resolution means 8% of contacts are processed twice: twice the evaluations, twice the sends, twice the cost | Tighten match rules, then re-run identity resolution and measure the match rate | Records fall. No other lever reduces records, and it is also the "why is this person messaged twice" fix |
| 3 | **Content reads the whole profile.** Each message pulls 22 DMO fields to use 5 | Read only the fields the message uses; cache static values in the content | Fields read fall 2x or more across every send. The cheapest change in the list and reversible the same day |
| 4 | **Full refresh of everything nightly**, including records that have not changed | Delta where the source supports it, and schedule the full refresh in the cheap consumption window | Records consumed per day fall. Only worth doing after 1 to 3, because it is the change easiest to do badly |

**What I would not change:** anything that increases CRM write-back frequency.
Consumption includes record-triggered evaluations, and a per-contact write-back
flow is the most expensive pattern available. Write back in one scheduled batch.

### The metric to watch for 30 days

**Consumption credits per day, and evaluations per contact per day**, side by
side with total contacts sent.

The proof is the **ratio**, not the total. If contacts sent is flat and
consumption per contact sent falls toward the expected multiple, the fix worked.
If total consumption stays flat while contacts sent drops, the fix moved the cost
rather than removing it.

Read it at 30 days because a shortened refresh cadence takes a full billing cycle
to appear, and an identity clean-up needs one full ingest to settle.
`,

  /* ------------------------------------------------------------------ phase 4 */
  'ex-04-1': `### The records

Subdomain: mail.marketing.customer.com - dedicated to marketing, never the
corporate domain.

| Record | Name | Type | Value |
|---|---|---|---|
| SPF | @ | TXT | v=spf1 include:_spf.salesforce.com include:spf.mta.customer.com ~all |
| DKIM | selector1._domainkey | CNAME | dkim1.customer.com |
| DKIM | selector2._domainkey | CNAME | dkim2.customer.com |
| DMARC | _dmarc | TXT | v=DMARC1; p=none; rua=mailto:dmarc@customer.com; pct=100 |

### What each one does, in language for a domain administrator

- **SPF** - "here is the list of mail servers allowed to send as this domain." A
  receiver checks the sending IP against it and discounts the message if the IP
  is not on the list.
- **DKIM** - "here is the public key that verifies a signature on my outgoing
  headers." A receiver uses it to prove the message was not altered in transit.
- **DMARC** - "here is what to do when SPF and DKIM both fail, and here is where
  to send a report so I can find the sender I forgot about."

### The policy progression

| Stage | Policy | When |
|---|---|---|
| Start | p=none | Day one. Monitor only, collect reports |
| Middle | p=quarantine | Once the aggregate reports show all legitimate senders aligned |
| End | p=reject | After a clean reporting period and with a second DKIM selector in place |

**The signal that makes it safe to move:** the DMARC aggregate reports show **no
unidentified senders** for a full reporting period. Not "few" - none. Every
unidentified sender is either a system you have not authenticated yet or someone
spoofing your domain, and you cannot tell which until the count is zero.

**Two details that earn the mark:** a **second DKIM selector**, so the key can be
rotated without invalidating messages already in flight; and **~all (softfail)**
rather than -all on day one, because there is always a legitimate sender you did
not know about.
`,

  'ex-04-2': `### Four diagnoses

| # | Symptom | Failure mode | Evidence in the send log | First fix | Guard rail |
|---|---|---|---|---|---|
| 1 | Hard bounces 0.4% to 7%, **one IP only**, immediately after a list import | **List hygiene** | Hard bounces on one IP but **few distinct contacts**; the same address failing repeatedly across dates, which is one address in many rows | Fix the import source, re-permission the affected addresses, exclude them from the send DE | A duplicate-address check **before** import, plus a validation that rejects a file where one address exceeds N rows |
| 2 | Deliverability collapsed **across all IPs** after a DNS change | **Authentication** | A step change on one date across every IP, bounce categories unchanged, no audience change | Fix SPF/DKIM/DMARC alignment before touching anything else | Change control on DNS: no send within 24h of a DNS change, and DMARC reports reviewed after each one |
| 3 | Complaints 0.05% to 0.4% on a segment that **bought in the last 30 days** | **Content and targeting** | Complaint rate elevated on one audience definition while delivery and bounce rates are normal. The offers are the same; the audience is not | Stop targeting converters on that journey. Fix the audience predicate | A converter exclusion **in the entry rule**, not a manual audience swap, plus a complaint alert at 0.1% per journey |
| 4 | One mailbox provider blocking at **9%**, the other two flat | **Sender reputation** | Blocks concentrated in one destination provider across all of your IPs, which rules out your infrastructure and points at their filter list | Reduce volume to that destination, clean the list, request a filter review | Per-provider block rate in the deliverability report, so a 9% on one provider reads as a provider problem rather than an overall one |

### The reasoning that earns the mark

Scenarios 1 and 4 look identical at the headline level - hard bounces went up -
and the discriminator is the **shape**: one IP with many distinct contacts is
infrastructure, one IP with few distinct contacts is the list. The
COUNT(DISTINCT EmailAddress) next to COUNT(*) is what separates them.

Scenario 2 is the only one where the cause is visible in the **timing**, and it is
the one people get wrong by reaching for the list.

**What is not the fix in any of them:** a subject-line A/B test, an increase in
send volume, or a re-permission campaign.
`,

  /* ------------------------------------------------------------------ phase 5 */
  'ex-05-1': `\`\`\`ampscript
%%[ SET @greeting = "Hi there," ]%%
%%[ IF NOT EMPTY(@FirstName) THEN
      SET @greeting = CONCAT("Hi ", @FirstName, ",")
   END IF ]%%

%%[ SET @storeLine = "" ]%%
%%[ IF NOT EMPTY(@PreferredStore) THEN
      SET @storeLine = CONCAT("New arrivals in your ", @PreferredStore, " store.")
   END IF ]%%

<p>%%=v(@greeting)%%</p>
<p>%%=v(@storeLine)%%</p>
<a href="%%=v(@UnsubscribeUrl)%%">Unsubscribe</a>
\`\`\`

### What the recipient sees when the fallback fires

**"Hi there," and no second line at all** - not an empty paragraph, not a
stranded "in your  store."

That is why @storeLine is initialised to an empty string rather than
concatenating unconditionally: the fallback is a complete, grammatical result, not
a partially rendered sentence.

### Why not a merge field for the greeting

1. **No fallback.** A merge field with an empty attribute renders as a blank gap
   in some send contexts, and as the literal tag in others. It cannot degrade
   gracefully.
2. **No set operation.** A merge field cannot build a sentence, so every variation
   needs its own field and its own send path.
3. **It fails silently and permanently.** A broken merge field does not error at
   send time in a way anyone notices. It ships, it lands in inboxes, and the first
   person to see it is the customer.

**The wider rule:** the %%=v(@var)%% pattern guarantees a value. An unset AMPscript
variable renders as empty; an unresolved merge field can render as its own tag
text.
`,

  'ex-05-2': `### The Handlebars version

\`\`\`handlebars
<p>{{#if firstName}}Hi {{firstName}},{{else}}Hi there,{{/if}}</p>
{{#if preferredStore}}<p>New arrivals in your {{preferredStore}} store.</p>{{/if}}
<a href="{{unsubscribeUrl}}">Unsubscribe</a>
\`\`\`

### The three things that would break if you pasted the AMPscript in

| # | What breaks | Why | What replaces it |
|---|---|---|---|
| 1 | The percent directive syntax | Those are **MCE percent directives**. They are not the MCN content template syntax at all, so the block never executes and the tag text can reach the customer | Handlebars expressions and block helpers: {{#if}}, {{/if}}, {{else}}, {{{raw}}} for unescaped output |
| 2 | SET and IF blocks | Neither exists in Handlebars. There is no imperative statement and no explicit terminator | Block helpers - {{#if x}} ... {{else}} ... {{/if}} - and inline helpers for concatenation. The block closes itself |
| 3 | Data Extension row bindings | In MCE the bindings come from the DE row on the send. In MCN they come from the **Data 360 unified profile** as DMO field names, so the attribute name is a DMO, not a DE column | Data 360 DMO field names. A contact with no profile row is not a send error - the field is simply empty and the fallback fires |

### Where the fallback data comes from

From the **Data 360 unified profile**, resolved by the match and reconciliation
rules from phase 3. That is why the profile work comes before the content work: if
identity resolution has not run, the fallback fires for everyone and the
personalisation is decoration.

### A contact with no profile row at all

The bindings evaluate as **empty**, the {{else}} branch fires, and the contact
receives "Hi there," and no store line. No error, no skipped contact, no send
failure.

**This is the behaviour worth being able to state:** in MCN a missing profile is a
degraded render, not a broken send. In MCE the same condition is a send log full
of bounces and a deliverability problem.
`,

  /* ------------------------------------------------------------------ phase 6 */
  'ex-06-1': `### Six rows

| # | Scenario | Mechanism | Why | Nearest wrong answer, and the misleading sentence |
|---|---|---|---|---|
| 1 | Welcome series, 5 emails over 14 days, stop on order | **Journey** | Per-contact lifecycle with waits, branching and a conversion exit. 14 days is 14 days of journey waits, not 14 scheduling slots | *Automation.* "We'll schedule five sends a day apart." Scheduling is not personalisation - it cannot stop mid-series when the customer buys |
| 2 | Nightly 02:00, score 2M records, email the top 10% | **Automation**, with a triggered send | Batch data movement and batch send. Nothing here is per-contact behaviour | *Journey.* "A journey is smarter." A journey over 2M records evaluates 2M contacts to select 200k, and bills for all of them |
| 3 | Cart abandoned, 4 hours later an SMS **only if still abandoned** | **Journey**, 4-hour wait, decision, conversion exit | The condition is evaluated per contact at +4 hours. That is a per-contact decision, not a schedule | *Triggered send.* "Fire the SMS from the automation." A triggered send has no per-contact condition, so it messages everyone who entered, converted or not |
| 4 | Monthly newsletter, 800k, built once, sent once | **Triggered send** | No lifecycle, no branching, no re-entry, one moment in time. At 800k it needs a dedicated sending stream | *Journey.* "Use a journey for consistency." It adds re-entry rules, decisions and waits to a process that has none, and the audience is rebuilt monthly anyway |
| 5 | Lead form submit, score, route to rep, drop into nurture | **Flow** (record-triggered in MCN); **journey + assignment rule** in MCE | Real-time per-record trigger with a per-record decision, then a handoff to a human | *Automation.* "We'll score them nightly." The lead is cold within the hour. A nightly batch scores a dead lead |
| 6 | 12-month reactivation, suppress anyone who bought in the last 90 days | **Journey** with a 90-day re-entry cooldown and a converter suppression | The 90-day rule is a re-entry condition evaluated at entry, which is native to a journey | *Automation.* "Filter the list before the send." Filtering at send time is a report, not a control - the contact is still activated, still counted, and in a paid channel still exported |

### The test that produces every row

- Behaves differently **per contact** -> journey or record-triggered flow
- Moves **data** on a schedule -> automation or scheduled flow
- One send, one moment, no per-contact logic -> triggered send
`,

  'ex-06-2': `### Entry

| Element | Design | Why |
|---|---|---|
| Entry source | The abandoned-cart audience, refreshed on the cart event, keyed on basket ID | The entry source is the basket, not a static list. A contact with two abandoned baskets in a week needs the de-duplication below |
| Entry rule | Basket value above threshold, cart not converted, no open basket in the last 7 days | Evaluated at entry, so a converted contact never activates |
| De-duplication | One active entry per contact **across all three value tiers** | Without it, a contact can be in tier 1 and tier 2 simultaneously: two messages about the same basket |
| Consent gate | Marketing consent current for the channel, applied **in the entry rule** | Gated at activation, not at send |
| Re-entry | Allowed after exit, with a **90-day cooldown** | One abandoned basket a year is a programme. Five is a complaint |

### Conversion exit

| Property | Design |
|---|---|
| Which event | Order placed or payment-confirmed. **Not** "cart no longer present" - that is a symptom, and it fires late |
| How fast | Evaluated at **every** step boundary. A contact who converts at +3 hours exits before the +4h SMS, not at day 30 |
| Remaining paths | Contacts mid-wait when they convert are removed from **all** remaining steps immediately, across all tiers |
| Exit reason | Recorded as Converted, so an exit is distinguishable from a suppression or a timeout |
| Second exit | Window expiry at 30 days, reason WindowExpired |

The conversion exit is the highest-value line in this design. Without it, the
journey markets a product the customer bought four hours ago, at the moment they
are most likely to be annoyed.

### Cross-channel suppression

The same basket must not be chased on email and SMS at the same time.

| Rule | Implementation |
|---|---|
| Cross-channel frequency cap | N contacts in M days across **all** channels, evaluated at entry against the interaction log |
| Channel lock | If email was sent for this basket, SMS is suppressed for the basket event. **One intent, one owner channel** |
| Conversion suppression | A converted contact is excluded from every channel, immediately, not at the next send |
| Global suppression | Unsubscribes and complaints suppress across every channel permanently |
| Suppression at entry, not at send | The contact is never activated in the first place, so the cap is measurable and paid channels never see them |

**The implementation note that earns the mark:** the cap and the suppression are
evaluated **at entry**, which means they are testable. In this repo that logic is
JourneyEntryEventService, and every allow or block decision is written to
Journey_Entry_Log__c with its reason - so "why was this person messaged twice" has
a queryable answer instead of a shrug.
`,


  /* ------------------------------------------------------------------ phase 7 */
  'ex-07-1': `\`\`\`sql
SELECT
  EmailAddress,
  MAX(CASE WHEN Score >= 80 THEN 1 ELSE 0 END) AS Segment_A,
  MAX(CASE WHEN Score >= 50 AND Score <  80 THEN 1 ELSE 0 END) AS Segment_B,
  MAX(CASE WHEN Score <  50 THEN 1 ELSE 0 END) AS Segment_C
FROM ScoredContacts
WHERE EmailAddress IS NOT NULL
GROUP BY EmailAddress
\`\`\`

The GROUP BY EmailAddress is what guarantees **one row per contact**. The MAX()
case expressions mean a contact who somehow appears three times in the source
resolves to exactly one segment rather than three rows - so a duplicated input
cannot produce a duplicated send population.

### Activity type: Overwrite

**Overwrite**, from an automation, preceded by an import into a staging DE.

**Justified against a re-run at 02:05:** the scoring DE is a derived artifact.
Every run rebuilds it completely from source, so running it at 02:00 and again at
02:05 produces an identical DE.

- **Append** would produce a DE with twice the rows, so the retried send goes to
  double the population.
- **Update** only touches rows that already exist, so a contact who enters the
  score threshold for the first time at 02:05 is invisible to the send.

### The two failure modes this eliminates

**1. Duplicate rows (the append failure).** The send activity fails, the automation
retries, and an append target re-appends the same rows. The retried send goes to
double the population, contacts are messaged twice, and the complaint rate moves
before anyone has diagnosed why.

**2. Stale rows (the update or no-overwrite failure).** A contact who drops out of
the segment stays in the DE, because nothing removed them. The next run sends to
contacts who no longer qualify - the classic "why are we still emailing people who
unsubscribed from that programme". Overwrite removes them by construction,
because the row does not exist in the new result set.
`,

  'ex-07-2': `### The activity list

| # | Activity | Configuration | What stops a bad run here |
|---|---|---|---|
| 1 | **File transfer** | Pull the CSV from SFTP, file name includes the run date | A missing or misnamed file fails here, before anything is loaded |
| 2 | **Import** | Into Import_Staging, **never** the live DE | The live DE is untouched by a partial import |
| 3 | **SQL validation** | Row count, distinct contact count, bad-address count, and a **comparison against the 7-day median** | The threshold below |
| 4 | **SQL error routing** | Rows failing validation into Import_Errors | Bad rows are dead-lettered, not dropped and not promoted |
| 5 | **SQL scoring** | **Overwrite** into the send DE | Idempotent, so a retry is safe |
| 6 | **Send** | Triggered send to 300k, on a dedicated sending stream, **conditional on step 3 passing** | A 300k send never runs against a partial file |
| 7 | **Data extract** | Row counts, validation results and the error DE | Tomorrow's run has yesterday's evidence |

### The validation threshold, for a file 40% smaller than yesterday

\`\`\`sql
SELECT
  COUNT(*) AS RowCount,
  COUNT(DISTINCT EmailAddress) AS DistinctContacts,
  SUM(CASE WHEN EmailAddress = '' OR EmailAddress NOT LIKE '%_@_%._%'
           THEN 1 ELSE 0 END) AS BadAddresses
FROM Import_Staging
\`\`\`

**Abort if the row count is outside 75-125% of the 7-day median, or if bad
addresses exceed 2%.** A 40% drop is far outside that band, so the run stops at
step 3 and no send happens.

The band is a **median, not yesterday**. A single-day comparison fails on a
legitimately quiet day, and it is exactly the check that would let a 60% partial
file through on a Monday.

### What happens on failure

| Stage | Behaviour |
|---|---|
| File transfer | **Retry 3 times, 15 minutes apart**, for transient failures only. A 404 is not transient, so it fails immediately |
| Import or SQL | No retry. The run stops and alerts - a re-run is safe only because the target is Overwrite |
| Send | No automatic retry. It is gated on validation, and a re-send is a human decision |
| Error rows | Dead-lettered into Import_Errors with the reason. Never deleted, never promoted |
| The send DE | **Must never** be left partially written. Overwrite guarantees it: either the new content is fully there, or the previous valid content is untouched |

### The two monitoring assets

| Asset | What it catches | Who receives it |
|---|---|---|
| **Automation status report** - every automation, last run, last status, duration, plus failures in the last 7 days | A failed run nobody looked at, and a run silently exceeding its window | A **distribution list**, never an individual. One person is on holiday and the failure is then silent for a week |
| **Send DE row-count history** - row count per run, plotted | A partial load that passed validation, and a sudden audience collapse | The same distribution list, plus the marketing operations owner |

**The row-count history is the one people skip and it is the one that catches the
failure validation missed.** A send DE that goes from 300k to 180k with no change
in source data is a defect, and this is the report that shows it before the
customers do.
`,

  /* ------------------------------------------------------------------ phase 8 */
  'ex-08-1': `### The comparison

| | **Email** | **SMS (10DLC)** | **WhatsApp** | **Mobile push** |
|---|---|---|---|---|
| **Before first send** | Domain authentication: SPF, DKIM, DMARC. Hours to days | **Brand and campaign registration with the carrier aggregator: 8-12 weeks.** Opt-in evidence retained | **Business verification plus message template pre-approval.** Transactional and utility templates are often pre-approved; **marketing templates are not** | Mobile SDK integrated in the app, and the OS permission the app requests |
| **Lead time** | 1-2 days | **8-12 weeks** | Days per template, plus business verification | Weeks, and it needs an app release cycle |
| **Consent model** | Marketing opt-in. Transactional exempt | **Opt-in with evidence** - web form or keyword, with timestamp and source. Proof is required for registration | Opt-in **per channel**, stored on the profile. Not inherited from the email opt-in | An **app-level OS permission**, not a marketing opt-in. Marketing push still needs a frequency policy |
| **Cost shape** | Per message | Per message, per segment. Cheap at volume | **Conversation-based.** Template messages cost more than session messages | Effectively free per message |
| **Quiet hours** | Jurisdiction-dependent | **Yes, per contact time zone, enforced by the messaging window** | Yes, and outside a 24-hour window everything must be a template | App-level, generally unrestricted, but rate-limited by the OS |
| **The one job** | Everything asynchronous and rich | Time-critical, two-way, transactional | Service and opt-in driven conversations | A timely in-app prompt to an identified device |

### The channel I would not use for a promotional message

**SMS.** Three reasons, and the third is the one that costs money:

1. **Legal exposure.** 10DLC requires explicit opt-in for marketing. "We have your
   number" is not opt-in, and the first complaint is an enforcement event.
2. **The window is narrow.** Quiet hours are per contact time zone, so a
   promotional SMS can only be sent inside a window that excludes most of your
   addressable audience at any given moment.
3. **Cost and fatigue at promotional volume.** SMS is the most expensive channel
   per contact and the most annoying per contact. Promotional SMS on a service
   channel teaches people to ignore the number you need for delivery
   notifications.

**The one exception:** a genuinely transactional message, or a promotional message
from a brand the customer explicitly opted into for that purpose. Both are narrow.
`,

  'ex-08-2': `### The predicate

\`\`\`sql
SELECT
  s.EmailAddress,
  s.MobileNumber,
  c.TimeZone_Offset,
  CASE
    WHEN (HOUR - c.TimeZone_Offset + 24) % 24 BETWEEN 8 AND 20
      THEN 'SEND_NOW'
    ELSE 'DEFER'
  END AS Send_Window,
  DATEADD(hour,
    CASE WHEN (HOUR - c.TimeZone_Offset + 24) % 24 >= 8
         THEN (HOUR - c.TimeZone_Offset + 24) % 24 - 8
         ELSE (HOUR - c.TimeZone_Offset + 24) % 24 + 16
    END, GETDATE()) AS Earliest_Send_Local
FROM SMS_Candidates s
JOIN Contact_TimeZone__c c
  ON c.EmailAddress = s.EmailAddress
LEFT JOIN GlobalSuppression__c g
  ON g.EmailAddress = s.EmailAddress
 AND g.SuppressionType__c = 'SMS'
WHERE s.SMS_Consent__c = 1
  AND s.IsOptedOut__c = 0
  AND s.MobileNumber LIKE '+%'
  AND g.EmailAddress IS NULL
  AND (s.Deferred_Send_Date IS NULL OR s.Deferred_Send_Date <= GETDATE())
\`\`\`

### The activity that acts on the deferred set

A **SQL activity writing Deferred_Send_Date**, overwriting the deferred DE, run
immediately before the send. The deferred DE is a first-class audience, not a
leftover.

- SEND_NOW rows go to the send DE for this run.
- DEFER rows go to the deferred DE with Deferred_Send_Date set to the local 08:00
  the next run will pick up.

### Why this design does not re-send to a contact who unsubscribed while deferred

**Because the consent and opt-out predicates are re-evaluated on every run, and
the deferred row carries no permission of its own.**

The deferred row is a scheduling instruction, not a permission. The next run
re-runs SMS_Consent__c = 1 and IsOptedOut__c = 0 before selecting anything, so a
contact who unsubscribed during the deferral window never matches the SEND_NOW
branch. The row stays in the deferred DE, unmatched, and is cleaned up by a
scheduled retention step.

**The failure mode this avoids:** materialising the permission at deferral time. A
queue built from a snapshot of consent taken at 02:00 will happily send at 09:00
to someone who stopped at 06:00. That is a consent breach, and it is invisible
because the queue looks like it is working.

**The two rules that follow:**

1. **Defer, never drop.** A contact outside their window is not unsubscribable,
   they are out of hours. Dropping them loses the contact permanently.
2. **A deferred row is re-validated against the current state, always.** Consent
   that was valid when you deferred is not evidence that it is valid now.
`,

  /* ------------------------------------------------------------------ phase 9 */
  'ex-09-1': `### Capability map

| Advertising Studio capability | Data 360 equivalent | Fidelity | Gap | Mitigation |
|---|---|---|---|---|
| **Audience building** | Data 360 segments | **Exact** | None material | Rebuild the definitions as segments; the logic ports directly |
| **Exclusions** | Segment criteria plus Data 360 Ad Audiences exclusion lists | **Exact** | None | Include the exclusions **inside** the segment definition, not as a separate list a refresh can forget |
| **Suppression** | Consent state on the unified profile, applied at segmentation | **Approximate** | AS had a single global list. Data 360 requires suppression to be expressed as **per-channel advertising consent**, which is a model change, not a setting | Build the per-channel consent fields **before** cutover. This is the longest-lead item in the migration |
| **Frequency capping** | Cross-channel frequency logic over the interaction log | **Approximate** | AS capped per audience. Data 360 caps per contact across channels, which is a better number and is **not automatic** | Implement the cap explicitly against Marketing_Interaction__c, and cap manually during the first cycle |
| **Destination sync to Meta** | Data 360 Ad Audiences | **Approximate** | Expect re-authentication and new audience identifiers in the Meta Ads Manager | Reconnect through the Data 360 integration. Re-learn audiences by name with a documented mapping - do not rely on the AS IDs surviving |
| **Destination sync to Google (Customer Match)** | Data 360 Ad Audiences plus the Google Ads integration | **No exact equivalent** | The 2023 Customer Match configuration is **tied to the AS connection, not to your audience data**. It breaks at cutover even if the audiences are byte-identical | **Rebuild the Customer Match list from scratch in Google Ads** and verify eligibility before the AS subscription ends |
| **Exclusion lists at the destination** | Data 360 Ad Audiences exclusions | **Approximate** | Destination-side exclusion lists are additive and go stale | Push exclusions from the profile on every refresh and audit the destination lists monthly |

### The one sentence to forward to their agency

> "Advertising Studio cannot renew after 15 August 2026, so the Google Customer
> Match list has to be rebuilt directly in Google Ads and verified as eligible
> before that date - the audience data survives, but the 2023 sync does not, and if
> it breaks on the day the subscription ends you lose Google match volume until it
> is restored."

### Sequencing note

The Google line is the deadline that matters, and it is not the one people
expect. The audience migration is a data project with weeks of runway. The
Customer Match rebuild depends on **an external platform's eligibility review**,
which has its own queue and which nobody in the marketing team owns. Start that
one first.
`,

  'ex-09-2': `### The three predicates

\`\`\`sql
-- 1. CONSENT: advertising use is its own permission, separate from the email opt-out
AND profile.Advertising_Consent__c = 'OptedIn'
AND profile.Advertising_OptOut__c = 0

-- 2. CONVERTERS: do not advertise to people who already bought the thing
AND NOT EXISTS (
  SELECT 1 FROM Conversions__c cv
  WHERE cv.EmailAddress = profile.EmailAddress
    AND cv.ProductFamily__c = 'Advertised'
    AND cv.ConvertedDate >= DATEADD(day, -90, GETDATE())
)

-- 3. FREQUENCY: a rolling window across all channels, not a calendar month
AND (SELECT COUNT(*) FROM Marketing_Interaction__c mi
     WHERE mi.EmailAddress = profile.EmailAddress
       AND mi.Marketing__c = 1
       AND mi.InteractionDate >= DATEADD(day, -30, GETDATE())) < 4
\`\`\`

### Which one goes first, and why

**Consent goes first, always.** The other two are optimisation predicates. Consent
is a legal gate, and the moment an unconsented contact enters a paid audience the
data has been transferred to a third party. Filtering converters afterwards does
not undo that transfer - it just means fewer people are annoyed by it.

Order: **consent, then converters, then frequency.** Each one removes people from
a set that has already been made as correct as it can be.

### Where each is evaluated

| Predicate | Data 360 | Destination platform | Both |
|---|---|---|---|
| Consent | **Yes** - the segment excludes them, so they never leave | No, and it must not be relied on there. A destination-side list is a manual, stale copy | No |
| Converters | **Yes** - a segment criterion, refreshed on the audience cadence | Optionally as a destination exclusion list, as a second layer | Data 360 is authoritative |
| Frequency | No - the count spans channels and no single platform can see them all | Only within that one platform, which is not the number you want | **Data 360 only, over the interaction log** |

**The rule:** consent and converters belong in the segment; frequency belongs only
in the profile, because a per-platform count is not a cross-channel count.

### If the match permission is missing

**You cannot use the hashed identifier. The answer is a platform-native identifier,
not the hashed email.**

1. **Check whether platform-native audiences are possible.** If you can match on
   customer ID, login or app install, build the audience natively. No hashed PII
   leaves the platform, the match rate is better, and the cost is lower. This is
   the recommended outcome, not the fallback.
2. **If hashed upload is genuinely the only route**, obtain the lawful basis
   explicitly and record it. The permission to advertise is separate from the
   permission to email. Without it, do not upload, however good the match rate
   would be.
3. **If neither is available, do not build the audience.** Say so, and offer the
   alternative: a first-party segment activation, or a measure-and-serve approach
   on the platform with no PII transferred.

**What must never happen:** uploading because the technical path exists. The match
permission is a legal question, and "we could" is not "we may".
`,

  /* ----------------------------------------------------------------- phase 10 */
  'ex-10-1': `### The record

| Field | Type | Why it is separate |
|---|---|---|
| Contact__c | Lookup(Contact) | The human. Consent belongs to a person, not to a form submission or a source |
| Channel__c | Picklist: Email, SMS, WhatsApp, Push, Advertising | A person can consent to email and refuse WhatsApp. One boolean cannot represent that, and collapsing it is the most common retail consent defect |
| Purpose__c | Picklist: Marketing, Transactional, Analytics, Advertising | Advertising consent is **not** email consent. Sharing a record means a marketing opt-in silently activates advertising |
| Status__c | Picklist: the five states below | Status is a state machine, not a boolean. Pending and Expired cannot be expressed by a boolean |
| CapturedDate__c | DateTime | Proving consent requires **when**, not just **that** |
| Source__c | Picklist: WebBanner, App, CallCentre, Import, Keyword | A call-centre verbal opt-in is weaker evidence than a web form with a URL. The source sets the weight |
| Evidence__c | Long Text Area | URL, keyword, call reference, IP. The artefact, not the claim |
| ExpiresOn__c | Date | Consent has a shelf life. Without it a 2019 opt-in looks identical to last week's |
| RecordedBy__c | Text | The call-centre spreadsheet case: who wrote this row, and in which system |

### The five states, and what each permits

| State | What a campaign may do |
|---|---|
| **OptedIn** | Send on this channel for this purpose. Full activation |
| **OptedOut** | Send nothing promotional on this channel. Terminal until a fresh, evidenced opt-in. **Overrides recency, always** |
| **Pending** | Send nothing. A double opt-in email is pending until the link is clicked. Treating Pending as sendable is the defect |
| **Transferred** | Send nothing through this system. Consent was captured by a processor or a subsidiary, so this system holds a reference, not a permission. Requires a data-sharing agreement to act on |
| **Expired** | Send nothing. The consent aged out. Requires re-permission, not a re-sync from the old field |

### Which system is authoritative, and what happens on conflict

| Channel | Authoritative | Reason |
|---|---|---|
| Email | CRM, where the form writes | The web form is the consent capture point, and the CRM holds the complete record |
| SMS | The system that captured the keyword | A keyword opt-out is a real-time instruction from the person. Nothing may overwrite it |
| WhatsApp | **The WhatsApp platform record** | A STOP is recorded where the message was received. A CRM field that has not received it is stale by definition |
| Push | The app | The OS permission is the record |
| Advertising | The CRM consent record, gated by lawful basis | Advertising has no channel platform record, so the profile is the only place it can live |

**On conflict:**

1. **Opt-out always wins, at the channel that recorded it.** Not recency, not
   source priority. If any source for that channel says OptedOut, the result is
   OptedOut.
2. A CRM OptedIn cannot override a WhatsApp OptedOut, and cannot override a CRM
   OptedOut either. Resolution has to be per channel, or the channels overwrite
   each other.
3. **Anything that is neither a clean opt-in nor a clean opt-out is Pending**, and
   Pending is not sendable. Two sources disagreeing is a data-quality incident to
   fix, not a licence to pick the more convenient one.
4. The opt-out must be **pushed back** to the systems holding a stale value, or
   it will be re-imported on the next sync and the whole argument repeats next
   week.

### The call-centre spreadsheet

That spreadsheet is the finding. Consent captured verbally by a person who then
types it into a spreadsheet has no evidence artefact, no independently verifiable
timestamp, and no link between the record and the contact.

**Fix it as a system, not a process:** capture the call in the CRM consent object
with the call reference as the evidence, and retire the spreadsheet. Until then
every call-centre opt-in is a record you cannot prove, and in a GDPR audit the
burden is on you to prove it.
`,

  'ex-10-2': `### Suppress, delete, retain

| Action | Item | Legal, contractual or audit reason |
|---|---|---|
| **SUPPRESS** | Email, SMS, WhatsApp number, device token | Art. 17(3)(b)/(c) GDPR - suppression is necessary to honour the erasure. Marketing consent, Art. 21 absolute objection. **This is the tombstone and it must survive the erasure** |
| **SUPPRESS** | All in-flight journey and flow state | Art. 17 - the purpose is gone. A contact still in a welcome series is still being processed |
| **SUPPRESS** | Advertising audiences and destination platform lists | Art. 17 extends to recipients, not just the source. The transfer must be undone downstream |
| **SUPPRESS** | Web tracking and cookie identifiers | Consent withdrawal, Art. 7(3) |
| **DELETE** | Email, phone, name, address in the profile | Art. 17(1) - the identifying data has no lawful basis after erasure |
| **DELETE** | Identifying columns in the Data Extensions | Art. 17(1). The row stays if an aggregate needs it; the identifiers go |
| **DELETE** | Source records in Data 360, **then re-run identity resolution** | Art. 17(1). Re-running resolution is the step people forget - without it the profile rebuilds on the next ingest |
| **DELETE** | Conversation transcripts containing PII beyond the retention window | The regulatory retention window has expired. Keeping them has no basis |
| **RETAIN** | **Marketing consent history, 3 years, anonymised** | **The stated legal requirement in the case.** Art. 7(1) - you must be able to demonstrate consent. The record is the proof; deleting it destroys the defence |
| **RETAIN** | Consent audit trail: who captured, when, from where | Art. 7(1) accountability. Same 3 years, same reason, and it is why consent history is retained **anonymised** rather than deleted |
| **RETAIN** | Transactional history | Art. 17(3)(b) - needed to perform the contract. Also the tax and accounting record |
| **RETAIN** | **The open complaint case** | Art. 17(3)(e) - needed for the establishment, exercise or defence of legal claims. A live dispute is a legal claim in progress |
| **RETAIN** | Send log, anonymised | The send happened and cannot be un-sent. Anonymising the address satisfies Art. 17(1) without falsifying the record |
| **RETAIN** | Suppression tombstone, anonymised, permanently | Art. 17(3)(b)/(c) - required to honour the erasure. Deleting it is what causes the breach |

### The retention rule that is not negotiable

**Consent evidence is retained; the identifier is deleted.** These are two
different things, and conflating them is how people get this wrong in both
directions.

- Deleting the consent record destroys the proof you had consent - and you are the
  one who has to demonstrate it.
- Keeping the email address on the consent record leaves the personal data in
  place after erasure.

**Anonymised consent history answers both:** the contact reference is replaced
with a salted hash, the dates, channel, purpose, source and evidence type are
kept, and the 3-year clock still runs. The record is still provable against the
pseudonym, and the person is still erased.

### The customer-facing confirmation

> "Your erasure request has been completed. We have deleted your personal data
> from our marketing systems, removed you from all marketing and advertising
> audiences including our advertising partners, cancelled any pending marketing
> communications, and retained a record of your consent history together with your
> transactional and complaint records, which we are required to keep for legal
> reasons. Your suppression from all marketing is permanent."

**What it must not claim:**

| Must not say | Why |
|---|---|
| "All your data has been deleted" | It has not, and three categories are legally retained. This is the most common false statement in an erasure confirmation |
| "You have been removed from our systems" | They have been removed from **marketing**. Saying "our systems" invites the discovery that contradicts it |
| "We have deleted your marketing consent" | That destroys the 3-year evidence you are required to hold |
| "You will receive no further messages of any kind" | False if a transactional or service message is contractually required |
| "This completes our response to all your rights" | It completes **one** right. Access and rectification are separate |
| Anything about when it happened internally, or which system | Operational detail that invites a follow-up you then have to answer differently |
`,

  /* ----------------------------------------------------------------- phase 11 */
  'ex-11-1': `### The runbook

| # | Step | Verification | Common mistake |
|---|---|---|---|
| 1 | Confirm the core org edition and the required entitlement | The edition on screen, and the entitlement list from Setup. **If it is Professional and MCN is required, stop at 1a** | Assuming a license you have not read |
| 1a | *(If Professional and MCN required)* Confirm the upgrade path and date | A written upgrade plan, not a verbal assurance | Building journeys against an edition you do not have. You will configure successfully and send nothing |
| 2 | Choose the sending subdomain | The subdomain resolves and is not the corporate domain | Using the corporate domain, putting the primary domain at risk for every marketing send |
| 3 | Publish SPF, DKIM and DMARC | dig returns all three, and a test send passes authentication | Publishing DKIM as a TXT record with the key inline instead of the CNAME. The record exists and the signature still fails |
| 4 | Design the Business Units | A written governance sentence per BU, plus an owner and a review date | One BU per campaign - 20 BUs, thin IP volume, nobody to name as owner |
| 5 | Create roles and the permission set, then review it as code | A permission set diff in a pull request, and a test user per role | Assigning Administrator to everyone for convenience, which makes the permission model unreviewable |
| 6 | Install the permission set | A test user in each role can do exactly what the role matrix says | Installing the permission set before the roles and BU structure, then redoing it |
| 7 | Build the data model: keys, subscriber keys, retention | A DE inventory with keys and retention, and a test import proving the keys hold | Deferring the data model. Every journey built before it inherits the wrong key structure |
| 8 | Create the consent DE or object and the suppression list | A test that subscribes a contact, then proves the next send excludes them | Sending before consent exists. Every send before this point is a potential breach |
| 9 | Create sender profiles and dedicated IPs | A test send from each IP, authenticated, to a seed list | Turning on a dedicated IP at full volume. It has no sending history, so it starts cold and gets filtered |
| 10 | Configure send classification and quiet hours | A test send of each class, and a contact deliberately placed outside the quiet-hour window | One classification for everything, so a transactional receipt behaves like marketing and loses its exemption |
| 11 | Build the content templates | A seed-list test send per segment, including the emptiest segment | Building one template and reusing it. A journey needing a fallback cannot have one |
| 12 | Build the orchestration, with exits | A test journey with a conversion exit and a re-entry cooldown, run end to end | Building the journey before the content and the consent gate, and rebuilding it later |
| 13 | Tracking, attribution and reporting | One tracked link click and one conversion, reconciled to the send log | Enabling tracking last, when the campaign is already live and the baseline does not exist |
| 14 | Monitoring, alerting and handover | A test failure produces an alert to a **distribution list**, not a person | Alerting one person. When they are on holiday the failure is silent |
| 15 | First production send, small and seeded | Delivery rate, bounce rate and complaint rate reviewed at 24h and 72h | Going to full volume on day one. You get no signal before you get volume |

### The two steps where people most commonly go wrong

**Step 3, authentication.** The symptom is a **delivery rate collapse across every
IP, on a specific date, with no change in audience**. It reads as a list problem
because bounces went up, so the first hour is spent cleaning lists that were never
the cause.

**Step 9, a dedicated IP at full volume.** The symptom is **bounces and complaints
in the first 72 hours on one IP only**, on an audience that has always delivered.
The temptation is to look at the content, and the content is fine - the IP has no
reputation, and a cold IP sending 400k looks exactly like a compromised account to
a receiving provider.
`,

  'ex-11-2': `### The role matrix

| Capability | Content Mgr | Audience Mgr | Journey Builder | Sender / Ops | Admin |
|---|---|---|---|---|---|
| Create and edit content | **Yes** | No | No | No | Yes |
| Approve and publish content | Yes | No | No | No | Yes |
| **View another user's drafts** | **No - draft visibility is the Enhanced CMS Workspace's job, not the role's** | No | No | No | Yes |
| Create and edit audiences | No | **Yes** | Read | No | Yes |
| Delete an audience | No | **Yes**, with approval | No | No | Yes |
| Build and test journeys / flows | No | No | **Yes** | No | Yes |
| **Activate a journey to production** | No | No | **Yes, with a separate activation permission** | No | Yes |
| Create and send a campaign | No | No | **Yes** | **Yes** | Yes |
| Change sending domains | No | No | No | **Read only** | **Yes** |
| Assign or remove a dedicated IP | No | No | No | No | **Yes** |
| Configure send classification and quiet hours | No | No | No | No | **Yes** |
| Create and modify Business Units | No | No | No | No | **Yes** |
| Edit permission sets and roles | No | No | No | No | **Yes** |
| View consent records | Read only, via a restriction rule | Read only | Read only | Read only | **Yes** |
| Export an audience to a destination | No | **Yes, with approval** | No | No | Yes |
| Delete a Business Unit | No | No | No | No | **Yes** |

**The detail that earns the mark:** *build a journey* and *activate a journey to
production* are **different permissions**. Builders cannot publish. A journey that
reaches customers should require a second, deliberate act by someone who did not
write it.

### Roles vs Enhanced CMS Workspace

| | Roles and permission sets | Enhanced CMS Workspace |
|---|---|---|
| Controls | **What** a user can do - which objects, which actions | **Whose** content they can see, and in which workspace |
| Granularity | Object and action level | Workspace level, Personal or Shared per user |
| Draft isolation | **No** - roles do not restrict drafts | **Yes** - this is its main purpose |
| Review process | No | Yes - content review and approval states |
| Substitutes for the other | No | No |

**Why they are not the same mechanism:** a role tells a marketer they may edit
content. A workspace tells them whose content they may **see**, and that a draft
in progress stays a draft. An agency user with Content Manager rights across four
brands can see and touch all four brands' drafts unless the workspace structure
says otherwise.

**For this scenario:** one Enhanced CMS Workspace per brand for the shared
library, plus one **Personal** workspace per agency user so their drafts are
invisible to the client and to each other. Roles then handle the rest.

### The two things left admin-only, and the risk accepted

| Admin-only | Why | Risk accepted |
|---|---|---|
| **Sending domains, dedicated IPs, send classification** | A change here is immediate, irreversible and customer-visible. A misconfigured DMARC record or a re-pointed IP degrades deliverability for every message, and it is invisible in any user-facing screen | **Availability and speed.** A domain change waits for an administrator. Accepted because the failure mode is reputational and the fix window is measured in days |
| **Business Unit creation and deletion, and permission set changes** | Structural and permission changes must not be self-service. A BU created ad hoc splits IP volume and fragments reporting, and a permission set edited in the UI is unreviewable | **Friction, deliberately.** Adding a BU or a role becomes a ticket. Accepted because a wrongly scoped permission set is a compliance finding, and BU sprawl is irreversible in practice |

**What is deliberately not admin-only:** journey building, audience creation and
content production. If those are admin-only, every change routes through IT, and
the changes stop happening - a worse outcome than a reviewer seeing an occasional
mistake.
`,

  /* ----------------------------------------------------------------- phase 12 */
  'ex-12-1': `### Six needs, six surfaces

| # | Need | Surface | Build cost | Note |
|---|---|---|---|---|
| 1 | Which campaign performed best last quarter | **Standard report**, the prebuilt campaign performance report | **0 days** | This exact report exists. A custom one is wasted work |
| 2 | Which journey stage is leaking contacts | **Custom report** on journey activity | **1-2 days** including validation | Journey activity is a data view, so the report is cheap. Validate the stage definitions with the journey owner, not against the data |
| 3 | A bespoke board metric nobody has ever requested | **Dashboard**, only with a named owner | **2-3 days** | Named owner or it does not get built. See the refusal below |
| 4 | Cross-channel attribution including non-email touches | **Marketing Cloud Intelligence** | **10-15 days** | The only surface that can join email, SMS, paid and CRM into one attribution. Anything cheaper is a spreadsheet that will be believed and wrong |
| 5 | Consent coverage by channel for an audit | **Custom report** against the consent data, with an export | **1 day** | The auditor wants evidence with a timestamp, not a dashboard |
| 6 | Daily performance for 40 users who do not want to log in anywhere new | **Record-page or app insights**, plus an emailed digest | **3-5 days** | The constraint is behavioural, not analytical. If they will not log in, a dashboard is the wrong surface even though it is the obvious one |

### The one I would refuse to build

**Number 3, the bespoke board metric.**

A metric nobody has ever requested, with no named owner, no agreed definition and
no agreed refresh cadence, is not a dashboard - it is an unanswered question
rendered as a chart. It will have no agreed definition, so two people will quote
two values from it, and the first time that happens the whole reporting suite
loses credibility with the board.

**What I would offer instead:**

1. **A definition first.** Ask the board what decision the metric would change. If
   no decision, there is no metric. That conversation takes an hour, and it either
   produces a real KPI or closes the request.
2. **A standard report as a prototype**, built in under an hour from the prebuilt
   reports, with a written definition. If it is used twice, promote it. If it is
   not used, nothing was lost.
3. **The honest alternative:** a one-off analysis delivered as a written finding
   with the method stated, rather than a permanent artefact. Many "board metrics"
   are one-time questions that have been misfiled as standing requirements.

**The principle:** a permanent dashboard is a permanent maintenance commitment. If
nobody owns the metric, you are committing to maintain something nobody will
check.

### The build costs that are not obvious

- **Number 4 is 10-15 days, not 2.** The modelling is a week. The other week is
  aligning the attribution model and lookback window with the sales team, which is
  a people problem wearing a technical costume.
- **Number 6 is a change-management cost, not a build cost.** The engineering is
  three days. Getting 40 people to trust a number is the other two.
`,

  'ex-12-2': `### The three things that must match

| Must match | A | B | Why it is disqualifying if it does not |
|---|---|---|---|
| **Attribution model** | Last click | First touch | These answer different questions. Last credit goes to the campaign that closed. First credit goes to the campaign that started. They are not two measurements of one thing, they are two definitions of credit |
| **Lookback window** | 7 days | 30 days | A 7-day window cannot see touches 8 to 30 days out, so B's campaigns absorb credit A structurally cannot claim. The 30-day window alone inflates B |
| **Channel scope** | Email only | Email + SMS + paid | B's revenue is partly attributable to SMS and paid touches A was never measured against. The channel sets have to match |

### The two sentences

**The misleading one:**

> "Campaign B generated four times the revenue of Campaign A, so we should shift
> budget to B."

Four times is not a finding, it is the product of three multipliers - first-touch
versus last-click credit, a 30-day versus 7-day lookback, and a three-channel
versus one-channel scope. Any one of them could account for the whole difference.

**The honest one:**

> "These two numbers are not comparable as they stand, and no model makes them
> comparable without re-measuring both on the same basis; on a single last-click,
> 30-day, all-channel basis B leads A by roughly 40%, which is a real difference,
> but it is a different number from the four times in the deck."

**So: the four-times claim is not supportable, and B probably still is better -
just by a fraction of what was claimed.** That distinction is the whole answer.
Removing the number without replacing it is not analysis.

### Recommended model, justified against the sales cycle

**Last click, 30-day lookback, all channels.**

| Element | Recommendation | Reason against the cycle |
|---|---|---|
| **Model** | **Last click** | First-touch credit systematically over-credits the earliest touch and penalises the campaign that closed. Last click also matches how a commission is calculated, so marketing and sales reconcile |
| **Lookback** | **30 days** | With a long sales cycle the risk is *under*-crediting late touches, not over-crediting. A 7-day window credits the wrong campaign |
| **Channels** | **All**, with email, SMS and paid reported **separately as well as in total** | One blended number hides which channel works. Three numbers beside a total is answerable; one number is not |
| **Also added** | **A separate first-touch report, clearly labelled as diagnostic** | Two honestly labelled numbers beat one wrong number. The first-touch report is diagnostic, not the scorecard |
| **The one nobody asks for** | **A time-to-conversion distribution by campaign** | If B converts at 45 days on average and A at 12, A works in this cycle - and no attribution model can show you that, because the model is asking the wrong question |
`,


  /* ---------------------------------------------------- projects (phase 14) */
  'proj-01': `### Edition recommendation

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
`,

  'proj-02': `### The DE set

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
`,

  'proj-03': `### Match rules, in evaluation order

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
`,

  'proj-04': `### 1. The DNS record set

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

\`\`\`sql
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
\`\`\`

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
`,

  'proj-05': `### The MCE version, AMPscript

\`\`\`ampscript
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
\`\`\`

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

\`\`\`handlebars
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
\`\`\`

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
`,

  'proj-06': `### Flow type and entry source

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
`,

  'proj-07': `\`\`\`sql
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
\`\`\`

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
`,

  'proj-08': `### Capability map

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
`,


  /* ------------------------------------------------ use cases (phases 16-17) */
  'uc1': `### 1. Fix the consent data model first

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
`,

  'uc2': `### 1. Identity resolution across Lead, Contact and account

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
`,

  'uc3': `### 1. Agent scope, escalation path and handoff criteria

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
`,

  'uc4': `### 1. Migration sequence, and what stays in Engagement

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
`
};

if (typeof module !== 'undefined' && module.exports) { module.exports = EXERCISE_ANSWERS; }

