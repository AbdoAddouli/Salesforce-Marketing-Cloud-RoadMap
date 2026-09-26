# 08 · Unified Messaging: SMS, WhatsApp & Push

> Phase 8 of 17 · three channels, three compliance models, three different failure modes

## The channel reality

| Channel | Registration before first send | Consent model | Cost shape | Job it is good at |
|---|---|---|---|---|
| Email | Domain authentication only | Opt-in (varies by law) | Per message | Everything asynchronous and rich |
| SMS / 10DLC | Brand + campaign registration, **8–12 weeks** | Opt-in with keyword or web form, proof of consent required | Per message, per segment | Time-critical, two-way, transactional |
| WhatsApp | Business verification + **message templates pre-approved** | Opt-in per channel | Conversation-based: template messages vs session messages | Service and opt-in driven conversations |
| Mobile push | Mobile SDK installed in the app | App-level permission, not a marketing opt-in | Essentially free per message | Timely in-app prompts to an identified device |

"Send promotional SMS at 22:00 local time to maximise open rates" is the question
the exam asks to see if you know about **quiet hours**. The answer is no: 10DLC
and most international regimes prohibit sending in quiet hours, and the consent
that authorised the send does not suspend the hour-of-day rule.

## SMS and 10DLC

10DLC is the US long-code programme run through a carrier aggregator. It gets you
a lower cost per message and better deliverability than short codes, at the price
of registration:

1. **Brand registration** — business identity, EIN, website, sample messaging.
2. **Campaign registration** — one per use case (marketing, 2FA, utility...). You
   cannot re-use a marketing registration for a transactional campaign.
3. **Messaging window** — approved send hours, in local time.
4. **Opt-in evidence** — the timestamp, source and keyword, retained.

| Failure | Symptom | Cause |
|---|---|---|
| Registration not complete | Sends silently dropped | Campaign not approved yet |
| Sample messages rejected | Registration stalled | Samples do not match the template text exactly |
| High opt-out on the first send | Complaint rate spike | 10DLC requires explicit opt-in, not "we have your number" |
| No delivery | Carrier filtering | Content classified as A2P marketing without the right registration |

Quiet hours are **per contact time zone**, which is why this needs a data
requirement, not a global setting:

```sql
SELECT
  c.MobileNumber,
  c.TimeZone_Offset,
  CASE
    WHEN (HOUR - c.TimeZone_Offset + 24) % 24 BETWEEN 8 AND 20 THEN 'Send now'
    ELSE 'Defer to 08:00 local'
  END AS Send_Window
FROM Mobile_Reachable__c c
WHERE c.SMS_Consent__c = 1
  AND c.IsOptedOut__c = 0
  AND c.MobileNumber LIKE '+%'
```

The design principle: **defer, do not drop**. A contact outside their window goes
into a deferred set with a next-send field, and the next run picks them up — after
re-checking consent, because they may have unsubscribed in the meantime.

## WhatsApp

Two message categories, and the distinction decides your cost and your ability to
send:

| Category | What it is | Approval | Cost |
|---|---|---|---|
| **Template message** | Marketing, or any message initiated by the business outside a 24-hour window | Template pre-approved by WhatsApp | Per conversation, higher |
| **Session message** | A reply inside an open 24-hour customer service window | No template needed | Lower, included in the conversation |

Consequences for a consultant:

- You cannot design a WhatsApp campaign as a broadcast. Every outbound message
  outside a service conversation is a template message and must be pre-approved.
- Utility and authentication templates are pre-approved by default in some
  programmes; marketing templates are not.
- Opt-out on WhatsApp is a hard stop, and you need a per-template opt-out
  ("stop marketing" vs "stop all") or carriers will penalise you.
- The Business case requires the **WhatsApp entitlement** — this is the constraint
  that most often blocks Marketing Cloud Next, since the current core edition may
  not include it. This is the binding constraint in the UC4 migration scenario.

## Mobile push

Push requires the **mobile SDK inside the app** and a device token. It is not a
marketing opt-in: it is an app-level permission the user granted (or the OS
permission the app requests). Marketing push still needs a frequency policy, and
a deep link has to be correct, or you have taught users to ignore your badge.

## Cross-channel orchestration

The rule that keeps the customer: **one message per intent, per window.**

```text
Cart abandoned at 10:00
  ├─ Email immediately        (rich, no consent constraint beyond marketing opt-in)
  ├─ SMS at +2h               (only if SMS consent; only if no email click)
  └─ No push                  (if the app was used, or if a click happened)
```

| Rule | Implementation |
|---|---|
| Suppress SMS if email was clicked | Click predicate in the SMS entry rule |
| Cap total contacts per day | Cross-channel frequency query on the interaction log |
| Never contact on a hard bounce | Suppression write in the bounce handling path |
| One channel owns the conversation | If the customer replies to SMS, route the rest to service |

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `force-app/main/default/classes/ConsentSyncService.cls` | Per-channel consent written to one profile, with conflict resolution |
| `force-app/main/default/objects/Consent_Preference__c/` | The channel-level consent record the send gate reads |
| `force-app/main/default/objects/Marketing_Interaction__c/` | Interaction log that makes cross-channel frequency capping queryable |
| `scripts/soql/quiet-hours.sql` | Time-zone aware quiet hours, deferral, not deletion |

## Exercises

- **ex-08-1 · Channel Selection Matrix** — registration, consent, cost and the one job per channel.
- **ex-08-2 · Time-Zone-Aware Quiet Hours** — the predicate plus the deferred-set activity.
- **MP-07** in [14 · Practical Exercises](14-Practical-Exercises-and-Mini-Projects.md) is the full consent-aware SMS gate.
