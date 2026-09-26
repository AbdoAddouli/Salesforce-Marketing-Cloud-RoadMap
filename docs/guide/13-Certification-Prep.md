# 13 · Certification Prep

> Phase 13 of 17 · facts, weights, strategy, and the traps that cost candidates marks

## The two exams

| Fact | Marketing Cloud Engagement (Admin) | Marketing Cloud Next (Consultant) |
|---|---|---|
| Questions | 60 scored | 60 scored |
| Duration | 105 minutes | 105 minutes |
| Pass mark | **65%** | **65%** |
| Delivery | Online proctored | Online proctored |
| Format | Multiple choice, multiple select, true/false | Multiple choice, multiple select, scenario-based |
| Prerequisite | None | Marketing Cloud Engagement Administrator |

**No prerequisite for MCE.** The MCE Administrator exam has no prerequisite of any
kind. If you have seen "Email Specialist" cited as a prerequisite, that is
pre-2018-rename material and it is wrong for the current exam.

For **MCN Consultant**, the Marketing Cloud Engagement Administrator
certification **is** a prerequisite. Plan the order: MCE first, then MCN.

## Blueprint weights

### Marketing Cloud Engagement (Admin)

| Domain | Weight |
|---|---|
| Data Modeling | 30% |
| Setup and Configuration | 15% |
| Marketing Campaigns | 20% |
| Automation | 15% |
| Analytics | 10% |
| Consumer & Integrations | 10% |

### Marketing Cloud Next (Consultant)

| Domain | Weight |
|---|---|
| Campaign Design | 30% |
| Data Modeling, Identity Resolution & Segmentation | 25% |
| Platform Setup & Governance | 10% |
| Consent & Compliance | 15% |
| Agentforce | 5% |
| Analytics & Insights | 15% |

The strategic read: **55% of the MCN paper is data and segmentation**, and 30% is
campaign design. Study strategy should match those numbers, not a general sense of
"Marketing Cloud".

## Pass mark arithmetic

60 scored questions, 65% pass mark.

| Correct answers | Score | Result |
|---|---|---|
| 40 | 66.7% | Pass |
| 39 | 65.0% | Pass (at the boundary) |
| 38 | 63.3% | Fail |
| 36 | 60.0% | Fail |

**39 correct is the floor.** That is 21.5 wrong answers out of 60. It is also
why unflagged questions should be answered — never leave one blank, because an
unanswered question is a guaranteed zero in a proctored exam with no penalty for
guessing.

## Question types and how to read them

| Type | What it tests | Approach |
|---|---|---|
| **Multiple choice** (one best) | You know the product boundary | Eliminate three, choose the one you can defend |
| **Multiple select** (several correct) | Depth in a domain | Answer every option, not just the obviously-right one. Partial credit is usually not available |
| **True / false** | Precise recall of a rule | Be suspicious of "always" and "never" |
| **Scenario** (MCN-heavy) | Applying several rules to one story | Read the constraints first, then the goal |

The scenario questions are the trap: they contain six facts, only two of which
matter. Extract the constraint that binds.

**Example.** "A customer is on a Professional org, wants WhatsApp, and asks for
Agentforce decisioning. What is the first action?" The binding constraint is the
Professional org: MCN needs Enterprise or Unlimited. Answer: confirm the core org
edition and the WhatsApp entitlement before designing anything.

## The nine recurring traps

| Trap | Why it works | The correction |
|---|---|---|
| Retired products as answers | Advertising Studio, Audience Studio, Social Studio all appear in older material | Advertising Studio non-renewable 15 Aug 2026; use Data 360 Ad Audiences |
| A "modernisation" that is actually a downgrade | Recommending IP warming for a low-volume sender | Stay shared below ~thousands/day |
| A compliance control that is not a control | Filtering at send time | Gate consent at activation |
| Deleting where you should anonymise | Erasure requests | Keep an anonymised suppression tombstone |
| Automation where journey is required | Batch scored as lifecycle | Per-contact behaviour → journey / record-triggered flow |
| Journey where automation is required | A nightly score as a journey | Data movement → automation / scheduled flow |
| Ignoring the core org edition | MCN designed for a Professional org | Enterprise or Unlimited required |
| Best-practice over budget | Splitting flows to isolate sends | Consumption is driven by evaluations × records × fields |
| Metrics that stopped meaning what they meant | Open rate, CTOR | Apple Mail Privacy Protection; use delivery, clicks, conversions |

## A six-week study plan

| Week | Focus | Output |
|---|---|---|
| 1 | MCE data model, keys, retention, data views | Keys and retention table, from memory |
| 2 | MCE setup, permissions, send classification, deliverability | Setup checklist executed once in a BU |
| 3 | MCE campaigns, automation, analytics | Three idempotent automations, written |
| 4 | MCN campaign design, consent, platform setup | MCN blueprint mapped to this roadmap |
| 5 | Data 360, identity resolution, segmentation, consumption | A unified profile field map |
| 6 | Full mock papers under time, plus a review of every error | Two timed 60-question papers |

## Exam-day rules

1. Answer as you read. Do not leave questions blank.
2. On a multiple select, work from "surely true" to "surely false" and mark the
   uncertain ones for review.
3. If a scenario mentions an org edition, a license, a renewal date or a
   constraint, it is load-bearing.
4. Flag every question you guessed, and review only those plus the wrong ones.
5. 39 correct is the floor. Do not aim for 40 and hope.

## Practice

`docs/assets/examfacts.js` holds the facts, the blueprint, the lifecycle changes
and the mock paper. `docs/index.html` runs it: a 60-question timed mock, drawn
from a 30-question bank with full option rotation so a repeat attempt is not the
same paper. The bank is smaller than the paper, so the app says so — memorising
the bank is not a substitute for the blueprint.

| Domain | Mock questions |
|---|---|
| Campaign Design | 18 |
| Data Modeling, Identity Resolution & Segmentation | 15 |
| Platform Setup & Governance | 8 |
| Consent & Compliance | 8 |
| Agentforce | 6 |
| Analytics & Insights | 5 |
| **Total** | **60** |

The mock is deliberately weighted to the blueprint, not spread evenly, so the
result tells you where you are actually weak.

## Artifacts in this repo

| Artifact | What it shows |
|---|---|
| `docs/assets/examfacts.js` | The facts, the blueprint, the retired-product list and the bank |
| `docs/assets/app.js` | The mock engine: largest-remainder allocation, option rotation, scoring |
| `force-app/main/default/customMetadata/Certification_Setting__mdt/` | The same facts as version-controlled metadata |

## Exercises

- **ex-13-1 · Blueprint Audit** — your confidence per domain against the weight.
- **ex-13-2 · Trap Identification** — ten plausible answers, each with the rule it breaks.
