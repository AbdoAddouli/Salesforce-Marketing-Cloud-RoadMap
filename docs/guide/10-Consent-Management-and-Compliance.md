# 10 · Consent Management & Compliance

> Phase 10 of 17 · 15% of the paper, and the phase with the most real-world consequences

## The data subject requests named in the blueprint

| Request | What the person is asking for | Where you execute it |
|---|---|---|
| **Right to access / data portability** | A copy of the data held about them, in a portable format | MCE: a preference centre DE + an extract. MCN: Data 360 unified profile export |
| **Right to rectification** | Correct the data | Profile update, then re-run identity resolution |
| **Right to erasure** | Delete it | See the erasure design below — deletion is the hard one |
| **Right to restrict** | Stop using it for a purpose | Per-channel consent flag, not deletion |
| **Right to object** | Stop a specific processing purpose | Per-channel consent flag |
| **Right not to be profiled** | Exclude from automated decisioning | A suppression attribute read by every segmentation rule |

## Consent is per channel, per purpose

The mistake is a single boolean. A person can be:

- opted in to email marketing, opted out of email promotional,
- opted in to transactional email (never really optional),
- opted in to SMS but opted out of WhatsApp,
- opted in to analytics, opted out of advertising.

```text
Consent_Preference__c
  Contact__c
  Channel__c            Email | SMS | WhatsApp | Push | Advertising
  Purpose__c            Marketing | Transactional | Analytics | Advertising
  Status__c             OptedIn | OptedOut | Pending | Transferred
  OptedInDate__c
  OptedOutDate__c
  Source__c             Form | Import | Keyword | App
  Evidence__c           URL, keyword, timestamp, IP where applicable
```

A **soft bounce** is not opt-out, and it is not consent either. It is a
deliverability signal. Treating a bounce as an opt-out destroys your addressable
audience; treating a form fill as consent for every channel is a compliance
failure. The two must stay separate in the data model.

## Unsubscribe in MCE

Two levels, both must work:

- **List unsubscribe** — this specific list or send.
- **Marketing Cloud global unsubscribe** — everything promotional, all lists.

The preference centre must let the person change consent **and** the unsubscribe
link must work even for a content-only email. A marketing email with no
functional unsubscribe is the fastest way to have a domain blocked.

```html
<a href="{{UnsubscribeUrl}}">Unsubscribe</a>
<a href="{{PreferenceCenterUrl}}">Manage your preferences</a>
```

## Privacy and compliance automation

| Automation | Trigger | Effect |
|---|---|---|
| Consent sync | Consent changed in CRM | Update the profile, apply to the next send |
| Global suppression service | Spam complaint | Suppress across all channels immediately, write the evidence |
| Anonymisation | Retention boundary reached | Strip or hash identifying fields, keep the aggregates |
| Right-to-be-forgotten | Erasure request | Per-source delete, then re-run identity resolution |

Marketing Cloud's **Privacy and Compliance** settings also let you control what
identifying data is returned to the platform at runtime — anonymous
send-context, hashed emails for non-authenticated users. This is the difference
between "we deleted it" and "we never let it leave the system", and the second is
far easier to prove.

## The erasure design problem

Erasure cannot be a single delete button, because the data is in seven places.

| Location | Action | Note |
|---|---|---|
| CRM records | Delete, or anonymise where the business has a legal basis to keep the record | The org is the system of record for the master |
| Data Extensions | Delete or null the identifying columns | Do not delete the row if an aggregate needs it |
| Data 360 | Delete at source, then re-run identity resolution | Otherwise the profile reappears on the next ingest |
| Send log | Keep the send, anonymise the address | The send itself happened; you cannot un-send it |
| Journey / flow state | Remove from every in-flight journey | Otherwise the next touch re-offends |
| Suppression lists | **Keep, and keep forever** | Anonymised: the suppression must survive the erasure |
| Tracking / web | Honour the browser consent signal | Not a Marketing Cloud object, still a legal obligation |
| Third parties (platforms, ESPs) | Send a deletion request downstream | You cannot delete what you do not control |

The non-negotiable rule: **suppression must be an anonymised tombstone, not a
deletion.** If you delete the suppression record when you erase the profile, the
next ingest rebuilds the profile and the person is messaged again. In this repo
that tombstone is a `Consent_Preference__c` row with the identifying fields
cleared and `Status = OptedOut` retained.

## Data subject request workflow

```text
1. Receive request + verify identity (do not act on an unverified request)
2. Locate the human across every source (this is why identity resolution matters)
3. Assemble the response, in a portable format, from the profile
4. Apply the action per location, in the table above
5. Write the request to the audit log, with the evidence and the timestamp
6. Confirm to the person, and schedule a verification that it actually held
```

Step 6 is the step that distinguishes a compliant programme from a compliant-looking
one. Re-check 30 days later that the profile did not rebuild.

## Consent at activation, not at send

The design rule: **the consent gate is applied when the audience is created.**
Filtering at send time is too late — the data has already been treated as
marketable, exported, and in the case of paid platforms, transferred to a third
party.

## Exam traps

- "Ask for consent on the send" instead of at the source.
- Deleting the suppression record during an erasure.
- Deleting the send log to "remove the data", when anonymising is the answer.
- Treating a soft bounce as opt-out.
- Global unsubscribe as the only mechanism, with no list-level unsubscribe.
- Recommending the consent gate in the send step rather than in the segmentation.

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `force-app/main/default/classes/ConsentSyncService.cls` | Consent state resolved per channel and per purpose, with the tombstone case handled |
| `force-app/main/default/classes/EmailPreferenceService.cls` | Preference centre read/write, list-level and global unsubscribe |
| `force-app/main/default/objects/Consent_Preference__c/` | The consent record with evidence fields |
| `force-app/main/default/objects/Data_Extension_Sync_Log__c/` | The audit trail for every consent and erasure action |
| `force-app/main/default/flows/Consent_Capture_Preference_Centre.flow-meta.xml` | Capture flow, including anonymous and authenticated paths |

## Exercises

- **ex-10-1 · Consent Model Design** — the DE or object, with status transitions.
- **ex-10-2 · Run an Erasure Request** — the seven locations, the action, and what must survive.
- **MP-05** in [14 · Practical Exercises](14-Practical-Exercises-and-Mini-Projects.md) builds the real consent object and flow.
