# 07 · Automation Studio & Data Operations

> Phase 7 of 17 · the unglamorous phase that keeps every other phase standing up

## When you need an automation

An automation is a **scheduled or triggered sequence of activities** that moves and
transforms data. It is the right tool when the work is about the *data*, not
about a person's journey.

| Activity | What it does | Trap |
|---|---|---|
| SQL query | Runs a query and writes the result to a DE | Target DE must be overwritten, or you duplicate every run |
| Import | Loads a file from FTP into a DE | No validation → half-loaded DE, then a send from bad data |
| Data extract | Writes a DE to a file for FTP | Retention and PII leakage in the extract file |
| File transfer | Moves a file between Folders and FTP | Ambiguous file names and a full folder are the two classic failures |
| Send | Email, triggered send, SMTP file | Triggered send at 300k requires a sending stream, not the default |
| SSJS activity | Server-side JavaScript | Cannot hold a long-running process |
| Wait | Pauses the sequence | Total automation runtime is capped — see below |

**Scheduled** automations run on a schedule you define. **Triggered** automations
fire from a scheduled email, a triggered send, or a journey/flow event.

## The runtime limit people get wrong

A single automation instance can only run for a limited period, and a
**triggered send activity cannot be used inside a triggered automation that runs
inside another triggered send** in certain combinations. More practically:

- Long-running activity chains must be split across multiple automations.
- A scheduled automation that has not finished before the next schedule fires
  either queues or skips, depending on configuration — decide which you want
  explicitly.
- 300k+ record sends need a dedicated sending stream; the default stream will
  either throttle or fail.

## Idempotence: the property that matters most

An automation runs again. It runs again because it failed halfway. It runs again
because somebody clicked Run. Every activity must be safe to repeat.

| Activity | Idempotent? | How to make it so |
|---|---|---|
| SQL query → **Overwrite** | Yes | Target DE is rebuilt each run; no accumulation |
| SQL query → **Append** | No | Re-running appends the same rows; dedupe in the query and set the target to overwrite |
| SQL query → **Update** | Partly | Updates existing rows only; new rows are invisible to it |
| Import | No | Always import to a staging DE, validate, then overwrite the target |
| File transfer | Depends | Include the run date in the file name, or the second run re-sends the first file |
| Send | No | Guard with a "already sent" flag in the DE |

An append-target SQL activity that fails after the send step and retries will
send the same email twice. That is the single most expensive automation bug in
this phase.

## The failure path

Design for 02:00 with nobody watching.

```text
1. File transfer      pull the CSV from SFTP
2. Import             into Staging_DE (never the live DE)
3. SQL validation     count rows, compare to expected, flag anomalies
4. SQL scoring        overwrite the send DE
5. Send               only if validation passed
6. Data extract       results and errors for the next day
```

Validation in step 3, in SQL, before the send:

```sql
SELECT
  COUNT(*) AS total_rows,
  SUM(CASE WHEN EmailAddress = '' OR EmailAddress LIKE '%@%' = 0 THEN 1 ELSE 0 END) AS bad_email
FROM Staging_DE
```

Wrap it in a conditional so the send step is skipped when `bad_email` exceeds a
threshold you chose with the customer. Then, for the failures themselves:

- **Retry** a transient file-transfer failure a fixed number of times with a gap.
- **Dead-letter** the rows that fail validation into an error DE. Never lose them
  silently and never let them into the send DE.
- **Alert** through the monitoring reports and an email to a distribution list, not
  to one person who is on holiday.

## Error handling rules

1. Validation before transformation, always.
2. Staging DEs are disposable; live DEs are not.
3. A failed automation must leave the send DE in its previous valid state.
4. Every automation needs a named owner in the monitoring email.
5. If an automation cannot be re-run safely, it is not finished.

## Data retention and cost

Send logs and extract DEs are where Marketing Cloud storage budgets go to die.

- Set a **retention policy on the send log Data Extension** — 3 months is a
  common starting point, and the built-in data views still give you delivery data.
- Delete staging DEs on a schedule.
- Set retention on Data Extension for List Management as well.
- Never extract more fields than the consumer needs; PII in an extract file is
  PII you now have to govern.

## Monitoring you hand over

| Asset | Purpose |
|---|---|
| Automation status report | Every automation, last run, last status, duration |
| Failed activity report | Failures with the error text, filtered to the last 7 days |
| Send DE row-count history | Catches a silent half-load before a send |
| Distribution list | Not a person. Never a person. |

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `force-app/main/default/classes/DataExtensionSyncService.cls` | Key-safe sync from an external feed into a staged DE |
| `force-app/main/default/classes/MarketingCloudIntelligenceExportService.cls` | A governed extract: field allow-list, retention, audit record |
| `force-app/main/default/objects/Data_Extension_Sync_Log__c/` | Row counts and validation results per run |
| `scripts/soql/segmentation-scenarios.soql` | The SQL activity bodies used in the exercises |
| `scripts/apex/` | Anonymous Apex used to load and validate test data |

## Exercises

- **ex-07-1 · Write the Idempotent Scoring SQL** — the activity type and the two failure modes it kills.
- **ex-07-2 · Design the Failure Path** — validation, retry, dead-letter and monitoring.
