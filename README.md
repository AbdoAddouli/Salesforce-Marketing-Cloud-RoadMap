# Salesforce Marketing Cloud Consultant Roadmap

A 17-phase interactive academy for the Salesforce Marketing Cloud Consultant
track, plus a reference SFDX project that implements the logic the curriculum
keeps asking about.

The academy is plain HTML, CSS and JavaScript. No build step, no framework, no
dependencies. Open `docs/index.html` and it runs.

```
docs/            The interactive academy. Open index.html, or serve it.
docs/guide/      The same 17 guides as Markdown, for reading on GitHub.
docs/assets/     Application code: curriculum, model answers, exam facts, mock exam.
scripts/         Documentation validator plus SOQL and Apex practice scenarios.
force-app/       Reference SFDX project. See ARCHITECTURE.md.
manifest/        Deployment manifest for that project.
```

## The academy

Seventeen phases across six blueprint domains: platform setup and governance,
data modelling and identity resolution, campaign design, consent and compliance,
Agentforce and AI, and analytics.

Each phase has a guide, a worked walkthrough, and two guided exercises with
model answers. A sixty-question mock exam draws from the six domains in
blueprint proportion. Progress, theme and notes are kept in `localStorage`; no
data leaves the browser.

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

## Running it

```bash
# Interactive academy
npm run docs:serve          # http://localhost:8080

# Or open the file directly
start docs/index.html
```

`docs/assets/*.js` are plain scripts loaded with `<script>` tags. They also
export as CommonJS so the validator and any test runner can require them.

## Validating

```bash
npm run docs:validate
```

Checks that all 17 phases are present, both copies of every guide agree, all 36
exercise IDs have model answers, every guide link in the curriculum resolves,
and every metadata path the curriculum references exists in `force-app`.

Current state: **0 errors, 0 warnings**.

```bash
npm run docs:sync
```

Rebuilds guides 16 and 17, and the project block of guide 15, from
`docs/assets/curriculum.js` and `docs/assets/answers.js`. Those guides are
generated so the Markdown and the interactive academy cannot drift apart. The 24
exercise answers in guide 15 are hand-written and are not touched by this.

## The reference project

`ARCHITECTURE.md` explains the design. The short version: ten service classes
hold the logic the curriculum asks about, seven triggers delegate to one
handler, and eleven test classes protect ten invariants — the most important
being that a suppressed contact cannot be messaged, and that running a sync
twice does not create a second profile.

```bash
sf project deploy start --manifest manifest/package.xml
```

**Nothing in this repository has been deployed.** There is no connected org, so
the Apex has never been compiled and the tests have never been run. The
metadata is written to be deployable, not proven to be.

## Certification facts

`docs/assets/examfacts.js` and `Certification_Setting__mdt` hold the exam pass
marks, prerequisites and product lifecycle dates. Several of those values are
carried over from working notes and are **not yet confirmed against the current
official exam outline**. In the metadata, `Is_Verified__c` is `false` on every
exam record to make that visible rather than implicit.

Verify them before relying on them, in the org and in the docs, and change both.

## Licence

Educational material. Salesforce, Marketing Cloud Engagement, Data Cloud and
Agentforce are trademarks of Salesforce, Inc.
