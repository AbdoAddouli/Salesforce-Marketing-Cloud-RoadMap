# 12 · Reports, Dashboards & Marketing Cloud Intelligence

> Phase 12 of 17 · 15% of the paper, and the phase that decides whether anyone trusts the numbers

## Where the reporting lives

| Platform | Tool | Use for |
|---|---|---|
| MCE | Data views, Tracking extracts, Marketing Cloud reports | Send log analysis, delivery, engagement |
| MCE | Datorama / Marketing Cloud Intelligence (MCI) | Cross-channel modelling, custom metrics, attribution |
| MCN | Insights on Data 360 | Operational campaign performance out of the box |
| MCN | Data 360 | Audiences and activation metrics |
| MCN | Marketing Cloud Intelligence (MCI) | Unified cross-channel analytics |
| Both | Your BI tool, fed by extracts or a connector | The finance-grade number |

The design principle: **one number, one source.** If the same conversion rate
exists in three dashboards with three values, the reporting is a liability.

## The metrics, and what each is actually for

| Metric | Definition | Use it for | Do not use it for |
|---|---|---|---|
| Delivery rate | Delivered ÷ sent | The deliverability health check | Comparing campaigns |
| Bounce rate | Bounces ÷ sent | Diagnosing list, auth or reputation | Proving engagement |
| Open rate | Opens ÷ delivered | Directional trend only | Deliverability, especially post Apple MPP |
| Click rate | Clicks ÷ delivered | Message relevance | Revenue |
| CTOR | Clicks ÷ opens | Subject line and from-name quality | Message body quality (the denominator is broken) |
| Conversion rate | Conversions ÷ delivered | Business performance | Channel comparison across different attribution windows |
| Unsubscribe rate | Unsubs ÷ delivered | Relevance and trust | Deliverability |
| Complaint rate | Complaints ÷ delivered | A hard guardrail, threshold-driven | Being "optimised for" |
| Frequency | Contacts per person per period | Managing contact fatigue | Segmentation strategy |
| Revenue per recipient | Revenue ÷ delivered | The number the CFO cares about | Anything else |

## Marketing Cloud Intelligence

MCI (Datorama) is the analytics layer: it ingests data from Marketing Cloud and
other systems, models it, and serves dashboards to non-technical users.

| Question | Answer in MCI via |
|---|---|
| Which campaign drove the most revenue? | A modelled fact, joined on the contact and the campaign |
| Are we over-messaging a segment? | Contact × period, not campaign × period |
| Which channel drives incremental value? | Multi-channel attribution, with the model declared |
| What is the cost per incremental conversion? | Cost model joined to the conversion fact |

What MCI is not: a send log, a journey builder, or a consent store. Sending
personal data to an analytics platform without a lawful basis is a compliance
problem, and MCI will happily accept the data you give it.

## Datasets and the schema you need

For MCI to answer attribution questions, the grain of your data matters more
than the number of datasets.

| Dataset | Grain | Joins on |
|---|---|---|
| Contact | One row per person | ContactKey |
| Send | One row per message sent | ContactKey + SendDate |
| Open / Click | One row per interaction | ContactKey + MessageID |
| Conversion | One row per conversion event | ContactKey + date |
| Consent | Current state | ContactKey |
| Cost | One row per spend line | Date + channel |

If your send dataset is one row per campaign, you cannot compute per-contact
frequency, and frequency capping stops being measurable.

## The frequency-capping query

This is the single most useful analytic query in lifecycle marketing:

```sql
SELECT
  c.EmailAddress,
  COUNT(DISTINCT s.SentDate) AS send_days,
  COUNT(DISTINCT j.JourneyName) AS touches
FROM ent.<childsendlog> s
JOIN ContactMaster c ON c.SubscriberKey = s.SubscriberKey
JOIN JourneyActivity j
  ON j.SubscriberKey = s.SubscriberKey
 AND j.ActivityDate >= DATEADD(day, -30, GETDATE())
GROUP BY c.EmailAddress
HAVING COUNT(DISTINCT s.SentDate) > 8
```

More than 8 send days in 30, and the person is a candidate for suppression. This
is the query that prevents "why did they unsubscribe" and "why did deliverability
drop" from being separate conversations.

## Designing a dashboard

Order it by the question the audience asks, in that order.

**Executive dashboard** — for leadership, one screen:
1. Contacts reached, and change vs previous period
2. Revenue and cost per conversion
3. Deliverability trend (delivery rate, complaint rate)
4. Consent health (opt-in rate by channel, complaints as a share of sends)

**Marketing operations dashboard** — for the person who runs the sends:
1. Automations: status, last success, failures in the last 7 days
2. Journey health: entries, exits by reason, in-flight population
3. Deliverability by sender IP and by domain
4. Frequency distribution across the active audience

**Analyst workspace** — for the person who asks why:
1. Segment comparison with the same definition applied
2. Channel contribution with a declared attribution model
3. Content performance by variant, with the caveat on CTOR
4. Data quality: identity resolution match rate, unresolved profiles

Every dashboard declares: the definition, the attribution window, the refresh
time, and the owner. A dashboard without those four is a rumour.

## The three analytics traps

1. **Open rate as a KPI.** Apple Mail Privacy Protection inflated opens, then
   Mail Privacy Threshold changed how it reports them. Track delivery, clicks
   and conversions; treat opens as a hint.
2. **A/B testing on a small sample and declaring a winner.** A 5% uplift on 500
   people is noise. Predefine the minimum detectable effect and the test
   duration.
3. **Comparing platforms with different attribution windows.** Meta 7-day click
   / 1-day view against a 30-day internal window will make whichever channel you
   prefer look better. Align the windows, or report them separately and stop
   comparing.

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `force-app/main/default/classes/MarketingCloudIntelligenceExportService.cls` | The governed extract that feeds MCI: field allow-list, retention, audit record |
| `force-app/main/default/reports/Marketing_Cloud_Engagement_Dashboard.report-meta.xml` | The operational engagement report |
| `force-app/main/default/reports/Data360_Segmentation_Performance.report-meta.xml` | Segment and activation performance |
| `force-app/main/default/tabs/Marketing_Engagement_Tab.tab-meta.xml` | The navigation entry to the reporting suite |
| `scripts/soql/segmentation-scenarios.soql` | The audience and segmentation queries the reports are built on |

## Exercises

- **ex-12-1 · Metric Definition Table** — ten metrics, the definition and the trap.
- **ex-12-2 · Dataset Grain Design** — the five datasets, the grain, and the join keys.
- **MP-05** in [14 · Practical Exercises](14-Practical-Exercises-and-Mini-Projects.md) builds the real dashboard and report.
