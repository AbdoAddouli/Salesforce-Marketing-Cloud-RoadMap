# Salesforce Marketing Cloud Consultant Roadmap

A 17-phase interactive study academy for the Salesforce Marketing Cloud
Consultant track, plus a reference SFDX project that implements the logic the
curriculum keeps asking about.

**Live site:** <https://abdoaddouli.github.io/Salesforce-Marketing-Cloud-RoadMap/>

The academy is plain HTML, CSS and JavaScript. No build step, no framework, no
runtime dependencies. Clone it, open `docs/index.html`, and it runs.

---

## Table of contents

- [What is in here](#what-is-in-here)
- [The academy](#the-academy)
- [The 17 guides](#the-17-guides)
- [Running it locally](#running-it-locally)
- [The reference SFDX project](#the-reference-sfdx-project)
- [Docs tooling](#docs-tooling)
- [Certification facts](#certification-facts)
- [Resources](#resources)
- [Status and honest limitations](#status-and-honest-limitations)
- [Licence and trademarks](#licence-and-trademarks)

---

## What is in here

| Path | What it is |
| --- | --- |
| `docs/` | The interactive academy. `index.html` is the entry point. |
| `docs/assets/` | Application code: curriculum, model answers, exam facts, mock exam, styles. |
| `docs/guide/` | The same 17 guides as Markdown, for reading on GitHub or in a raw browser. |
| `developer Marketing Cloud Consultant Roadmap/` | The 17 guides as canonical Markdown, outside the web app. |
| `force-app/` | Reference SFDX project. See [ARCHITECTURE.md](ARCHITECTURE.md). |
| `manifest/` | Deployment manifest for that project. |
| `scripts/` | Docs validator, guide generator, and SOQL and Apex practice scenarios. |
| `config/` | Scratch org definition used by the Salesforce DX templates. |
| `docs/assets/*.js` | Plain browser scripts that also export as CommonJS, so the validator and any test runner can `require` them. |

---

## The academy

Seventeen phases mapped to the six weighted sections of the official exam
blueprint. Each phase has a full guide, a worked walkthrough, and two guided
exercises with model answers.

| Blueprint section | Weight | Phases |
| --- | --- | --- |
| Campaign Design, Flow Orchestration & Content | 30% | 05, 06, 07, 08 |
| Data Modeling, Identity Resolution & Segmentation | 25% | 02, 03 |
| Platform Setup & Governance | 13% | 01, 11 |
| Consent | 13% | 10 |
| Agentforce & AI Innovation | 11% | 09, 13 |
| Analytics & Performance Insights | 8% | 12 |

**What is in a phase**

- A long-form guide, written for reading rather than skimming.
- A worked walkthrough that applies the guide to a scenario.
- Two guided exercises with model answers, and a note explaining *why* the
  answer is right rather than just what it is.
- Checklist items you tick off. Progress is per phase.

**The mock exam**

Sixty questions drawn from the six domains in blueprint proportion, so a
low-weight domain gets few questions and a 30% domain gets many. The paper is
deterministic: the same seed returns the same paper, so you can revise and
re-sit it without the questions moving underneath you. Options rotate on
repeats so that memorising an option position does not transfer.

**Privacy**

Progress, theme and notes are stored in `localStorage` in your own browser.
There is no account, no server, no analytics and no network call. Clearing site
data resets your progress. Progress does not sync between browsers or devices.

---

## The 17 guides

| Phase | Guide |
| --- | --- |
| 01 | [MC Concepts, Editions & Architecture](docs/guide/01-Marketing-Cloud-Concepts-and-Architecture.md) |
| 02 | [The Subscriber & Data Extension Model](docs/guide/02-The-Subscriber-and-Data-Extension-Model.md) |
| 03 | [Data 360, Identity Resolution & Segmentation](docs/guide/03-Data-360-Identity-Resolution-and-Segmentation.md) |
| 04 | [Deliverability, Domain Reputation & IP Warming](docs/guide/04-Deliverability-Domain-Reputation-and-IP-Warming.md) |
| 05 | [Content Building & Personalization](docs/guide/05-Content-Building-and-Personalization.md) |
| 06 | [Journey Builder & Flow Orchestration](docs/guide/06-Journey-Builder-and-Flow-Orchestration.md) |
| 07 | [Automation Studio & Data Operations](docs/guide/07-Automation-Studio-and-Data-Operations.md) |
| 08 | [Unified Messaging: SMS, WhatsApp & Push](docs/guide/08-Unified-Messaging-SMS-WhatsApp-and-Push.md) |
| 09 | [Paid Audiences & Ad Activation](docs/guide/09-Paid-Audiences-and-Ad-Activation.md) |
| 10 | [Consent Management & Compliance](docs/guide/10-Consent-Management-and-Compliance.md) |
| 11 | [Platform Setup, Governance & Business Units](docs/guide/11-Platform-Setup-Governance-and-Business-Units.md) |
| 12 | [Reports, Dashboards & Marketing Cloud Intelligence](docs/guide/12-Reports-Dashboards-and-Marketing-Cloud-Intelligence.md) |
| 13 | [Certification Prep](docs/guide/13-Certification-Prep.md) |
| 14 | [Practical Exercises & Mini Projects](docs/guide/14-Practical-Exercises-and-Mini-Projects.md) |
| 15 | [Answers & Results](docs/guide/15-Answers-and-Results.md) |
| 16 | [Real-World Use Cases](docs/guide/16-Real-World-Use-Cases.md) |
| 17 | [Use Case Solutions](docs/guide/17-Use-Case-Solutions.md) |

The same documents also live in
[`developer Marketing Cloud Consultant Roadmap/`](developer%20Marketing%20Cloud%20Consultant%20Roadmap/).
The validator checks the two copies are byte-identical, so they cannot drift.

---

## Running it locally

**Option 1, just open it**

```bash
start docs/index.html
```

Works, with one caveat: browsers block `fetch()` of local files, so the in-app
guide viewer and the exam's answer explanations will not load. Everything else
works.

**Option 2, serve it (recommended)**

```bash
npm run docs:serve      # http://localhost:8080
```

This is what the live site does, so it is the faithful test. No install needed;
the script uses Python's bundled HTTP server.

**Option 3, deploy it**

The site is published by GitHub Pages from the `main` branch, `/docs` folder.
To do the same in your own fork: **Settings → Pages → Deploy from a branch**,
branch `main`, folder `/docs`.

---

## The reference SFDX project

Marketing Cloud Engagement has no custom object model. This project mirrors its
concepts onto CRM custom objects, and the mapping is the point of the exercise:

| Marketing Cloud concept | CRM representation |
| --- | --- |
| Data Extension | `Contact_Master__c` plus query results |
| Subscriber Key | `Contact_Master__c.Email__c`, enforced unique |
| Consent / suppression list | `Consent_Preference__c` |
| Send log | `Marketing_Interaction__c` |
| Journey entry decisioning | `Journey_Entry_Log__c` |
| Import / query audit | `Data_Extension_Sync_Log__c` |
| Question bank | `Training_Question__c` |

**Contents:** 10 service classes, 1 shared trigger handler, 11 test classes, 7
thin triggers, 6 custom objects, 4 Campaign fields, 3 custom metadata types,
2 flows, 2 LWC components, 1 platform event, 2 email templates, 2 reports,
1 dashboard, 3 tabs, a permission set, sharing rules and an approval process.

`ARCHITECTURE.md` documents the ten design rules the tests exist to protect. The
two that matter most:

1. **Opt-out is terminal.** No recency rule, no source priority and no
   evidence-free import ever clears an opt-out. Only a new, evidenced opt-in
   from the person does.
2. **A tombstone never sends.** An erased person keeps a suppression record with
   no identifier, so deleting the tombstone lets the next ingest rebuild the
   profile and the person gets messaged again.

```bash
# Deploy
sf project deploy start --manifest manifest/package.xml

# Run the Apex tests
sf apex run test --test-level RunLocalTests --code-coverage -r human -w 20
```

---

## Docs tooling

```bash
npm run docs:validate
```

Checks that all 17 phases are present, that both copies of every guide are
identical, that all 36 exercise IDs have model answers, that every guide link in
the curriculum resolves, and that every metadata path the curriculum references
actually exists in `force-app/`. Current state: **0 errors, 0 warnings**.

```bash
npm run docs:sync
```

Regenerates guides 16 and 17, and the project block of guide 15, from
`docs/assets/curriculum.js` and `docs/assets/answers.js`. Those guides are
generated so the Markdown and the interactive academy cannot drift apart. The 24
exercise answers in guide 15 are hand-written and are not touched by this.

If you edit the curriculum, run `docs:sync` before you run `docs:validate`.

---

## Certification facts

Exam facts live in two places, and this repository is explicit about which is
authoritative.

- **`docs/assets/examfacts.js`** is the source of truth for the interactive
  academy, and it cites its sources in the file.
- **`Certification_Setting__mdt`** holds one record per exam for use in an org,
  with a `Source_Url__c`, a `Verified_On__c`, a `Verification_Note__c` and an
  `Is_Verified__c` flag.

### Marketing Cloud Next Consultant — verified

Confirmed against the official Salesforce Help exam guide, article `005387657`,
aligned to the Summer '26 release:

| | |
| --- | --- |
| Questions | 60 multiple-choice, plus up to 5 unscored |
| Time | 105 minutes |
| Passing score | **72%** |
| Prerequisite | **None** |
| Fee | USD 200 / JPY 30,000 (retake USD 100 / JPY 15,000) |

The six weighted sections in the table above come from the same source.

### Marketing Cloud Engagement Consultant — partially verified

The prerequisite is confirmed on the official Trailhead credential page: the
**Marketing Cloud Engagement Administrator** credential is required. The 67% pass
mark is reported by third-party sources but Salesforce does not publish it, so
`Is_Verified__c` is `false` on that record.

Beware the legacy numbers still in circulation. The 2018 *Marketing Cloud
Consultant* guide quoted **68%** with a **Marketing Cloud Email Specialist**
prerequisite. That credential is now *Marketing Cloud Engagement Consultant* and
the prerequisite moved to the *Engagement Administrator*. Older blog posts,
slides and exam dumps still quote the old name, the old prerequisite and 68%.

### Renames and retirements worth knowing

- **Advertising Studio** is non-renewable from **15 August 2026**. Do not design
  new solutions on it; Data 360 Ad Audiences is the replacement.
- **Audience Studio** (DMP / Krux) was retired on 1 February 2024 and its data
  deleted.
- **Einstein for Marketing** is now **Agentforce Marketing**. Send Time
  Optimization, Content Selection and Copy Insights are part of that family.
- **Data Cloud** is now **Data 360**.

Verify anything here against the current official source before you rely on it in
a client conversation.

---

## Resources

Everything below was checked and resolves. Start with the exam guide, then work
outwards.

### The exam and the blueprint

| Resource | Why it is here |
| --- | --- |
| [MCN Exam Guide (Salesforce Help, article 005387657)](https://help.salesforce.com/s/articleView?id=005387657&language=en_US&type=1) | **The authoritative source.** Full objectives and section weights. If you read one thing, read this. |
| [MCN credential page (Trailhead)](https://trailhead.salesforce.com/credentials/marketingcloudnextconsultant) | What the credential covers and who it is for. |
| [MCN preparation trail (Trailhead)](https://trailhead.salesforce.com/content/learn/trails/prepare-for-your-marketing-cloud-next-consultant-certification) | ~17 hours of free guided study, mapped to the sections. The single best free study path. |
| [MCE Consultant credential page (Trailhead)](https://trailhead.salesforce.com/credentials/marketingcloudconsultant) | The Engagement track, and confirmation of its prerequisite. |
| [All marketing certifications (Trailhead)](https://trailhead.salesforce.com/credentials/marketingoverview) | Where this credential sits among the marketing family. |

### Platform documentation

| Resource | Why it is here |
| --- | --- |
| [Getting Started with MC Next Setup (Salesforce Help)](https://help.salesforce.com/s/articleView?id=mktg.mktg_admin_setup_overview.htm&language=en_US&type=5) | The setup order for a Marketing Cloud Next org. |
| [Configure Your Marketing Cloud Next Org (Developers)](https://developer.salesforce.com/docs/marketing/marketing-cloud-growth/guide/mc-administration.html) | Core Org Edition requirements, Data 360 provisioning, permission sets. Pairs with the setup doc above. |
| [Connect to the Data 360 Connect API (Developers)](https://developer.salesforce.com/docs/marketing/marketing-cloud-growth/guide/mc-connect-apis-data-cloud.html) | Managing segments and identity resolution rulesets programmatically. |
| [Salesforce Help](https://help.salesforce.com/s/) | The end-user and admin knowledge base. Search-first for setup and UI questions. |
| [Salesforce Developer Docs](https://developer.salesforce.com/docs) | Root of all API and developer documentation. |

### Data 360, identity and consent

| Resource | Why it is here |
| --- | --- |
| [Data 360 Architecture (Developers)](https://developer.salesforce.com/docs/data/data-cloud-dev/guide/dc-architecture.html) | The clearest single explanation of the Customer 360 data model, match rules and reconciliation rules. |
| [Data 360 Features Overview (Developers)](https://developer.salesforce.com/docs/data/data-cloud-dev/guide/dc-features-overview.html) | Feature-level detail, with Trailhead and Help links per feature. |
| [Data 360 on salesforce.com](https://www.salesforce.com/data/) | Product page. Useful for the consumption-based entitlement and pricing conversation. |

### Scripting and content

| Resource | Why it is here |
| --- | --- |
| [AMPscript overview (Developers)](https://developer.salesforce.com/docs/marketing/marketing-cloud-ampscript/overview) | Official landing page for the language. |
| [AMPscript function index (Developers)](https://developer.salesforce.com/docs/marketing/marketing-cloud-ampscript/references/mc-ampscript-references/mc-ampscript-references-index.html) | Every function, with a column showing whether it works in Engagement, in Next, or both. |
| [AMPscript Language Basics (Developers)](https://developer.salesforce.com/docs/marketing/marketing-cloud-ampscript/guide/mc-ampscript-guide-language-basics.html) | Syntax, variables, order of operations, if statements. |
| [AMPscript for Marketing Cloud](https://www.ampscript.com/) | Third-party guides and a large worked example library. Good for the functions docs skip. |

### Architecture and community

| Resource | Why it is here |
| --- | --- |
| [Salesforce Architects](https://architect.salesforce.com/) | Reference architectures and well-architected guidance. |
| [Trailblazer Community (Trailhead)](https://trailhead.salesforce.com/trailblazer-community) | Where practitioners answer each other's questions. Search it before you ask. |
| [Salesforce Blog](https://www.salesforce.com/blog/) | Product announcements and release notes. |

### Working through the scenarios

- `scripts/soql/` — query scenarios for segmentation and identity work.
- `scripts/apex/consent-sync-scenarios.apex` — anonymous Apex for consent
  propagation and opt-out behaviour.
- `force-app/main/default/classes/` — ten services, each with the scenario it
  answers written next to the decision.
- Guides 14 to 17 — eight mini projects and four end-to-end use cases with full
  solutions.

---

## Status and honest limitations

Read this section before you rely on anything above.

- **Nothing in `force-app/` has been deployed.** There is no connected org, so
  the Apex has never been compiled and the Apex tests have never been run. The
  metadata is written to be deployable, not proven to be. In particular the two
  LWC components call Apex methods that have never been compiled, so treat them
  as illustrations.
- **The docs are verified; the project is not.** Exam facts were checked against
  official Salesforce sources on 26 September 2026. The metadata was checked for
  XML validity only.
- **The blueprint is Marketing Cloud Next; much of the content is Engagement.**
  The six domains and their weights are the official *Marketing Cloud Next
  Consultant* sections, but a lot of the practical material — Data Extensions,
  Automation Studio, AMPscript, Email Studio, IP warming — is *Marketing Cloud
  Engagement*. Both credentials are covered, and the differences are called out
  where they matter, but if you are sitting MCN specifically, weight the Next
  material accordingly.
- **`npm test` covers the LWC only** and needs `node_modules`, which is not
  installed in this checkout. `npm install` first.
- **Progress is per browser.** `localStorage`, so no sync across devices.

Corrections are welcome. If you find a fact that is wrong or a link that is
dead, open an issue or send a pull request.

---

## Licence and trademarks

Educational material.

Salesforce, Marketing Cloud Engagement, Marketing Cloud Next, Data 360,
Data Cloud, Agentforce, AMPscript, SSJS, Trailhead and Marketing Cloud
Intelligence are trademarks of Salesforce, Inc. All other product and company
names may be trademarks of their respective owners.

This repository is not affiliated with, endorsed by, or sponsored by Salesforce,
Inc. Referenced trademarks are used nominatively to identify the products studied
here, subject to the
[Salesforce Trademark & Copyright Usage Guidelines](https://www.salesforce.com/company/legal/tmcusageguidelines).
