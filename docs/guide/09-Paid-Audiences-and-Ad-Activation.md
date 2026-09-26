# 09 · Paid Audiences & Ad Activation

> Phase 9 of 17 · the domain where retired products are still the most common wrong answer

## Read the blueprint first

This objective contains one of the most heavily exploited distractor sets on
both papers: retired and renamed advertising products. Sort them into three
buckets and the scenario becomes easy.

| Status | Product | What to do instead |
|---|---|---|
| **Retired** | **Advertising Studio** — non-renewable from **15 August 2026** | Data 360 Ad Audiences |
| **Retired** | **Audience Studio** — retired in 2024 | Data 360 segments + Data 360 Ad Audiences |
| **Sunset** | **Social Studio** | Data 360 or vendor-native social integrations |
| **Current** | **Data 360 Ad Audiences** (ex Data Cloud Ad Audiences) | — |

Any answer recommending Advertising Studio for a new build is wrong. Any answer
recommending Audience Studio is wrong. If the question is about an *existing*
Advertising Studio implementation, the answer is a migration to Data 360 Ad
Audiences.

## What an audience actually is

An **audience** is a segment, resolved to a countable member list, matched to a
platform, and refreshed on a cadence. Four things must line up, and the failure
is almost always one of them:

1. **The segment** — the rule set. What makes a human eligible.
2. **The destination** — Meta, Google, LinkedIn, TikTok, X, Pinterest, Snap, Reddit.
3. **The match** — usually an email hash; sometimes a phone, a device ID or a
   first-party identifier.
4. **The consent and policy state** — the legal basis for using that human in
   advertising at all.

## Platform-native audiences win when you can match them

| Situation | Recommendation | Why |
|---|---|---|
| Segment maps 1:1 to platform users (customer IDs, logins, app installs) | **Platform-native audience** | No PII leaves the platform; better match rate; cheapest |
| Segment must be matched by email | **Conversion list / customer list upload** (hashed) | Platform does the hashing and the lookalike expansion |
| You need exclusions and retargeting across channels | **Data 360 Ad Audiences** as the system of record | Single consent and suppression state |
| Tiny audience, needs lookalike expansion | Platform-native lookalike | Better seed quality, cheaper expansion |
| Regulatory requirement that PII never leaves | Platform-native only | This is a hard architectural boundary |

The consultant answer is rarely "which product" — it is **"can we avoid sending
PII to the platform?"** If yes, build native. If a cross-channel suppression
state matters more than match rate, use Data 360 Ad Audiences as the authority
and accept the hashed upload.

## Match rate is the real KPI

| Symptom | Likely cause | Fix |
|---|---|---|
| Match rate 25–40% | Only email uploaded, no phone or platform ID | Add first-party identifiers where consent allows |
| Match rate 2% | Hashed with the wrong normalisation (trim, lowercase, algorithm) | Re-verify SHA-256 and normalisation rules |
| Audience delivered but no conversions | Matched on an identifier the platform cannot attribute | Check the platform's attribution window and pixel/CAPI health |
| Audience shrinks every refresh | Segment rule references a field that is not populated consistently | Fix the rule; a shrinking audience is a data bug, not a platform bug |

## Suppression is the compliance control

Every paid activation must exclude, on every refresh:

- Contacts who opted out of **that channel's** advertising.
- Contacts on the global suppression list.
- Contacts who are in an active conversion journey, if the message is the same
  offer.
- Contacts who are frequency-capped across channels.

The last two are the ones a compliance-only design misses, and they are the ones
that damage the account.

## Checklists

**Discovery**

- [ ] Which platforms does the customer actually spend on, per channel?
- [ ] Is there an existing Advertising Studio implementation, and when does it expire?
- [ ] Can platform-native audiences cover the requirement?
- [ ] What is the legal basis for advertising use of the data, per region?
- [ ] Is there a CAPI / conversion API connection, and is it healthy?

**Design**

- [ ] System of record for the segment named.
- [ ] Matching identifiers chosen, with consent basis for each.
- [ ] Suppression list shared across every destination.
- [ ] Refresh cadence defined, with the reason for it.
- [ ] A test audience of a few hundred contacts to verify match before scaling.

## Exam traps

- Recommending Advertising Studio (retired) as the "modern" answer.
- Recommending Audience Studio (retired) for segmentation.
- Uploading plain-text email to a platform that requires hashed uploads.
- Suggesting the platform audience is refreshed on every platform event.
- Confusing an *audience* (paid platforms) with an *Actionable List* (MCN
  activation surface).

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `force-app/main/default/classes/LeadRoutingForCampaignsService.cls` | CRM campaign membership to audience activation, with suppression applied first |
| `force-app/main/default/classes/CampaignMemberSyncService.cls` | Keeps CRM campaign membership in step with the marketing segment |
| `force-app/main/default/objects/Consent_Preference__c/` | The per-channel advertising consent the refresh reads |

## Exercises

- **ex-09-1 · Retired-Product Triage** — five recommendations, which survive and what replaces them.
- **ex-09-2 · Audience Design with Suppression** — segment, destination, match key, consent and refresh.
