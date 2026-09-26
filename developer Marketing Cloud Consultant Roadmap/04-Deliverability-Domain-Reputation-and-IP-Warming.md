# 04 · Deliverability, Domain Reputation & IP Warming

> Phase 4 of 17 · the phase that makes every other phase measurable

## Why deliverability decides the business case

A campaign that lands in spam measures as a failure no matter how good the
personalisation, the flow design or the AI decisioning was. As a consultant you
will be judged on inbox placement, and you will be asked to explain a drop.

## Authentication: the non-negotiable three

Send from a **subdomain** dedicated to marketing, never the corporate domain.

| Record | Purpose | Where it lives |
|---|---|---|
| **SPF** | Lists the sending IPs allowed to send for the domain | TXT on the subdomain |
| **DKIM** | Cryptographically signs the headers so the receiver can verify | CNAME on `selector._domainkey` (preferred) |
| **DMARC** | Tells receivers what to do when SPF and DKIM fail, and where to report | TXT at `_dmarc` |
| **MTA-STS / TLS-RPT** | Enforces TLS and reports downgrade attempts | TXT + a policy file |

```text
Subdomain: mail.marketing.customer.com

# SPF
TXT @  "v=spf1 include:_spf.salesforce.com include:spf.mta.customer.com ~all"

# DKIM
CNAME selector1._domainkey dkim1.customer.com
CNAME selector2._domainkey dkim2.customer.com

# DMARC — start here
TXT _dmarc "v=DMARC1; p=none; rua=mailto:dmarc@customer.com; pct=100"
```

DMARC policy progression: `p=none` (monitor only) → `p=quarantine` → `p=reject`.
Move up only when your aggregate reports show that all legitimate senders are
aligned. Moving to `p=reject` while a legitimate system still fails alignment
gets your domain blacklisted.

```bash
dig +short TXT mail.marketing.customer.com
dig +short CNAME selector1._domainkey.mail.marketing.customer.com
dig +short TXT _dmarc.marketing.customer.com
```

## Dedicated IPs and warm-up

**Do you need a dedicated IP?** Only when reputation isolation is worth more than
the volume it needs. Rule of thumb: a dedicated IP wants a sustained daily send
volume high enough to build a consistent sending pattern — thousands per day.
Below that, shared infrastructure is better, because a low-volume dedicated IP
never accumulates enough history to be trusted.

| Situation | Recommendation |
|---|---|
| 8,000 emails/month | Stay shared. A dedicated IP cannot warm up at that volume. |
| 200k+/month, transactional only | Dedicated IP, and keep it transactional only |
| 2M+/month, marketing only | Dedicated IP, warm up properly, monitor per IP |
| Multiple brands, one shared IP | Split by IP, otherwise one brand damages the others |

### A 14-day warm-up schedule

The principle: ramp slowly, send to the *engaged* segments first, and never ramp
during a peak period.

| Day | Volume | Audience |
|---|---|---|
| 1–2 | 5,000 | Highly engaged (opened in the last 30 days) |
| 3–4 | 10,000 | Highly engaged + recent openers |
| 5–6 | 25,000 | Engaged |
| 7–8 | 50,000 | Broad, but excluding 180-day lapsed |
| 9–10 | 100,000 | Full qualified audience |
| 11–12 | 250,000 | Full audience, marketing only |
| 13–14 | Full volume | Then normal cadence |

Stop the ramp the moment a reputation metric moves against you. A warm-up that
resets is not a delay, it is a restart.

## Triage: read the send log, not your inbox

| Failure mode | Evidence | First fix |
|---|---|---|
| List hygiene | Hard bounce cluster on one import, 1 address repeated many times | Fix the source, re-permission, exclude the addresses |
| Authentication | Deliverability drop right after a DNS change, across all IPs | Fix SPF/DKIM/DMARC alignment before anything else |
| Content and targeting | Complaint rate up on a recently-purchased segment | Stop targeting converters; fix the audience predicate |
| Sender reputation | One mailbox provider blocking at 9%, others flat | That provider's filter list — reduce volume, clean the list |
| Volume / warm-up | Bounces up in the first 72h of a new IP | Slow the ramp, restart from day 1 volume |

The query that starts all of it:

```sql
SELECT
  s.BounceCategory,
  COUNT(*) AS affected,
  COUNT(DISTINCT s.EmailAddress) AS contacts
FROM ent.<childsendlog> s
WHERE s.BounceCategory IS NOT NULL
  AND s.SentDate >= DATEADD(day, -7, GETDATE())
GROUP BY s.BounceCategory
ORDER BY affected DESC
```

Then split by IP to separate "our infrastructure" from "their mailbox provider".

## Metrics that still mean something

**Open rate is not a deliverability metric any more.** Apple Mail Privacy
Protection pre-fetches images, so an open can be recorded with no human present.
This is why "opens dropped 40% overnight but clicks held steady" is usually good
news about measurement and bad news about the metric.

| Metric | Still useful? | Use it for |
|---|---|---|
| Delivery rate | Yes | The primary deliverability signal |
| Bounce rate by category | Yes | Distinguishing list, auth and reputation problems |
| Complaint / spam rate | Yes | Hard guardrail; a high open rate with complaints is a failure |
| Click and click-to-open rate | Yes | Engagement quality |
| Conversion rate | Yes | The only metric the CFO reads |
| Open rate | With care | Directional only, never as a deliverability KPI |

## Exam traps

- "We increased volume on a new IP" as an answer to a reputation problem.
- Recommending a dedicated IP for a low-volume customer.
- A/B testing subject lines to fix a bounce problem.
- Treating opt-out rate as a deliverability metric. It is a relevance and trust
  metric.

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `force-app/main/default/classes/EmailPreferenceService.cls` | Unsubscribe and complaint state that feeds suppression |
| `force-app/main/default/objects/Marketing_Interaction__c/` | Per-channel interaction log used for frequency capping and reputation analysis |
| `scripts/soql/deliverability-triage.soql` | The send log triage query as a reusable script |

## Exercises

- **ex-04-1 · Authenticate the Sending Subdomain** — the record set you hand to a domain admin.
- **ex-04-2 · Diagnose the Delivery Collapse** — four scenarios, four different first fixes.
- **MP-04** in [14 · Practical Exercises](14-Practical-Exercises-and-Mini-Projects.md) is the full version: DNS records, warm-up schedule and triage query.
