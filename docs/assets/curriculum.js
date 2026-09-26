/* ============================================================================
 * Marketing Cloud Consultant Academy - Curriculum data
 * 17 phases following the `developer Marketing Cloud Consultant Roadmap/`
 * guides. Two tracks: the legacy Marketing Cloud Engagement (MCE) Consultant
 * exam and the new Marketing Cloud Next (MCN) Consultant exam.
 * ============================================================================
 *
 * UPDATE THE REPO SLUG BELOW if the project moves. It is the only hardcoded
 * GitHub path in the site (app.js derives everything else from it).
 */

const GUIDE = 'https://github.com/AbdoAddouli/Salesforce-Marketing-Cloud-RoadMap/blob/main/developer%20Marketing%20Cloud%20Consultant%20Roadmap/';

const ACADEMY = [

/* -------------------------------------------------------------------------- */
/* PHASE 1 - MARKETING CLOUD CONCEPTS, EDITIONS & ARCHITECTURE                 */
/* -------------------------------------------------------------------------- */
{
  id: 'arch',
  n: 1,
  title: 'MC Concepts, Editions & Architecture',
  icon: '01',
  color: '#4F46E5',
  tagline: 'Editions, BUs, licensing, and the shift to Data 360',
  guide: '01-Marketing-Cloud-Concepts-and-Architecture.md',
  art: [
    { label: 'MC_Config__mdt (BU + endpoint mapping)', href: 'force-app/main/default/customMetadata/MC_Config__mdt/' },
    { label: 'Certification_Setting__mdt (real exam facts)', href: 'force-app/main/default/customMetadata/Certification_Setting__mdt/' },
    { label: 'ARCHITECTURE.md (layered + data model)', href: 'ARCHITECTURE.md' },
  ],
  objectives: [
    'Place Marketing Cloud Growth, Advanced, Next and Engagement in the product map',
    'Explain the Core org edition requirement and Lightning Experience only constraint',
    'Explain Business Units, roles, and licenses vs features',
    'Contrast the shared-nothing Marketing Cloud Engagement data model with the Data 360-backed model',
    'Answer "which edition should this customer buy" as a consultant',
  ],
  lessons: [
    {
      title: 'The Product Map: Engagement vs Next', mins: 9,
      blocks: [
        { t: 'p', x: 'There are two live Marketing Cloud worlds in 2026 and confusing them is the single biggest risk on either exam. Marketing Cloud Engagement (MCE, formerly ExactTarget) is a separate platform you connect to Salesforce. Marketing Cloud Next (MCN) is built natively on Salesforce core and Data 360.' },
        { t: 'table', head: ['Aspect', 'Marketing Cloud Engagement', 'Marketing Cloud Next'], rows: [
          ['Architecture', 'Separate ExactTarget platform, connected', 'Native to Salesforce core + Data 360'],
          ['Data model', 'Data Extensions, batch sync', 'Data Model Objects, unified profiles'],
          ['Orchestration', 'Journey Builder', 'Flow engine / Campaign Flows'],
          ['CRM access', 'Synced via Marketing Cloud Connect', 'Direct, real-time, same org'],
          ['AI', 'Einstein (bolt-on)', 'Agentforce Marketing'],
          ['Licensing', 'Subscriber / feature based', 'Per org, consumption-based credits'],
          ['B2B and B2C', 'Separate from Account Engagement', 'One application for both'],
        ]},
        { t: 'callout', kind: 'warn', x: 'MCN is available in Growth and Advanced editions and REQUIRES Salesforce Enterprise or Unlimited. It is Lightning Experience only. If a customer is on Professional, MCN is simply not an option - say so early.' },
        { t: 'p', x: 'The middle rung people forget: Marketing Cloud Growth and Marketing Cloud Advanced used to be separate step-stone products. They are now the two editions of Marketing Cloud Next. Old blog posts recommending "start on Growth" are still directionally right, but the product name is Marketing Cloud Next.' },
        { t: 'selfcheck', q: 'A customer is on Salesforce Professional and wants Agentforce campaign creation. What do you say?', a: 'Marketing Cloud Next requires Enterprise or Unlimited, so it is not available to them today. You either upgrade the core edition or design on Marketing Cloud Engagement.' },
      ]
    },
    {
      title: 'Business Units, Roles & the Consultant Pitch', mins: 9,
      blocks: [
        { t: 'p', x: 'A Business Unit is a governance boundary: its own content, its own users and roles, its own data extensions and sending configuration. It is NOT a data silo you create for volume, and it is NOT one per Data Space.' },
        { t: 'table', head: ['Situation', 'Business Unit?', 'Why'], rows: [
          ['Two brands, separate look and feel', 'Yes', 'Content and user governance must be separated'],
          ['Two legal entities in one region', 'Yes', 'Regulatory and brand separation'],
          ['300k records in one DE', 'No', 'Volume is not a governance boundary - fix the DE design'],
          ['One Data Space per region', 'No', 'Data Spaces are a Data 360 concept, unrelated to BUs'],
          ['Agency running two clients', 'Yes', 'Isolation is the whole point'],
        ]},
        { t: 'h', x: 'Licenses vs features' },
        { t: 'list', items: [
          'A license is a commercial entitlement (per user, per org, per subscriber depending on the product)',
          'A feature is a capability you switch on inside a licensed product',
          'You cannot configure your way out of a missing license - this is the most common discovery-surprise',
          'In MCN the commercial unit is the org plus consumption credits, so "how many messages" becomes a design question',
        ]},
        { t: 'callout', kind: 'tip', x: 'Consultant habit: on every call, ask the core edition, the number of BUs, the monthly send volume per BU, and the number of distinct brands. Those four answers eliminate most of the wrong-architecture conversations.' },
        { t: 'selfcheck', q: 'A customer wants three BUs purely because they have 30 million records. What do you tell them?', a: 'That is not a valid reason. Volume is handled by data extension design, send log retention and query design. BUs add cost and operational overhead, so justify them on governance grounds or not at all.' },
        { t: 'ex', id: 'ex-01-1', stars: 2, title: 'Product and Edition Selection Matrix', obj: 'Make the edition call the way a consultant makes it - from the constraint, not the feature list.', verify: 'Six rows, one per scenario, each naming the product, the edition and the single blocking constraint.', steps: [
          { h: 'Scenarios', items: [
            'A B2B software firm on Sales Cloud Enterprise, 40k contacts, wants account-based nurture and 6 journeys, no AI requirement.',
            'The same firm 18 months later wants Agentforce campaign creation and WhatsApp for two markets.',
            'A retail chain on Professional with 1.2M loyalty members, email plus SMS, 2.5M emails a month.',
            'A D2C apparel brand on Unlimited that wants no Marketing Cloud at all - only abandoned-cart and post-purchase automation on its own storefront.',
            'A regulated bank on Enterprise, 300k customers, needs Agentforce on inbound SMS and WhatsApp with a hard consent gate.',
            'A media publisher that only needs to push subscriber counts into an external warehouse every night.',
          ]},
          { h: 'Deliver', items: [
            'For each scenario name the product: Marketing Cloud Engagement, Marketing Cloud Next (Growth or Advanced), Account Engagement, or none.',
            'Name the single constraint that decided it, in one sentence.',
            'For any scenario you decline, name the alternative you would propose and its cost implication.',
          ]},
        ]},
        { t: 'ex', id: 'ex-01-2', stars: 2, title: 'First-Workshop Discovery Set', obj: 'Ten questions that eliminate most wrong-architecture conversations before you configure anything.', verify: 'Ten questions, each annotated with the architectural decision it unblocks.', steps: [
          { h: 'Deliver', items: [
            'Write ten questions you would ask in the first workshop, in the order you would ask them.',
            'Annotate every question with the decision it unblocks - edition, Business Unit count, channel set, data architecture or timeline.',
            'Circle the two questions whose answers would most change your recommendation, and explain why those two.',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 1 Quiz - Concepts, Editions & Architecture', mins: 5,
    questions: [
      { q: 'Marketing Cloud Next requires which Salesforce core edition?',
        opts: ['Professional', 'Enterprise or Unlimited', 'Developer', 'Any edition with Growth'], a: 1, why: 'MCN is available in Growth and Advanced editions and requires Salesforce Enterprise or Unlimited.' },
      { q: 'Marketing Cloud Growth and Marketing Cloud Advanced are now.',
        opts: ['Two separate legacy products being retired', 'The two editions of Marketing Cloud Next', 'Account Engagement tiers', 'Data 360 editions'], a: 1, why: 'They were folded into Marketing Cloud Next as its Growth and Advanced editions.' },
      { q: 'Which is a valid reason to create a Business Unit?',
        opts: ['The account has more than 1M contacts', 'Two brands need separate content and user governance', 'There are more than three Data Spaces', 'The customer sends over 100k emails a month'], a: 1, why: 'BUs are governance boundaries. Volume and Data Spaces are unrelated to them.' },
      { q: 'How does Marketing Cloud Next reach CRM data compared to Marketing Cloud Engagement?',
        opts: ['Direct and real-time from the same org', 'Through a nightly FTP', 'Through Marketing Cloud Connect only', 'Through the SOAP API'], a: 0, why: 'MCN is native to Salesforce core, so CRM data is direct. MCE syncs through the connector or file transfers.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 2 - THE SUBSCRIBER & DATA EXTENSION MODEL                              */
/* -------------------------------------------------------------------------- */
{
  id: 'data',
  n: 2,
  title: 'The Subscriber & Data Extension Model',
  icon: '02',
  color: '#7C3AED',
  tagline: 'Contact Builder, DE types, Subscriber Key, Data Views',
  guide: '02-The-Subscriber-and-Data-Extension-Model.md',
  art: [
    { label: 'DataExtensionSyncService', href: 'force-app/main/default/classes/DataExtensionSyncService.cls' },
    { label: 'SubscriberMergeService', href: 'force-app/main/default/classes/SubscriberMergeService.cls' },
    { label: 'Data_Extension_Sync_Log__c object', href: 'force-app/main/default/objects/Data_Extension_Sync_Log__c/' },
  ],
  objectives: [
    'Choose the right Data Extension type for a requirement',
    'Explain Subscriber Key vs Contact Key and when each wins',
    'Model relationships between Data Extensions and when to denormalise',
    'Use Data Views for reporting instead of exporting to spreadsheets',
    'Design retention and send logging that will not kill you at volume',
  ],
  lessons: [
    {
      title: 'Data Extension Types & Keys', mins: 10,
      blocks: [
        { t: 'p', x: 'Marketing Cloud Engagement stores everything in Data Extensions (DEs). The type you pick dictates what the platform lets you do with it, so this is a design decision with a maintenance tail, not a dropdown.' },
        { t: 'table', head: ['DE type', 'Sendable', 'Primary key', 'Typical use'], rows: [
          ['Profile', 'No', 'Contact Key', 'One row per subscriber, source of truth for contact attributes'],
          ['Preference', 'No', 'Contact Key + preference field', 'Channel / topic level opt-out state'],
          ['Triggered', 'Yes', 'Contact Key + set id', 'Legacy triggered send audience - one DE per send definition'],
          ['Journey', 'Yes', 'Contact Key', 'Journey Builder entry (deprecated entry mode in modern releases)'],
          ['Send Log', 'Yes', 'Contact Key + unique per send', 'One DE per send, holds the delivered variant per subscriber'],
          ['Relational', 'No', 'Your own key', 'Normalised model with DE-to-DE relationships'],
        ]},
        { t: 'h', x: 'Subscriber Key vs Contact Key' },
        { t: 'list', items: [
          'Contact Key is a generated surrogate, unique inside one DE only',
          'Subscriber Key is a value YOU choose (often email or CRM ID) and it is the join key across the whole account',
          'A Data Extension with a Subscriber Key participates in the single global subscriber namespace',
          'Mixing Subscriber Keys across DEs is the #1 cause of "my data extension is not matching the contact"',
          'Data Views join on Subscriber Key - if your key is inconsistent, every report is wrong',
        ]},
        { t: 'code', lang: 'sql', x: `-- Data View: only exposes the Subscriber Key as the join column
SELECT  s.EmailAddress
     ,  s.SubscriberKey
     ,  LISTVIEW.Criteria
FROM   ent.<your-send-external-key>  s
JOIN   LISTVIEW  LISTVIEW
  ON   LISTVIEW.CustomerID = s.SubscriberKey
WHERE  s.BounceCategory = 'Hard Bounce'` },
        { t: 'callout', kind: 'warn', x: 'Never use email as a Subscriber Key if your customer can change email address. Use a stable CRM ID. You can always map to email for display.' },
        { t: 'selfcheck', q: 'A customer reports their journey is not entering contacts who are definitely in the entry DE. What is the first thing you check?', a: 'That the entry DE declares a Subscriber Key and that the value matches the Subscriber Key used in the journey entry definition.' },
      ]
    },
    {
      title: 'Retention, Send Logs & Data Views', mins: 9,
      blocks: [
        { t: 'p', x: 'Marketing Cloud Engagement charges for storage and every row you keep is a liability during a data subject request. Retention is a design parameter, and "we will clean it up later" is how projects fail their audit.' },
        { t: 'table', head: ['Data', 'Sane retention', 'Why'], rows: [
          ['Send Log', '90 days minimum, 13 months if you do attribution', 'Attribution and deliverability analysis need history'],
          ['Preference DE', 'Indefinite', 'It is the compliance record - deleting it is a GDPR failure'],
          ['Profile DE', 'Indefinite while the contact is active', 'Source of truth for contact attributes'],
          ['Import staging DE', '30 days', 'Debugging only, then it is dead weight'],
          ['Suppression list', 'Indefinite', 'Legal requirement - never auto-purge'],
        ]},
        { t: 'num', items: [
          'Prefer Data Views over a data extract for anything you will look at more than once.',
          'Use a data extract only for offline analysis, finance, or a file another system consumes.',
          'When you do extract, define the retention on the extract itself - a file on an FTP is unmanaged data.',
          'Model DE relationships only where you actually need referential behaviour; every relationship is a query cost.',
          'Denormalise the two or three fields you filter on constantly - the classic case is a consent flag on the send DE.',
        ]},
        { t: 'callout', kind: 'tip', x: 'The two-system rule: if the same attribute lives in both Salesforce and Marketing Cloud Engagement, decide explicitly which is the system of record and document it in the solution design. Ambiguity here is what causes "the value is different in the two systems" tickets.' },
        { t: 'selfcheck', q: 'Why is the Preference DE the one DE you never purge?', a: 'It is the evidence of what the customer agreed to. Deleting it destroys the compliance record and you can no longer prove the opt-out was honoured.' },
        { t: 'ex', id: 'ex-02-1', stars: 2, title: 'Design the Data Extension Model', obj: 'Produce the data layer before anybody clicks create.', verify: 'A DE table with name, purpose, type, primary key, Subscriber Key and retention - plus a one-line justification for each retention number.', steps: [
          { h: 'Scenario', items: [
            'An online retailer needs contact attributes, per-channel consent, a daily engagement segment, a per-send log and a cross-channel suppression list.',
            'Two systems both write contact attributes. Marketing Cloud is not the system of record for profile data.',
            'Consent is legally required to be provable for 3 years.',
          ]},
          { h: 'Deliver', items: [
            'Design the DEs: name, purpose, type, primary key, Subscriber Key or not, and send log yes or no.',
            'Decide normalised or denormalised for the attribute set, and justify the choice in two sentences.',
            'Set retention on every DE and justify each number. One of them must never expire - say which and why.',
          ]},
        ]},
        { t: 'ex', id: 'ex-02-2', stars: 2, title: 'Write the Bounce Triage Query', obj: 'Turn a send log into a delivery failure diagnosis.', verify: 'A SQL activity that segments hard, soft and block bounces, isolates the IPs responsible, and is safe to run twice.', code: { lang: 'sql', x: '-- Starter: the send log is your only evidence\nSELECT\n  s.SubscriberId,\n  s.EmailAddress,\n  s.BounceCategory,\n  COUNT(*) AS bounces\nFROM [\n  SELECT SubscriberId, EmailAddress, BounceCategory\n  FROM ent.<childsendlog>\n  WHERE BounceCategory IS NOT NULL\n] s\nGROUP BY s.SubscriberId, s.EmailAddress, s.BounceCategory' }, steps: [
          { h: 'Deliver', items: [
            'Complete the query so it returns one row per bounce category with the affected contact count.',
            'Add the logic that isolates which sending IP produced the hard bounces.',
            'State the target type of this activity and why overwrite is safer than append here.',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 2 Quiz - Subscriber & Data Extension Model', mins: 5,
    questions: [
      { q: 'Which Data Extension type is required for a triggered send audience?',
        opts: ['Relational', 'Triggered', 'Profile', 'Preference'], a: 1, why: 'Triggered send definitions require a sendable Triggered DE, keyed on Contact Key plus the send definition set id.' },
      { q: 'Data Views join on which column?',
        opts: ['ContactKey', 'SubscriberKey', 'Id', 'EmailAddress'], a: 1, why: 'The global subscriber namespace is keyed on Subscriber Key, which is why key hygiene decides whether your reports work.' },
      { q: 'Which DE must be kept indefinitely for compliance?',
        opts: ['Send Log', 'Profile', 'Preference', 'Import staging'], a: 2, why: 'The Preference DE is the record of consent and opt-out. Purging it destroys the compliance evidence.' },
      { q: 'What is the safest Subscriber Key when email addresses change?',
        opts: ['Email address', 'A stable CRM ID', 'A generated Contact Key', 'A random GUID per row'], a: 1, why: 'A CRM ID is stable. Email is mutable, a Contact Key is only unique within one DE, and a per-row GUID defeats the join.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 3 - DATA 360, IDENTITY RESOLUTION & SEGMENTATION                       */
/* -------------------------------------------------------------------------- */
{
  id: 'data360',
  n: 3,
  title: 'Data 360, Identity Resolution & Segmentation',
  icon: '03',
  color: '#0EA5E9',
  tagline: 'Data Spaces, match rules, Actionable Lists, entitlements',
  guide: '03-Data-360-Identity-Resolution-and-Segmentation.md',
  art: [
    { label: 'LeadRoutingForCampaignsService', href: 'force-app/main/default/classes/LeadRoutingForCampaignsService.cls' },
    { label: 'CampaignMemberSyncService', href: 'force-app/main/default/classes/CampaignMemberSyncService.cls' },
    { label: 'scripts/soql (segmentation scenarios)', href: 'scripts/soql/' },
  ],
  objectives: [
    'Explain Data 360 data objects, Data Spaces and the unified profile',
    'Configure identity resolution with match rules and reconciliation rules',
    'Use Actionable Lists and segments for activation',
    'Reason about consumption-based entitlements and flow design cost',
    'Know when to say "this belongs in your Data 360 roadmap, not here"',
  ],
  lessons: [
    {
      title: 'Data 360 Concepts That Actually Get Tested', mins: 10,
      blocks: [
        { t: 'p', x: 'Data 360 (formerly Data Cloud) is the unification layer. MCN leans on it so hard that Data Modeling, Identity Resolution & Segmentation is 25% of the new exam - the joint second heaviest domain.' },
        { t: 'table', head: ['Concept', 'What it is', 'Consultant use'], rows: [
          ['Data Space', 'A governed container for related data', 'Separate PII, separate business unit, separate access'],
          ['Data Model Object (DMO)', 'The unified profile shape for a person/account', 'The thing you segment and personalize against'],
          ['Data Stream', 'A real-time or batch source feeding a DMO', 'CRM, commerce, product, file'],
          ['Match rule', 'Rules for linking records into one profile', 'Lead + Contact + commerce buyer = one person'],
          ['Reconciliation rule', 'Decides the surviving value on conflict', 'Which email wins when two sources disagree'],
          ['Actionable List', 'A governed, reusable audience for activation', 'The MCN replacement for a send DE'],
        ]},
        { t: 'h', x: 'Match rules vs reconciliation rules' },
        { t: 'p', x: 'This distinction is the most commonly confused pair in Data 360 and it is worth memorising cold. Match rules answer "are these the same person?". Reconciliation rules answer "these are the same person - which value do I keep?". You cannot reconcile without a match first.' },
        { t: 'callout', kind: 'tip', x: 'Rule of thumb for a discovery call: match on the weakest identifier that is still stable (CRM ID, hashed email), reconcile on the field the business argues about most (email, phone, name).' },
        { t: 'selfcheck', q: 'Two sources match on hashed email but disagree on phone number. Which rule set resolves it?', a: 'Match rule links them, then the reconciliation rule decides the surviving phone value. Reversing the order is impossible.' },
      ]
    },
    {
      title: 'Segmentation, Activation & Consumption', mins: 9,
      blocks: [
        { t: 'p', x: 'Segment in Data 360, activate into Marketing Cloud Next through an Actionable List, and let a flow do the orchestration. The classic MCE pattern of "SQL activity writes a DE, journey reads the DE" is the thing you are moving away from.' },
        { t: 'num', items: [
          'Define the DMO and the match rules before you define the segment. A segment on a badly unified profile is confidently wrong.',
          'Build the segment as a reusable rule set, not a one-off query, so governance and reuse both work.',
          'Publish it to an Actionable List and point the campaign or flow at that list.',
          'Check the consumption estimate before you go live. Every additional flow evaluation and every extra unified-profile read is billable.',
          'Instrument the segment: a segment nobody reviews is a segment that quietly goes stale.',
        ]},
        { t: 'table', head: ['Design choice', 'Consumption effect', 'Consultant lever'], rows: [
          ['Flow re-evaluates per contact', 'Scales with audience size', 'Batch where the use case allows'],
          ['Extra DMO mapped into content', 'More profile reads per send', 'Map only the fields the content uses'],
          ['Real-time stream vs batch', 'Real-time costs more', 'Batch for backfill, real-time for triggers'],
          ['Multiple overlapping segments', 'Duplicate evaluation cost', 'Consolidate into one scored audience'],
        ]},
        { t: 'callout', kind: 'warn', x: 'There is a companion Data 360 Consultant roadmap in this workspace. Do not re-teach Data Cloud depth here - link to it and spend this phase on how Marketing Cloud consumes it.' },
        { t: 'selfcheck', q: 'A customer wants a daily batch of 2M records scored. What is the first cost question?', a: 'Whether the flow can be batched rather than re-evaluated per contact, and how many DMOs the content pulls in. Both are direct consumption drivers.' },
        { t: 'ex', id: 'ex-03-1', stars: 3, title: 'Unified Profile Field Map', obj: 'Turn scattered source fields into one profile, and separate matching from reconciliation.', verify: 'A field-level map from source to DMO to match rule to reconciliation rule to where the value is used in content.', steps: [
          { h: 'Scenario', items: [
            'The same person exists as a Lead (email + work phone), a Contact (email + mobile) and a commerce buyer (hashed email + landline).',
            'The work phone is stale on the Lead. The commerce email is hashed so it cannot be matched on value.',
          ]},
          { h: 'Deliver', items: [
            'List the match rules in evaluation order, and say which source is authoritative for each identifier.',
            'List the reconciliation rules field by field, including how the hashed email is handled.',
            'State what the unified profile looks like afterwards, and what it deliberately does not contain.',
          ]},
        ]},
        { t: 'ex', id: 'ex-03-2', stars: 3, title: 'Consumption Review', obj: 'Find the design decisions that are quietly billing the customer.', verify: 'A table of the four biggest consumption drivers, the flow design change for each, and the expected direction of impact.', steps: [
          { h: 'Scenario', items: [
            'A customer sends 5M messages a month and their Data 360 consumption tripled since the last renewal, with no growth in audience size.',
            'The account runs one record-triggered flow per campaign, so a 12-touch onboarding program evaluates every contact through 12 separate flows.',
          ]},
          { h: 'Deliver', items: [
            'Name the four design decisions most likely responsible, in order of impact.',
            'For each, state the change you would make and why it reduces consumption rather than moving the cost somewhere else.',
            'Name the metric you would watch for 30 days to prove the fix worked.',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 3 Quiz - Data 360 & Segmentation', mins: 5,
    questions: [
      { q: 'What does an Actionable List represent in Data 360 / MCN?',
        opts: ['A Data Extension send log', 'A governed reusable audience used for activation', 'An IP pool', 'A Data View query'], a: 1, why: 'Actionable Lists are the MCN activation surface - governed audiences built from Data 360 segments.' },
      { q: 'Reconciliation rules require what to have run first?',
        opts: ['An IP warm-up', 'A match rule', 'A consent banner', 'A Business Unit'], a: 1, why: 'Reconciliation decides the surviving value for records that a match rule has already linked.' },
      { q: 'Data 360 is the former name of what?',
        opts: ['Data Cloud', 'Data Governance', 'Data Extensions', 'Data Journey'], a: 0, why: 'Data Cloud was renamed Data 360. The exam objectives already use Data 360.' },
      { q: 'Which is a consumption lever a consultant controls?',
        opts: ['Adding more DMOs to the content mapping', 'Batching flows and trimming mapped fields', 'Adding more Business Units', 'Turning off consent'], a: 1, why: 'Batch where possible and map only the fields the content uses. The others either add cost or break compliance.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 4 - DELIVERABILITY, DOMAIN REPUTATION & IP WARMING                     */
/* -------------------------------------------------------------------------- */
{
  id: 'deliver',
  n: 4,
  title: 'Deliverability, Domain Reputation & IP Warming',
  icon: '04',
  color: '#059669',
  tagline: 'SPF/DKIM/DMARC, IP warming, sender reputation',
  guide: '04-Deliverability-Domain-Reputation-and-IP-Warming.md',
  art: [
    { label: 'EmailPreferenceService', href: 'force-app/main/default/classes/EmailPreferenceService.cls' },
    { label: 'Marketing_Interaction__c (interaction log)', href: 'force-app/main/default/objects/Marketing_Interaction__c/' },
    { label: 'Deliverability runbook (guide 04)', href: 'developer%20Marketing%20Cloud%20Consultant%20Roadmap/04-Deliverability-Domain-Reputation-and-IP-Warming.md' },
  ],
  objectives: [
    'Read and fix SPF, DKIM and DMARC for a sending domain',
    'Explain IP warming and recommend a ramp from a customer need',
    'Choose shared vs dedicated IP, and subdomain strategy',
    'Diagnose deliverability using bounce, complaint and engagement data',
    'Apply the MCN self-service domain authentication objective',
  ],
  lessons: [
    {
      title: 'Authentication, IPs and Warming', mins: 10,
      blocks: [
        { t: 'p', x: 'Deliverability is where most Marketing Cloud projects quietly fail: the campaign is fine, the data is fine, and 40% of it lands in spam. It is also an explicit objective on both exams - IP warming on MCE, self-service domain authentication on MCN.' },
        { t: 'table', head: ['Record', 'Purpose', 'Consultant failure mode'], rows: [
          ['SPF', 'Authorise the sending IPs for the domain', 'More than 10 DNS lookups, or left at default include chains'],
          ['DKIM', 'Cryptographically sign the message so it survives forwarding', 'Not aligned with the From domain after a subdomain change'],
          ['DMARC', 'Tell receivers what to do when SPF and DKIM fail', 'Published with p=none forever and never moved to p=quarantine/reject'],
        ]},
        { t: 'h', x: 'IP warming' },
        { t: 'p', x: 'A new IP has no reputation. Warming is the deliberate, gradual increase of volume on that IP so receivers learn to trust it. Skipping it is the cause of most "our first campaign bounced hard" incidents.' },
        { t: 'table', head: ['Day', 'Volume', 'Rule'], rows: [
          ['1', '50', 'Send to your most engaged contacts first'],
          ['2-3', '200 - 1,000', 'Ramp, do not double overnight'],
          ['4-7', '5,000 - 20,000', 'Send progressively colder segments'],
          ['Week 2+', '50,000+', 'Normal steady-state volume'],
        ]},
        { t: 'callout', kind: 'warn', x: 'A dedicated IP only makes sense above roughly 50k messages a month and with consistent volume. Below that, shared IP pool infrastructure is better - a dedicated IP with low volume has worse reputation than the shared pool.' },
        { t: 'selfcheck', q: 'A customer wants a dedicated IP for 8,000 emails a month. What do you recommend and why?', a: 'Stay on the shared pool. 8k a month is too low and too inconsistent to build IP reputation, so a dedicated IP would be worse than shared infrastructure.' },
      ]
    },
    {
      title: 'Diagnosing a Deliverability Problem', mins: 9,
      blocks: [
        { t: 'num', items: [
          'Segment by bounce category. Hard bounces, soft bounces and blocks tell you different things.',
          'Check complaint rate against the industry benchmark - above 0.1% you have a content or list-hygiene problem, not an infrastructure one.',
          'Compare engagement by IP pool. One bad IP is an infrastructure problem; everything bad at once is a reputation or content problem.',
          'Look at the seed list and the inbox placement report before touching anything else.',
          'Check the unsubscribe rate on the specific campaign - a spike means you bought or scraped a list.',
        ]},
        { t: 'code', lang: 'sql', x: `-- Deliverability triage: hard bounces + complaints by IP pool
SELECT  IPAddress
     ,  COUNT(*)                                                   AS Sent
     ,  SUM(CASE WHEN BounceCategory = 'Hard Bounce' THEN 1 ELSE 0 END) AS HardBounces
     ,  SUM(CASE WHEN Complaint = 'true'            THEN 1 ELSE 0 END) AS Complaints
     ,  ROUND(100.0 * SUM(CASE WHEN Complaint = 'true' THEN 1 ELSE 0 END)
             / COUNT(*), 3)                                          AS ComplaintPct
FROM   ent.<journey-or-send-external-key>
WHERE  EventDate >= DATEADD(day, -30, GETDATE())
GROUP  BY IPAddress
HAVING SUM(CASE WHEN BounceCategory = 'Hard Bounce' THEN 1 ELSE 0 END) > 0
ORDER  BY HardBounces DESC` },
        { t: 'table', head: ['Symptom', 'Most likely cause', 'First fix'], rows: [
          ['Hard bounce spike on one IP', 'List quality or a bad import', 'Pause the IP, validate the source list'],
          ['Complaints across all IPs', 'Content or bad targeting', 'Review consent and content, not infrastructure'],
          ['Opens collapse, clicks stable', 'Apple Mail Privacy Protection', 'Stop using open rate as the primary KPI'],
          ['Everything degrades after a volume spike', 'Unwarmed new IP', 'Stop the ramp, restart the warming schedule'],
        ]},
        { t: 'callout', kind: 'tip', x: 'The Gmail and Yahoo bulk-sender rules made authentication and complaint rate non-optional. Any 2024+ study material that does not cover this is out of date.' },
        { t: 'selfcheck', q: 'Opens dropped 40% overnight but clicks held steady. What is the most likely explanation?', a: 'Apple Mail Privacy Protection is pre-opening images, so opens are no longer a reliable signal. Click and conversion rate are the metrics to trust.' },
        { t: 'ex', id: 'ex-04-1', stars: 2, title: 'Authenticate the Sending Subdomain', obj: 'Produce the DNS record set you would hand to the customer domain team.', verify: 'SPF, DKIM and DMARC records for one subdomain, each with a one-line explanation of its job.', code: { lang: 'text', x: 'Subdomain: mail.marketing.customer.com\n\n# SPF - authorise exactly the sending infrastructure\nTXT @  \"v=spf1 include:_spf.salesforce.com include:spf.mta.customer.com ~all\"\n\n# DKIM - CNAME the selector (preferred over a TXT record)\nCNAME  selector1._domainkey  dkim1.customer.com\nCNAME  selector2._domainkey  dkim2.customer.com\n\n# DMARC - start reporting only\nTXT _dmarc  \"v=DMARC1; p=none; rua=mailto:dmarc@customer.com; pct=100"' }, steps: [
          { h: 'Deliver', items: [
            'Write the three record types for the subdomain above.',
            'Say what each record does in one sentence, in language a domain administrator understands.',
            'State the DMARC policy you would start with, the one you would end at, and the signal that tells you it is safe to move.',
          ]},
        ]},
        { t: 'ex', id: 'ex-04-2', stars: 3, title: 'Diagnose the Delivery Collapse', obj: 'Pick the right failure mode instead of reaching for the usual suspect.', verify: 'For each of the four scenarios: the failure mode, the evidence in the send log that proves it, and the first fix.', steps: [
          { h: 'Scenarios', items: [
            'Hard bounces jumped from 0.4% to 7% on one IP only, immediately after a list import.',
            'Deliverability collapsed across all IPs after a DNS change, and nothing else changed.',
            'Complaint rate rose from 0.05% to 0.4% on a segment that had bought in the last 30 days.',
            'A single mailbox provider started blocking at 9% while the other two were flat.',
          ]},
          { h: 'Deliver', items: [
            'Name the failure mode for each - list hygiene, authentication, content and targeting, or sender reputation.',
            'Name the specific send log or reporting evidence that confirms it.',
            'Give the first fix and the guard rail that stops it recurring.',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 4 Quiz - Deliverability & IP Warming', mins: 5,
    questions: [
      { q: 'Below roughly what monthly volume does a dedicated IP stop making sense?',
        opts: ['1,000', '10,000', '50,000', '500,000'], a: 2, why: 'Below about 50k a month the volume is too low and too inconsistent to build IP reputation.' },
      { q: 'What is the purpose of an IP warm-up?',
        opts: ['Increase throughput limits', 'Build sender reputation gradually so receivers learn to trust the IP', 'Reduce bounce processing time', 'Encrypt the mail stream'], a: 1, why: 'Warming is a gradual, deliberate volume ramp on a new IP to establish reputation.' },
      { q: 'Which record tells receivers what to do when SPF and DKIM both fail?',
        opts: ['SPF', 'DKIM', 'DMARC', 'MX'], a: 2, why: 'DMARC publishes the policy for authentication failures. SPF authorises IPs, DKIM signs the message.' },
      { q: 'Opens dropped but clicks held. What is the standard explanation?',
        opts: ['The list went cold', 'Apple Mail Privacy Protection pre-fetching images', 'A DKIM failure', 'The IP pool rotated'], a: 1, why: 'Privacy Protection pre-loads tracking pixels, so open rate is no longer a trustworthy signal.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 5 - CONTENT BUILDING & PERSONALIZATION                                 */
/* -------------------------------------------------------------------------- */
{
  id: 'content',
  n: 5,
  title: 'Content Building & Personalization',
  icon: '05',
  color: '#D97706',
  tagline: 'Content Builder, AMPscript, SSJS, Handlebars, CloudPages',
  guide: '05-Content-Building-and-Personalization.md',
  art: [
    { label: 'AgentforceMarketingActionService', href: 'force-app/main/default/classes/AgentforceMarketingActionService.cls' },
    { label: 'ContentBuilderMarketingCloud (content folder)', href: 'force-app/main/default/contentassets/' },
    { label: 'Email templates (email/)', href: 'force-app/main/default/email/' },
  ],
  objectives: [
    'Build a modular email in Content Builder with correct fallback behaviour',
    'Write AMPscript for personalization, lookup and conditional content',
    'Use SSJS where AMPscript cannot reach',
    'Explain Handlebars as the MCN-native personalization syntax',
    'Configure CloudPages and Marketing Cloud Personalization',
  ],
  lessons: [
    {
      title: 'Content Builder, AMPscript & Fallbacks', mins: 10,
      blocks: [
        { t: 'p', x: 'A consultant email is a system, not a design. The platform-specific trap is the fallback: if a merge field has no value, many implementations render the literal field name in the email. Always configure the default.' },
        { t: 'code', lang: 'ampscript', x: `%%[ SET @firstName = AttributeValue("FirstName")
     IF EMPTY(@firstName) THEN
          SET @firstName = "there"
     ENDIF ]%%

%%[ IF RequestMobileContent THEN
        SET @img = "https://cdn.example.com/mobile-hero.jpg"
     ELSE
        SET @img = "https://cdn.example.com/desktop-hero.jpg"
     ENDIF ]%%

<h1>Hello, %%=v(@firstName)=%%</h1>
<img src="%%=v(@img)=%%" alt="Hero" width="600" />

%%[ IF NOT EMPTY(@voucherCode) THEN
        <p>Your code: <b>%%=v(@voucherCode)=%%</p>
     ELSE
        <p><img src="https://cdn.example.com/no-code.jpg" alt="Offer" /></p>
     ENDIF ]%%

<a href="%%=CloudPagesURL(2324, 'offers', 'spring')=%%">See the offer</a>
<a href="%%=Unsubscribe(%%)>Unsubscribe</a>` },
        { t: 'callout', kind: 'warn', x: 'Never hand-write the unsubscribe link. Use the Unsubscribe() function or a Content Builder merge field of type unsubscribe. Hand-rolled links fail CAN-SPAM and deliverability review.' },
        { t: 'h', x: 'The three personalization syntaxes' },
        { t: 'table', head: ['Syntax', 'Where it runs', 'Use it for'], rows: [
          ['AMPscript', 'Both sides - SSJS and MTA', 'The default. Personalization, lookups, logic, loops'],
          ['SSJS', 'Marketing Cloud only, never at send time', 'JSON parsing, HTTP calls, file work'],
          ['Handlebars', 'Marketing Cloud Next', 'The MCN-native templating syntax'],
        ]},
        { t: 'p', x: 'AMPscript runs in two places: on the server side at send time (what the subscriber sees) and inside SSJS at build time. Anything that touches a secret or a third-party API belongs in SSJS, never in the send-time path.' },
        { t: 'selfcheck', q: 'A merge field for "Preferred Store" renders as "%% Preferred_Store__c %%" for 8% of recipients. What is wrong?', a: 'No fallback was configured. Set the default value on the merge field so it renders your fallback instead of the field token.' },
      ]
    },
    {
      title: 'Handlebars, CloudPages & Personalization', mins: 9,
      blocks: [
        { t: 'p', x: 'Marketing Cloud Next uses Handlebars for content personalization. If you can write MCE AMPscript, Handlebars is a small lift, and it is 30% of the exam domain that contains content.' },
        { t: 'code', lang: 'handlebars', x: `{{!-- MCN content personalization with Handlebars --}}
<h1>Hello {{#if firstName}}{{firstName}}{{else}}there{{/if}}</h1>

{{#if cartAbandoned}}
  <p>You left {{cartItemCount}} item(s) behind.</p>
  <a href="{{checkoutUrl}}">Finish your order</a>
{{else}}
  <img src="{{heroImage}}" alt="New in" />
{{/if}}

{{#each recommendations}}
  <div class="rec">
    <img src="{{this.imageUrl}}" alt="{{this.name}}" />
    <b>{{this.name}}</b> &mdash; {{this.price}}
  </div>
{{/each}}` },
        { t: 'list', items: [
          'CloudPages is the landing-page and content surface (Web Studio in the UI). Default page content plus a content block layout.',
          'CloudPagesRetrieve() and CloudPagesURL() are how you build deep links with campaign tracking attached.',
          'Marketing Cloud Personalization (formerly Interaction Studio) delivers real-time 1:1 recommendations across web, app and email.',
          'Web and App Collect capture events and pass them to Personalization and Data 360 in real time.',
          'Personalization consumes Data 360. If your unified profile is weak, recommendations will be confidently irrelevant.',
        ]},
        { t: 'callout', kind: 'tip', x: 'Content Builder modularisation is a governance decision as much as a design one: shared content blocks let you fix a footer across every email at once, which is exactly what Enhanced CMS Workspaces formalises on MCN.' },
        { t: 'selfcheck', q: 'A customer wants one hero image for mobile and another for desktop. Which mechanism?', a: 'A conditional content block keyed on RequestMobileContent in AMPscript, or a content variation in MCN. Never a single image stretched - it destroys text-to-image ratio in Gmail.' },
        { t: 'ex', id: 'ex-05-1', stars: 2, title: 'Write the Defensive Personalisation Block', obj: 'Personalisation that never renders a broken merge tag to a paying customer.', verify: 'An AMPscript block with a fallback on every field, and a one-line note on what happens when the fallback fires.', code: { lang: 'ampscript', x: '%%[ SET @greeting = "" ]%%\n%%[ IF NOT EMPTY(@firstName) THEN\n     SET @greeting = CONCAT("Hi ", @firstName, ",")\n   ELSE\n     SET @greeting = "Hi there,"\n   END IF ]%%\n%%[ SET @store = "" ]%%\n%%[ IF NOT EMPTY(@preferredStore) THEN\n     SET @store = CONCAT(" Your ", @preferredStore, " store has new arrivals.")\n   END IF ]%%\n%%=v(@greeting)%%=v(@store)%%\n\n<a href="%%=v(@unsubscribeUrl)%%">Unsubscribe</a>' }, steps: [
          { h: 'Deliver', items: [
            'Write the personalised greeting with a fallback, and say what the recipient sees when the fallback fires.',
            'Write the conditional store line so an empty attribute produces no orphaned words.',
            'Explain why you would not rely on a merge field for the greeting, even though it is shorter.',
          ]},
        ]},
        { t: 'ex', id: 'ex-05-2', stars: 3, title: 'Rebuild It in Handlebars', obj: 'Prove you know the MCN syntax rather than the MCE one.', verify: 'The same three lines in Handlebars, plus the three things that would break the AMPscript version if you pasted it into MCN.', code: { lang: 'handlebars', x: '{{#if firstName}}Hi {{firstName}},{{else}}Hi there,{{/if}}\n{{#if preferredStore}} Your {{preferredStore}} store has new arrivals.{{/if}}\n\n<a href="{{unsubscribeUrl}}">Unsubscribe</a>' }, steps: [
          { h: 'Deliver', items: [
            'Write the equivalent Handlebars for the greeting, the conditional line and the unsubscribe link.',
            'List the three things in the AMPscript version that do not work in MCN, and say what replaces each.',
            'State where the fallback data comes from, and what happens to a contact with no profile row at all.',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 5 Quiz - Content & Personalization', mins: 5,
    questions: [
      { q: 'Which is the MCN-native personalization syntax?',
        opts: ['AMPscript', 'SSJS', 'Handlebars', 'Merge fields only'], a: 2, why: 'Handlebars is the Marketing Cloud Next templating syntax. AMPscript and merge fields remain available for compatibility.' },
      { q: 'Where must the unsubscribe link come from?',
        opts: ['A hand-written link', 'The Unsubscribe() function or an unsubscribe merge field', 'A CloudPage redirect', 'A Data View query'], a: 1, why: 'Hand-rolled unsubscribe links fail compliance review and damage deliverability.' },
      { q: 'What causes a merge field to render its own field name in the email?',
        opts: ['A missing fallback value', 'A DMARC failure', 'An un-warmed IP', 'A missing Data Space'], a: 0, why: 'Without a configured default, the platform has nothing to render and shows the token.' },
      { q: 'Marketing Cloud Personalization was formerly called what?',
        opts: ['Audience Studio', 'Interaction Studio', 'Datorama', 'Mobile Studio'], a: 1, why: 'Interaction Studio was renamed Marketing Cloud Personalization. Audience Studio was retired in 2024.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 6 - JOURNEY BUILDER & FLOW ORCHESTRATION                                */
/* -------------------------------------------------------------------------- */
{
  id: 'journey',
  n: 6,
  title: 'Journey Builder & Flow Orchestration',
  icon: '06',
  color: '#DC2626',
  tagline: 'Journey canvas, Campaign Flows, splits, waits',
  guide: '06-Journey-Builder-and-Flow-Orchestration.md',
  art: [
    { label: 'JourneyEntryEventService', href: 'force-app/main/default/classes/JourneyEntryEventService.cls' },
    { label: 'Journey_Entry_Log__c object', href: 'force-app/main/default/objects/Journey_Entry_Log__c/' },
    { label: 'Flow: Journey exit sync back to Salesforce', href: 'force-app/main/default/flows/' },
  ],
  objectives: [
    'Design a journey with the right entry source and re-entry rules',
    'Use decision splits, engagement splits and wait activities correctly',
    'Explain the Flow-based campaign orchestration used in Marketing Cloud Next',
    'Reason about journey versioning, stopping rules and exit criteria',
    'Answer "journey or automation" as a consultant',
  ],
  lessons: [
    {
      title: 'Journey Canvas Mechanics', mins: 10,
      blocks: [
        { t: 'p', x: 'A journey is a stateful, per-subscriber program. That single word - stateful - explains almost every design question: what happens if they re-enter, what happens if they convert mid-journey, what happens when you edit a live journey.' },
        { t: 'table', head: ['Element', 'What it does', 'Trap'], rows: [
          ['Entry source', 'Who is eligible - DE, query, audience', 'A DE entry snapshot re-evaluates; a query entry does not'],
          ['Re-entry rules', 'Allow all / once per journey / once ever', 'Default of "allow all" creates send storms'],
          ['Decision split', 'Branch on a data value or engagement', 'Percentage splits are random - never use for priority'],
          ['Wait', 'Hold for time, date, or until a condition', 'A wait on a date that never arrives strands the contact'],
          ['Exit / goal', 'Remove the contact and stop evaluating', 'No exit rule means contacts sit in the journey forever'],
        ]},
        { t: 'code', lang: 'ampscript', x: `%%[ SET @cartValue = AttributeValue("CartValue")
     SET @vip = AttributeValue("VIP_Flag")
     SET @tier = AttributeValue("Loyalty_Tier") ]%%

%%[ IF @tier == "Platinum" OR @vip == "true" THEN ]%%
  VIP  path: concierge treatment, no discount
%%[ ELSEIF @cartValue > 500 THEN ]%%
  High-value path: free shipping incentive
%%[ ELSE ]%%
  Standard path: 10%% offer
%%[ ENDIF ]%%

%%[ IF @cartValue == 0 THEN ]%%
  <p>Your cart is empty - here is what you might like.</p>
%%[ ELSE ]%%
  <p>You have %%=v(@cartValue)=%% in your cart. Complete checkout here.</p>
%%[ ENDIF ]%%` },
        { t: 'callout', kind: 'warn', x: 'Editing a live journey creates a new version. Contacts already in the old version finish the old version. Plan content changes as a versioning exercise, not a live edit.' },
        { t: 'selfcheck', q: 'A customer wants contacts to receive the welcome series once per year, re-entering allowed after 12 months. Which entry design?', a: 'A DE or audience entry with a re-entry rule of "allow re-entry" plus a suppression or exit rule that removes the contact for 12 months after completing the journey.' },
      ]
    },
    {
      title: 'Flow-Based Orchestration & Journey vs Automation', mins: 9,
      blocks: [
        { t: 'p', x: 'Marketing Cloud Next replaces the Journey canvas with Flow. Same mental model - a per-contact program with entry, logic, activities and exits - but the engine is the Salesforce Flow engine and the entry is a Data 360 contact point or Actionable List.' },
        { t: 'table', head: ['Decision', 'Journey / Flow', 'Automation Studio'], rows: [
          ['Nature', 'Per-contact, long-running, stateful', 'Per-run, batch or event-driven'],
          ['Duration', 'Days to months', 'Minutes to hours'],
          ['Entry', 'Audience, event, contact point', 'Schedule or trigger'],
          ['Typical use', 'Lifecycle and nurture programs', 'Data movement, extracts, integrations, scoring'],
          ['Classic example', 'Welcome series, abandonment, win-back', 'Nightly SQL, FTP transfer, triggered sends'],
        ]},
        { t: 'num', items: [
          'If it takes more than a few hours and needs per-contact branching, it is a journey or a marketing flow.',
          'If it moves data or talks to a system on a schedule, it is an automation.',
          'If both are true, split them: the automation prepares the audience, the flow talks to the person.',
          'On MCN, remember every flow evaluation costs Data 360 consumption - batch where the use case allows.',
          'Design the exit path first. Most journey failures are contacts who never leave.',
        ]},
        { t: 'callout', kind: 'tip', x: 'On the MCN exam, "identify the appropriate flow type, trigger conditions and configuration" is worth real marks. Learn record-triggered, scheduled and autolaunched flows and know when each is the wrong answer.' },
        { t: 'selfcheck', q: 'Nightly SQL that scores a DE and then a triggered send fires. Journey or automation?', a: 'Automation - both halves. The scoring is a scheduled SQL activity and the send is a triggered send activity. Neither is a per-contact lifecycle program.' },
        { t: 'ex', id: 'ex-06-1', stars: 2, title: 'Pick the Orchestration', obj: 'Choose the mechanism from the behaviour required, not from the tool you like.', verify: 'Six rows: mechanism, one-line reason, and the nearest wrong answer with why it fails.', steps: [
          { h: 'Scenarios', items: [
            'Welcome series of 5 emails over 14 days, then stop when the customer places an order.',
            'Every night at 02:00, score 2M records and email the top 10% by score.',
            'A cart is abandoned, and 4 hours later an SMS goes out only if the cart is still abandoned.',
            'Monthly newsletter to 800k subscribers, built once, sent once.',
            'On lead form submit, the lead is scored, routed to a rep and dropped into a nurture.',
            'A 12-month reactivation program that must suppress anyone who bought in the last 90 days.',
          ]},
          { h: 'Deliver', items: [
            'For each, name the mechanism: Journey, automation, triggered send, flow or campaign.',
            'One line on why - key it to real-time vs batch, per-contact vs batch, and whether it needs personalisation.',
            'Name the nearest wrong answer and the sentence that would have misled the client.',
          ]},
        ]},
        { t: 'ex', id: 'ex-06-2', stars: 3, title: 'Design the Exits', obj: 'Design the part of the journey that everyone forgets and everybody pays for.', verify: 'A rule table for conversion exit, re-entry, frequency cap and global suppression, each with its trigger and its owner system.', steps: [
          { h: 'Scenario', items: ['Cart abandonment, 30-day window, three value tiers, a conversion exit and a 90-day re-entry cooldown.'] },
          { h: 'Deliver', items: [
            'Define the entry source, the entry rule and the de-duplication rule.',
            'Define the conversion exit: which event, how fast, and what happens to the remaining paths.',
            'Define re-entry, the cooldown, and the cross-channel suppression that stops email and SMS both chasing the same basket.',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 6 Quiz - Journeys & Flows', mins: 5,
    questions: [
      { q: 'Which orchestration pattern replaces the MCE Journey canvas in MCN?',
        opts: ['Automation Studio', 'Flow engine with Campaign Flows', 'Data Extract', 'An IP pool'], a: 1, why: 'MCN uses the Salesforce Flow engine for campaign orchestration, entered from a Data 360 contact point or Actionable List.' },
      { q: 'You need a nightly SQL score followed by an immediate send. What is it?',
        opts: ['A journey', 'An automation', 'A Data Space', 'A Business Unit'], a: 1, why: 'Scheduled data movement plus an immediate triggered send is Automation Studio territory.' },
      { q: 'What is wrong with using a percentage split for lead routing?',
        opts: ['Nothing', 'It is random, not priority-ordered', 'It does not scale', 'It only works in MCN'], a: 1, why: 'A percentage split randomises. Routing by tier or ownership needs a decision split on a value.' },
      { q: 'Editing a live journey does what?',
        opts: ['Edits in place for everyone', 'Creates a new version; contacts on the old version finish it', 'Stops the journey', 'Deletes all engagement data'], a: 1, why: 'Versioning means in-flight contacts complete the version they entered on. Plan changes as a versioning exercise.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 7 - AUTOMATION STUDIO & DATA OPERATIONS                                */
/* -------------------------------------------------------------------------- */
{
  id: 'auto',
  n: 7,
  title: 'Automation Studio & Data Operations',
  icon: '07',
  color: '#0891B2',
  tagline: 'Scheduled automations, SQL, extracts, file transfer',
  guide: '07-Automation-Studio-and-Data-Operations.md',
  art: [
    { label: 'DataExtensionSyncService', href: 'force-app/main/default/classes/DataExtensionSyncService.cls' },
    { label: 'MarketingCloudIntelligenceExportService', href: 'force-app/main/default/classes/MarketingCloudIntelligenceExportService.cls' },
    { label: 'scripts/apex (sync + consent scenarios)', href: 'scripts/apex/' },
  ],
  objectives: [
    'Choose scheduled vs triggered automations and justify it',
    'Write a production SQL Activity with the right target and dedupe logic',
    'Use file transfer and data extract activities correctly',
    'Handle errors: retries, dependencies, dead-lettering, monitoring',
    'Explain how automations interact with business units and Data 360',
  ],
  lessons: [
    {
      title: 'Automation Anatomy & SQL Activities', mins: 10,
      blocks: [
        { t: 'p', x: 'An automation is a sequence of activities that runs to completion. Three design decisions account for most automation failures: the trigger type, the dependency between activities, and what happens when step 4 of 5 fails.' },
        { t: 'table', head: ['Trigger', 'Fires', 'Use for'], rows: [
          ['Scheduled', 'At a set time, daily or weekly', 'Nightly SQL, extracts, reconciliation'],
          ['Event-driven', 'On file arrival or API call', 'Inbound files, transactional triggers'],
          ['Triggered (from a journey/flow)', 'When a contact reaches a point', 'Triggered sends, CRM hand-off'],
        ]},
        { t: 'code', lang: 'sql', x: `-- Nightly segmentation: only subscribers who are marketable AND engaged
SELECT  a.EmailAddress
     ,  a.SubscriberKey
     ,  'ENGAGED'          AS Segment
     ,  a.EngagementScore
     ,  DATEADD(day, -30, GETDATE()) AS SnapshotDate
INTO    ent.SEG_Engaged_Daily
FROM    ent.PROFILE_Subscribers a
JOIN    ent.PREF_Channel_State  p
  ON    p.SubscriberKey = a.SubscriberKey
 AND    p.Channel        = 'Email'
 AND    p.OptOut         = 'false'          -- consent gate lives in the query
WHERE  a.EngagementScore >= 50
AND    a.LifecycleStatus <> 'Bounced'
AND    NOT EXISTS (      -- dedupe: never double-send a contact in one day
         SELECT 1 FROM ent.SEG_Engaged_Daily d
         WHERE  d.SubscriberKey = a.SubscriberKey)` },
        { t: 'callout', kind: 'warn', x: 'Every send query needs a consent predicate and a dedupe predicate. Projects that ship without them are the ones that generate the compliance incident, not the ones that fail QA.' },
        { t: 'list', items: [
          'Use a staging DE then a final DE. Debugging a production-target query is how you accidentally email your test list.',
          'Set the target DE to Overwrite for a snapshot, Append for a log.',
          'Name DEs with a convention that includes the cadence: SEG_Engaged_Daily, not Segment1.',
          'Put the incremental watermark in the query so a re-run is safe.',
          'Schedule the automation with a dependency on the file landing, never on a hard-coded assumption about file timing.',
        ]},
        { t: 'selfcheck', q: 'Your nightly automation failed at the SQL step and retried - what is the risk with an Append target?', a: 'The retry appends the same rows again, duplicating your audience. Either make the query idempotent with a watermark or use Overwrite for a snapshot.' },
      ]
    },
    {
      title: 'File Transfer, Extracts & Error Handling', mins: 9,
      blocks: [
        { t: 'p', x: 'Files are where Marketing Cloud implementations become ungoverned. Every extract is a file on an FTP that nobody owns, with retention nobody set, containing PII nobody classified.' },
        { t: 'table', head: ['Activity', 'Direction', 'Watch out for'], rows: [
          ['File Transfer', 'FTP/SFTP in and out', 'SFTP is the only acceptable protocol in 2026 - plain FTP is not acceptable for PII'],
          ['Data Extract', 'Platform to file', 'Set retention or you create an unmanaged PII store'],
          ['Import', 'File to DE', 'Validate before load; a bad file should fail the automation, not half-load'],
          ['SSJS Script', 'Logic in JS', 'The only place you can call external APIs; log everything'],
        ]},
        { t: 'num', items: [
          'Fail fast: validate the file shape in an SSJS activity before the import, so a bad file stops the run rather than half-populating a DE.',
          'Set an extract retention of 30 days and name the file with the run date.',
          'Wrap SSJS in try/catch and surface the error to the automation log, or it fails silently.',
          'Never log PII to the automation log. Log record counts and IDs, not emails.',
          'Add a monitoring automation or a platform event that fires when a critical automation errors.',
        ]},
        { t: 'code', lang: 'ssjs', x: `// SSJS activity: validate an inbound file before the import runs
var f = new File("customer-consent-2026-09-26.csv");
if (!f.exists()) { throw new Error("Inbound consent file missing"); }

var lines = Platform.Function.split(f.readLine(), "\\r?\\n");
if (lines.length < 2) { throw new Error("Consent file has no data rows"); }

var required = ["ContactKey", "Channel", "OptOut", "CapturedAt"];
var header   = lines[0].split(",");
var missing  = required.filter(function (c) { return header.indexOf(c) === -1; });
if (missing.length) {
  throw new Error("Consent file missing columns: " + missing.join(", "));
}

Platform.Logging.log("Consent file validated: " + (lines.length - 1) + " rows, " + header.length + " columns");
write("validatedRows", lines.length - 1);` },
        { t: 'callout', kind: 'tip', x: 'The Salesforce side of this pattern is modelled in the repo: the platform event, the sync log object and the services. Read ARCHITECTURE.md for how the layers wire together.' },
        { t: 'selfcheck', q: 'What is the most common automation anti-pattern?', a: 'No validation before import, so a malformed file half-loads a DE and the campaign sends from bad data.' },
        { t: 'ex', id: 'ex-07-1', stars: 2, title: 'Write the Idempotent Scoring SQL', obj: 'An automation that can be re-run safely at 02:00 after a failure.', verify: 'The SQL, the activity type, and the two failure modes you eliminated by choosing it.', code: { lang: 'sql', x: 'SELECT\n  c.Id AS SubscriberId,\n  a.EmailAddress,\n  CASE\n    WHEN o.TotalOrders >= 3 AND o.Recency_Days <= 30 THEN "Loyal"\n    WHEN o.Recency_Days <= 90                  THEN "Active"\n    ELSE "Lapsed"\n  END AS Segment\nFROM Contacts c\nJOIN Commerce_Orders o ON o.ContactId = c.Id\nWHERE o.Order_Status = "Shipped"\n  AND c.EmailAddress <> ""\n  AND c.IsOptedOut = 0' }, steps: [
          { h: 'Deliver', items: [
            'Write the SQL that assigns one segment per contact, with no duplicate SubscriberId rows.',
            'Name the activity type - overwrite, append or update - and justify it against a re-run at 02:05.',
            'Name two failure modes the choice eliminates: one about duplicates, one about stale rows.',
          ]},
        ]},
        { t: 'ex', id: 'ex-07-2', stars: 3, title: 'Design the Failure Path', obj: 'Automations fail at 02:00 and a human is asleep until 08:00. Design for that.', verify: 'A step-by-step activity list with validation, retry, dead-letter and the monitoring that catches it.', steps: [
          { h: 'Scenario', items: [
            'A nightly automation pulls a CSV from SFTP, loads it to a staging DE, runs SQL and fires a triggered send to 300k contacts.',
            'The file has arrived 40% smaller than yesterday and the row count is the only validation the customer has.',
          ]},
          { h: 'Deliver', items: [
            'List the activities in order, including the validation step and the threshold that stops the run.',
            'Say what happens on failure: retry count, where the error surfaces, and what must never happen to the send DE.',
            'Name the two monitoring reports or alerts you would hand over, and who receives them.',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 7 Quiz - Automation Studio', mins: 5,
    questions: [
      { q: 'Which automation trigger fires when a file lands?',
        opts: ['Scheduled', 'Event-driven', 'Record-triggered', 'Autolaunched'], a: 1, why: 'Event-driven automations fire on file arrival or an API call. Scheduled automations fire on a clock.' },
      { q: 'What makes a nightly SQL Activity safe to re-run?',
        opts: ['An Overwrite target', 'A watermark / idempotent predicate and a dedupe', 'A longer schedule', 'A larger DE'], a: 1, why: 'Idempotency plus dedupe means a retry does not duplicate the audience.' },
      { q: 'Why validate a file before the import activity?',
        opts: ['To speed up the import', 'So a malformed file fails the run instead of half-loading a DE', 'To compress it', 'To rename it'], a: 1, why: 'Fail fast. A half-loaded DE means sending from bad data.' },
      { q: 'Which is acceptable for transferring PII files in 2026?',
        opts: ['Plain FTP', 'SFTP', 'Email attachment', 'Public HTTP'], a: 1, why: 'Plain FTP is unencrypted. SFTP is the acceptable protocol for anything containing PII.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 8 - UNIFIED MESSAGING: SMS, WHATSAPP & PUSH                              */
/* -------------------------------------------------------------------------- */
{
  id: 'mobile',
  n: 8,
  title: 'Unified Messaging: SMS, WhatsApp & Push',
  icon: '08',
  color: '#16A34A',
  tagline: 'MobileConnect, 10DLC, WhatsApp templates, push',
  guide: '08-Unified-Messaging-SMS-WhatsApp-and-Push.md',
  art: [
    { label: 'ConsentSyncService (channel consent)', href: 'force-app/main/default/classes/ConsentSyncService.cls' },
    { label: 'Consent_Preference__c object', href: 'force-app/main/default/objects/Consent_Preference__c/' },
    { label: 'Unified Messaging channel matrix (guide 08)', href: 'developer%20Marketing%20Cloud%20Consultant%20Roadmap/08-Unified-Messaging-SMS-WhatsApp-and-Push.md' },
  ],
  objectives: [
    'Configure SMS, WhatsApp and push channels and know their different consent models',
    'Explain 10DLC, toll-free and dedicated short-code registration',
    'Handle WhatsApp template categories and opt-in rules',
    'Apply quiet hours, frequency capping and TCPA constraints',
    'Recommend a channel mix for a scenario, with the compliance trade-offs',
  ],
  lessons: [
    {
      title: 'Three Channels, Three Compliance Models', mins: 10,
      blocks: [
        { t: 'p', x: 'Mobile Studio still contains MobileConnect, MobilePush and GroupConnect, and Unified Messaging is the current branded service for authenticated cross-channel sending. The channels are not interchangeable - each has its own registration, consent and cost model.' },
        { t: 'table', head: ['', 'SMS', 'WhatsApp', 'Mobile Push'], rows: [
          ['Opt-in model', 'Express written consent (TCPA)', 'Explicit opt-in per template category', 'Device-level permission'],
          ['Registration', '10DLC campaign, toll-free, short code', 'Business + brand verification, templates', 'None beyond the SDK'],
          ['Cost', 'Per segment, ~$0.007-0.02', 'Per conversation (varies by country)', 'Free'],
          ['Content rules', 'Quiet hours, frequency caps', 'Pre-approved templates outside 24h window', 'Rich media allowed'],
          ['Best for', 'Alerts, reminders, short code', 'Conversational service and opted-in updates', 'App engagement, time-sensitive'],
        ]},
        { t: 'h', x: '10DLC in one paragraph' },
        { t: 'p', x: '10DLC is the US regulatory framework for application-to-person SMS. You register a brand, a campaign and a legal entity, submit samples of your message, and get a dedicated short code. Registration takes days to weeks, and it is a hard blocker on go-live - discover it on day one, not week six.' },
        { t: 'code', lang: 'ampscript', x: `%%[ SET @tz   = AttributeValue("PreferredTimeZone")
     SET @optInSMS  = AttributeValue("SMS_OptIn")
     SET @optInWA   = AttributeValue("WhatsApp_OptIn")
     SET @localHour = SYSTEMDATEToLocalTime(GETDATE(), @tz) ]%%

%%[ IF @optInSMS != "true" THEN
        SET @sendSMS = 0
     ELSEIF @localHour < 9 OR @localHour >= 21 THEN
        SET @sendSMS = 0            -- quiet hours, defer not drop
     ELSE
        SET @sendSMS = 1
     ENDIF ]%%

%%[ IF @optInWA != "true" THEN
        SET @sendWA = 0
     ELSE
        SET @sendWA = 1     -- WhatsApp templates still need a 24h window check
     ENDIF ]%%` },
        { t: 'callout', kind: 'warn', x: 'Quiet hours mean DEFER, never DROP. A dropped promotional message is a lost conversion; a deferred one still arrives. This is one of the most commonly lost marks on scenario questions.' },
        { t: 'selfcheck', q: 'A customer wants to send promotional SMS at 22:00 local time to maximise open rates. What do you say?', a: 'That is a compliance violation under most TCPA-style rules and will damage the sender reputation. Defer to the next permitted window instead - and check the specific programme rules they registered under.' },
      ]
    },
    {
      title: 'Channel Selection as a Consulting Decision', mins: 8,
      blocks: [
        { t: 'p', x: 'The exam scenario questions rarely ask "which channel" in the abstract. They give you a business problem and expect you to pick a mix and justify it on consent, cost and message weight.' },
        { t: 'table', head: ['Scenario', 'Primary', 'Escalation', 'Why'], rows: [
          ['Appointment reminder', 'SMS', 'Push', 'Time-critical, short, high open rate'],
          ['Abandoned cart, high value', 'Email + SMS', 'WhatsApp', 'Email carries the story, SMS drives the click'],
          ['Service conversation', 'WhatsApp', 'SMS fallback', 'Conversational, template-free inside 24h'],
          ['App re-engagement', 'Push', 'Email', 'Cheap, immediate, requires device permission'],
          ['Replenishment cycle', 'Email', 'SMS', 'Low urgency, rich content needed'],
        ]},
        { t: 'num', items: [
          'Frequency-cap across every channel, not per channel. Three emails and two SMS in a day is three contacts annoyed, not two.',
          'Use a single preference centre so a customer can change their mind in one place and have it honoured everywhere.',
          'Treat WhatsApp as a service channel first and a marketing channel second - that is how the platform is regulated.',
          'Instrument each channel separately but report on the customer, not the channel.',
          'Write the channel decision into the solution design with the compliance reasoning, not just the channel names.',
        ]},
        { t: 'callout', kind: 'tip', x: 'On the MCE exam, Messaging and Consent questions are almost always "given this scenario, what is the compliant and effective answer". Read the scenario constraints literally - the time, the channel, and the consent state are all clues.' },
        { t: 'selfcheck', q: 'A customer sends a cart-abandonment email and an SMS two hours later for the same cart. Is that a problem?', a: 'Not inherently, but it must be cross-channel frequency capped and the SMS must have its own consent. Two contacts annoyed in an hour is how you lose the number.' },
        { t: 'ex', id: 'ex-08-1', stars: 2, title: 'Channel Selection Matrix', obj: 'Justify the channel from its own rules, not from its open rate.', verify: 'Four channels with registration requirement, consent model, cost shape and the one job you would use it for.', steps: [
          { h: 'Deliver', items: [
            'Build a comparison for email, SMS (10DLC), WhatsApp and mobile push.',
            'For each: what registration or template approval is required before the first send, and how long it takes.',
            'For each: the consent model, the cost shape, and the one job you would actually use it for.',
            'Say which channel you would not use for a promotional message and why.',
          ]},
        ]},
        { t: 'ex', id: 'ex-08-2', stars: 3, title: 'Time-Zone-Aware Quiet Hours', obj: 'Defer the message instead of dropping it - the difference between a policy and a data loss.', verify: 'A SQL predicate that suppresses out-of-window sends per contact time zone, plus the activity that acts on the deferred set.', code: { lang: 'sql', x: '-- Defer, never drop: keep the contact and set the next legal send window\nSELECT\n  c.MobileNumber,\n  c.TimeZone_Offset,\n  CASE\n    WHEN (HOUR - c.TimeZone_Offset + 24) % 24 BETWEEN 8 AND 20 THEN "Send now"\n    ELSE "Defer to 08:00 local"\n  END AS Send_Window\nFROM Mobile_Reachable__c c\nWHERE c.SMS_Consent__c = 1\n  AND c.IsOptedOut__c = 0\n  AND c.MobileNumber LIKE "+%"' }, steps: [
          { h: 'Deliver', items: [
            'Write the predicate that decides send-now versus defer, per contact time zone.',
            'Name the activity that acts on the deferred set, and the field it writes so the next run knows.',
            'Explain why this design does not re-send to a contact who unsubscribed while the message was deferred.',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 8 Quiz - SMS, WhatsApp & Push', mins: 5,
    questions: [
      { q: 'A message arrives during quiet hours. What is the correct action?',
        opts: ['Drop it', 'Defer it to the permitted window', 'Send only on email', 'Bounce it'], a: 1, why: 'Quiet hours mean defer, not drop. Dropping loses the conversion and looks like a data loss bug.' },
      { q: 'What does 10DLC registration involve in the US?',
        opts: ['A WhatsApp template review', 'Brand, campaign and legal entity registration with sample messages', 'An IP warm-up schedule', 'A Data Space creation'], a: 1, why: '10DLC is the US A2P SMS framework - brand, campaign, legal entity, and message samples.' },
      { q: 'Which channel is cheapest at scale?',
        opts: ['SMS', 'WhatsApp', 'Mobile push', 'All equal'], a: 2, why: 'Mobile push is free; SMS is per-segment and WhatsApp is per-conversation.' },
      { q: 'WhatsApp content outside the 24-hour customer-service window requires what?',
        opts: ['A pre-approved template', 'A DMARC record', 'A dedicated IP', 'A Business Unit'], a: 0, why: 'Outside the 24h window, WhatsApp requires pre-approved templates per category.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 9 - PAID AUDIENCES & AD ACTIVATION                                      */
/* -------------------------------------------------------------------------- */
{
  id: 'ads',
  n: 9,
  title: 'Paid Audiences & Ad Activation',
  icon: '09',
  color: '#9333EA',
  tagline: 'Data 360 Ad Audiences, retargeting, suppression',
  guide: '09-Paid-Audiences-and-Ad-Activation.md',
  art: [
    { label: 'CampaignMemberSyncService', href: 'force-app/main/default/classes/CampaignMemberSyncService.cls' },
    { label: 'CampaignMemberSync__mdt', href: 'force-app/main/default/customMetadata/' },
    { label: 'Advertising Studio migration playbook (guide 09)', href: 'developer%20Marketing%20Cloud%20Consultant%20Roadmap/09-Paid-Audiences-and-Ad-Activation.md' },
  ],
  objectives: [
    'Explain why Advertising Studio is retired and what replaces it',
    'Build a Data 360 Ad Audience and activate it to ad platforms',
    'Apply suppression and frequency controls across channels',
    'Plan an Advertising Studio migration with a rollback',
    'Design retargeting audiences that respect consent',
  ],
  lessons: [
    {
      title: 'Advertising Studio Is Gone - Plan Accordingly', mins: 9,
      blocks: [
        { t: 'p', x: 'Marketing Cloud Advertising (Advertising Studio, Advertising Audiences, Journey Builder Advertising) subscriptions became non-renewable on 15 August 2026. Any solution that still designs new work on it is already dead. The strategic replacement is Data 360 Ad Audiences.' },
        { t: 'table', head: ['Capability', 'Old (retired)', 'New (Data 360)'], rows: [
          ['Segment definition', 'In Advertising Studio', 'In Data 360 on the unified profile'],
          ['Identity', 'Advertising-side match', 'Data 360 Identity Resolution'],
          ['Google activation', 'Customer Match', 'Data Manager API (Customer Match deprecated, cutover 1 Apr 2026)'],
          ['Meta activation', 'Advertising Audiences', 'Data 360 Ad Audiences'],
          ['Governance', 'Studio-level', 'Data Space and permission-set based'],
        ]},
        { t: 'callout', kind: 'warn', x: 'Two compounding retirements: Advertising Studio itself, and Google Customer Match in favour of the Data Manager API. A customer in run-off on Advertising Studio with a Customer Match sync has two independent breakages coming. Say this out loud in the discovery.' },
        { t: 'p', x: 'Also remember what is already gone so you do not propose it: Social Studio is sunset, and Audience Studio (the former DMP/Krux) was retired with its data deleted in February 2024.' },
        { t: 'selfcheck', q: 'A customer is on Advertising Studio under a contract that runs to March 2027. What do you recommend?', a: 'Plan the migration now, not at contract end. Build the segments in Data 360 in parallel, validate match rates, and cut over with a rollback window - because the external ad platform APIs will keep moving during run-off.' },
      ]
    },
    {
      title: 'Ad Audiences, Suppression & Retargeting', mins: 9,
      blocks: [
        { t: 'p', x: 'A paid audience is a segment you push to an ad platform. The consulting work is not the push - it is deciding who is eligible, who is excluded, and how you will know it worked.' },
        { t: 'num', items: [
          'Define the segment on the Data 360 unified profile, not in the ad platform. The ad platform is an activation target, not a source of truth.',
          'Apply suppression before activation: existing buyers, unsubscribes, and consent-withdrawn contacts must never receive a retarget.',
          'Set a frequency cap across email and paid so a converted customer stops being retargeted the same day.',
          'Cap audience size where the platform penalises small or over-narrow audiences for lookalike modelling.',
          'Measure with the same identity used to activate, or you cannot attribute the ad back to the person.',
        ]},
        { t: 'table', head: ['Audience', 'Window', 'Exclusions'], rows: [
          ['Cart abandoners', '14 days', 'Purchasers, unsubscribes'],
          ['Product viewers', '30 days', 'Purchasers of that SKU'],
          ['Lapsed customers', '180 days', 'Opted-out, already reactivated'],
          ['High-value lookalike', 'Ongoing', 'Existing customers, employees'],
        ]},
        { t: 'code', lang: 'sql', x: `-- Retargeting audience with the mandatory suppression predicates
SELECT  a.EmailAddress
     ,  a.SubscriberKey
     ,  'RETARGET_CART_14D'      AS AudienceName
     ,  DATEDIFF(day, a.LastCartDate, GETDATE()) AS DaysSince
INTO    ent.AUD_Cart_Abandon_14d
FROM    ent.PROFILE_Subscribers a
WHERE  a.CartStatus = 'Abandoned'
AND    DATEDIFF(day, a.LastCartDate, GETDATE()) BETWEEN 0 AND 14
AND    a.EmailOptOut  = 'false'          -- consent gate
AND    a.SMSOptOut   = 'false'          -- cross-channel consent
AND    NOT EXISTS (                       -- never retarget a buyer
         SELECT 1 FROM ent.ORD_Recent_Purchases o
         WHERE  o.SubscriberKey = a.SubscriberKey
            AND  o.PurchaseDate >= a.LastCartDate)
AND    NOT EXISTS (                       -- global suppression
         SELECT 1 FROM ent.SUP_Global_List g
         WHERE  g.EmailAddress = a.EmailAddress)` },
        { t: 'selfcheck', q: 'A customer complains that buyers are being retargeted for products they already own. Which predicate is missing?', a: 'The purchase-based NOT EXISTS exclusion. Suppressing converters is a data requirement, not just a frequency cap.' },
        { t: 'ex', id: 'ex-09-1', stars: 3, title: 'Map Advertising Studio to Data 360', obj: 'Build the migration conversation before the contract renewal forces it.', verify: 'A capability map table with the Data 360 equivalent, the gap where there is none, and the mitigation.', steps: [
          { h: 'Scenario', items: [
            'The customer is on Advertising Studio, syncing audiences to Google and Meta, and the subscription cannot renew after 15 August 2026.',
            'They also rely on a Google Customer Match sync configured in 2023.',
          ]},
          { h: 'Deliver', items: [
            'Map each Advertising Studio capability - audience building, exclusions, suppression, frequency capping, destination sync - to its Data 360 equivalent.',
            'For each mapping, mark it exact, approximate or no equivalent, and give the mitigation for the gaps.',
            'State what the Google Customer Match cutover means for them, in one sentence they can forward to their agency.',
          ]},
        ]},
        { t: 'ex', id: 'ex-09-2', stars: 2, title: 'Write the Audience Predicates', obj: 'Write the audience as the three exclusions that actually matter.', verify: 'A predicate set covering consent, converters and frequency, with a sentence on why order matters.', code: { lang: 'sql', x: 'SELECT DISTINCT c.EmailAddress\nFROM Campaign_Contacts__c c\nWHERE c.Campaign_Member_Status__c = "Sent"\n  AND c.Consent_Email__c = 1              -- 1. consent gate, never optional\n  AND c.Consent_Match_Payload__c = 1       -- explicit match permission\n  AND NOT EXISTS (                          -- 2. never retarget a buyer\n    SELECT 1 FROM Commerce_Orders__c o\n    WHERE o.EmailAddress = c.EmailAddress\n      AND o.Product_Category__c = c.Product_Category__c\n      AND o.Order_Date__c >= LAST_N_DAYS:30\n  )\n  AND NOT EXISTS (                          -- 3. cross-channel frequency cap\n    SELECT 1 FROM Marketing_Interaction__c i\n    WHERE i.EmailAddress = c.EmailAddress\n      AND i.Channel__c IN ("Email", "SMS")\n      AND i.CreatedDate >= LAST_N_DAYS:7\n  )' }, steps: [
          { h: 'Deliver', items: [
            'Write the three exclusion predicates, and state which one you apply first and why.',
            'Say where each predicate is evaluated - in Data 360, in the destination platform, or both.',
            'Explain what happens if a match permission is missing and the customer still wants the audience.',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 9 Quiz - Paid Audiences & Ad Activation', mins: 5,
    questions: [
      { q: 'What replaced Advertising Studio?',
        opts: ['Social Studio', 'Data 360 Ad Audiences', 'Audience Studio', 'Mobile Studio'], a: 1, why: 'Salesforce directed customers to Data Cloud / Data 360 Ad Audiences. Advertising Studio subscriptions are non-renewable from 15 Aug 2026.' },
      { q: 'Google Customer Match was replaced by what?',
        opts: ['Data Manager API', 'The SOAP API', 'A new IP pool', 'Marketing Cloud Connect'], a: 0, why: 'Google deprecated Customer Match in favour of the Data Manager API, with cutover from 1 April 2026.' },
      { q: 'Where should a retargeting segment be defined?',
        opts: ['In the ad platform', 'In Data 360 on the unified profile', 'In a Data Extension only', 'In a Business Unit'], a: 1, why: 'Define in Data 360 and use the ad platform as an activation target, not a source of truth.' },
      { q: 'Audience Studio was retired when?',
        opts: ['February 2024', 'August 2026', 'Summer 26 release', 'It was never retired'], a: 0, why: 'The former DMP/Krux Audience Studio was retired on 1 February 2024 and its data deleted.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 10 - CONSENT MANAGEMENT & COMPLIANCE                                    */
/* -------------------------------------------------------------------------- */
{
  id: 'consent',
  n: 10,
  title: 'Consent Management & Compliance',
  icon: '10',
  color: '#DC2626',
  tagline: 'Consent model, preference centre, GDPR/CCPA/CASL/TCPA',
  guide: '10-Consent-Management-and-Compliance.md',
  art: [
    { label: 'ConsentSyncService', href: 'force-app/main/default/classes/ConsentSyncService.cls' },
    { label: 'Consent_Preference__c object', href: 'force-app/main/default/objects/Consent_Preference__c/' },
    { label: 'Flow: consent capture + preference centre update', href: 'force-app/main/default/flows/' },
  ],
  objectives: [
    'Design a consent data model with per-channel and per-purpose granularity',
    'Explain the platform consent objects and their relationships',
    'Configure a consent banner on marketing and external pages',
    'Apply GDPR, CCPA, CAN-SPAM, CASL and TCPA correctly to a scenario',
    'Build a preference centre that actually round-trips to the platforms',
  ],
  lessons: [
    {
      title: 'Consent Is a Data Model, Not a Field', mins: 10,
      blocks: [
        { t: 'p', x: 'Thirteen percent of the MCN exam is Consent, which is why this phase gets a full module. The objective is explicit: understand the purpose AND the relationships of the platform consent objects, and determine the right method for creating, managing and updating consent records.' },
        { t: 'table', head: ['Level', 'Question it answers', 'Example'], rows: [
          ['Person', 'Is there a lawful relationship at all?', 'Is this contact a customer, prospect or stranger'],
          ['Channel', 'May we contact them on this channel?', 'Email yes, SMS no'],
          ['Purpose', 'For what may we use their data?', 'Transactional yes, marketing no'],
          ['Time', 'When did they say it, and does it still stand?', 'Captured 2026-03-01, source web form'],
        ]},
        { t: 'p', x: 'Model consent as rows with relationships, not as booleans. One boolean on the contact cannot answer "may we SMS them about offers but not about service", and it cannot be audited. On MCN this maps onto the platform consent objects; on MCE it maps onto the Preference DE plus the Preference Center.' },
        { t: 'num', items: [
          'Capture consent at the point of collection and store the source, timestamp and text version shown.',
          'Propagate a withdrawal to every downstream system in one direction, within the required window.',
          'Consent gates the audience, not the send. If the segment is already built from non-consented contacts, a send-time filter is too late.',
          'Keep the historical record even after withdrawal - you must be able to prove when consent was given and when it was withdrawn.',
          'Test the withdrawal path, not just the grant path. Almost every project has a broken opt-out.',
        ]},
        { t: 'selfcheck', q: 'A customer asks for a single "Marketing Opt-In" checkbox. What do you advise?', a: 'Advise against it. Granular per-channel and per-purpose consent is what the platform models and what regulators increasingly expect - and a single boolean cannot represent a customer who accepts email but declines SMS.' },
      ]
    },
    {
      title: 'Regulations & the Preference Centre', mins: 9,
      blocks: [
        { t: 'table', head: ['Regime', 'Scope', 'What it demands'], rows: [
          ['GDPR', 'EU/UK individuals', 'Lawful basis, transparency, erasure, portability, minimisation'],
          ['ePrivacy / PECR', 'EU/UK direct marketing', 'Prior consent for email and SMS to individuals'],
          ['CCPA/CPRA', 'California', 'Notice, opt-out of sale/sharing, limit use of sensitive PII'],
          ['CAN-SPAM', 'US commercial email', 'Accurate headers, physical address, working unsubscribe honoured in 10 days'],
          ['CASL', 'Canada', 'Express or implied consent, proof, identification'],
          ['TCPA', 'US SMS', 'Prior express written consent, opt-out honoured, quiet hours'],
        ]},
        { t: 'h', x: 'The consent banner objective' },
        { t: 'p', x: 'The MCN exam asks you to configure a consent banner on marketing landing pages AND external pages. Note the second half - a lot of traffic arrives on the customer own site, and the banner has to work there too. The difference is that on an external page you are the processor capturing on the customer behalf, so the evidence and the routing back to their CRM matter more.' },
        { t: 'table', head: ['Element', 'Purpose', 'Consultant trap'], rows: [
          ['Banner', 'Capture the choice', 'Burying it behind a cookie banner nobody sees'],
          ['Purpose list', 'Granular choices', 'One checkbox for everything'],
          ['Evidence', 'Timestamp, source, text version', 'No record of what was actually shown'],
          ['Preference centre', 'Ongoing management', 'Not linked back to the sending platform'],
        ]},
        { t: 'callout', kind: 'tip', x: 'Test the full round trip: capture on a landing page, see it in the consent object, see the segment exclude them, see the withdrawal propagate. Any break in that chain is a finding.' },
        { t: 'selfcheck', q: 'Which regulation most directly governs commercial email consent in the EU?', a: 'GDPR together with the ePrivacy/PECR direct-marketing rules. CAN-SPAM is US, CCPA is California, CASL is Canada.' },
        { t: 'ex', id: 'ex-10-1', stars: 2, title: 'Design the Consent Data Model', obj: 'Consent is a model, not a checkbox. Build the model.', verify: 'A field-level design where channel, purpose, status, timestamp and source are all separate - and the five states a record can be in.', steps: [
          { h: 'Scenario', items: [
            'A retailer collects email, SMS and WhatsApp consent from three places: the web banner, the app and a call centre.',
            'The call centre records consent in a spreadsheet. EU contacts must be provable for 3 years.',
          ]},
          { h: 'Deliver', items: [
            'Design the consent record: every field, its type, and why it is separate from every other field.',
            'Define the five states a consent record can be in, and what each one permits a campaign to do.',
            'Say which system is authoritative per channel, and what happens on conflict.',
          ]},
        ]},
        { t: 'ex', id: 'ex-10-2', stars: 3, title: 'Handle the Erasure Request', obj: 'Delete less than you think, and be able to prove why.', verify: 'A three-column table - suppress, delete, retain - with the legal or contractual reason for each row.', steps: [
          { h: 'Scenario', items: [
            'An EU customer requests erasure. They have transactional history, marketing consent history, and one open complaint case.',
            'Legal requires marketing consent evidence to be retained for 3 years.',
          ]},
          { h: 'Deliver', items: [
            'List everything you would suppress, everything you would delete, and everything you would retain.',
            'For each retained item, name the law, contract or audit requirement that forces retention.',
            'Say what the customer-facing confirmation says, and what it must not claim.',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 10 Quiz - Consent & Compliance', mins: 5,
    questions: [
      { q: 'What is the right granularity for a consent data model?',
        opts: ['One boolean per contact', 'Per channel and per purpose, with timestamp and source', 'One boolean per business unit', 'A free-text note'], a: 1, why: 'A single boolean cannot represent channel or purpose differences, and it cannot be audited without a timestamp and source.' },
      { q: 'Where should a consent check live in the send pipeline?',
        opts: ['At send time as a filter', 'At the audience build, gating segmentation and activation', 'In the email template', 'In a Data View'], a: 1, why: 'Consent gates the audience. A send-time filter is too late and the data has already been misused.' },
      { q: 'Which regime requires prior express written consent for US SMS?',
        opts: ['GDPR', 'CAN-SPAM', 'TCPA', 'CCPA'], a: 2, why: 'TCPA governs A2P SMS in the US and requires prior express written consent plus honoured opt-outs.' },
      { q: 'What must you keep after a consent withdrawal?',
        opts: ['Nothing', 'The historical record of grant and withdrawal', 'Only the withdrawal date', 'A screenshot of the banner'], a: 1, why: 'You must be able to prove when consent was given and when it was withdrawn. The record is retained even though processing stops.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 11 - PLATFORM SETUP, GOVERNANCE & BUSINESS UNITS                       */
/* -------------------------------------------------------------------------- */
{
  id: 'setup',
  n: 11,
  title: 'Platform Setup, Governance & Business Units',
  icon: '11',
  color: '#475569',
  tagline: 'BUs, roles, permission sets, SSO, Enhanced CMS',
  guide: '11-Platform-Setup-Governance-and-Business-Units.md',
  art: [
    { label: 'MC_Config__mdt', href: 'force-app/main/default/customMetadata/MC_Config__mdt/' },
    { label: 'Marketing_Cloud_User permission set', href: 'force-app/main/default/permissionsets/' },
    { label: 'Campaign launch approval process', href: 'force-app/main/default/approvalProcesses/' },
  ],
  objectives: [
    'Run the MCN setup sequence: Data 360 provisioning, Marketing Data Kit, permission sets',
    'Justify Business Units against a governance requirement',
    'Model content and user governance with roles and Enhanced CMS Workspaces',
    'Configure sending domain authentication and self-service domain options',
    'Write a governance model a client can actually operate',
  ],
  lessons: [
    {
      title: 'The Setup Sequence & Governance Model', mins: 10,
      blocks: [
        { t: 'p', x: 'The Platform Setup & Governance domain is 13% of the MCN exam and is the easiest 13% you can win - if you have actually done an install. The objectives name four things: Core org edition requirements, Data 360 provisioning, Marketing Data Kit installation and permission sets.' },
        { t: 'num', items: [
          'Confirm the core org edition is Enterprise or Unlimited, and that the org is Lightning Experience. No exceptions, no workaround.',
          'Provision Data 360 for the org, then install the Marketing Data Kit to get the standard CRM mappings.',
          'Create Data Spaces with a PII model, then assign permission sets - never hand out Modify All to make something work.',
          'Configure the Business Unit structure against a governance requirement and document the decision.',
          'Set up sending domain authentication. On MCN this includes the self-service domain authentication objective.',
          'Stand up Enhanced CMS Workspaces so content can be edited inside governance rather than outside it.',
        ]},
        { t: 'table', head: ['Governance need', 'Mechanism', 'Not this'], rows: [
          ['Separate content per brand', 'Business Units + content scopes', 'One BU plus naming conventions'],
          ['Marketers edit, admins approve', 'Roles + Enhanced CMS Workspaces', 'A permission set granting Modify All'],
          ['Least privilege', 'Permission sets + permission set groups', 'Sharing everyone has Modify All'],
          ['One login', 'SSO from the core org identity provider', 'Per-BU passwords'],
          ['Regulated content', 'Content approval + review workflow', 'Trusting the marketer'],
        ]},
        { t: 'callout', kind: 'warn', x: 'A permission set that grants Modify All to solve an access problem is not a solution, it is a future incident. Model access deliberately and record why each permission exists.' },
        { t: 'selfcheck', q: 'A client wants four brands sharing one content library with different legal footers. Do they need four Business Units?', a: 'Probably not four full BUs. Different legal footers per brand usually need content scopes or a footer merge field driven by brand, within one BU - unless they also need separate users, data or sending.' },
      ]
    },
    {
      title: 'The Consultant Discovery Checklist', mins: 8,
      blocks: [
        { t: 'p', x: 'A setup phase that produces a configuration but not a decision record is a failure. Every governance decision needs a recorded reason, because the client will ask "why do we have three business units" in eighteen months.' },
        { t: 'table', head: ['Discovery question', 'What it decides'], rows: [
          ['Core org edition and Experience Cloud mode?', 'Whether MCN is even an option'],
          ['How many brands, regions, legal entities?', 'Business Unit count'],
          ['Who authors content, who approves, who sends?', 'Roles and Enhanced CMS Workspaces'],
          ['Monthly volume per BU, and is it consistent?', 'Dedicated vs shared IP, and the warm-up plan'],
          ['Which sending domains do we own?', 'Authentication and subdomain design'],
          ['Where does PII live today and who may see it?', 'Data Spaces and the PII model'],
          ['What is the system of record per attribute?', 'Sync direction and conflict resolution'],
        ]},
        { t: 'callout', kind: 'tip', x: 'The repository models this: MC_Config__mdt holds the Business Unit and endpoint mapping as deployable configuration, and the permission set shows the least-privilege pattern. Read those before designing your own.' },
        { t: 'selfcheck', q: 'Why record the reason for each Business Unit rather than just creating them?', a: 'Because BUs carry cost and operational overhead. Without a recorded governance reason nobody can tell whether a BU is still justified, and it will never be decommissioned.' },
        { t: 'ex', id: 'ex-11-1', stars: 2, title: 'Write the Setup Runbook', obj: 'The first hour of an install, in the order that avoids a rollback.', verify: 'An ordered runbook from core edition to first send, with the verification step for each line.', steps: [
          { h: 'Deliver', items: [
            'Write the ordered setup steps from core org edition check to the first production send.',
            'Add the verification step for each line - what you look at to know it worked.',
            'Mark the two steps where people most commonly go wrong, and say what the symptom looks like when they do.',
          ]},
        ]},
        { t: 'ex', id: 'ex-11-2', stars: 2, title: 'Design the Governance Model', obj: 'Give marketers room to work and keep control where control matters.', verify: 'A role matrix of who can do what across content, audiences, journeys and settings, plus the permission set boundary.', steps: [
          { h: 'Scenario', items: [
            'Four brands share one content library. Agency users must not see each other drafts. Admins keep full control.',
            'Marketers need to build and test journeys but not change sending domains or data spaces.',
          ]},
          { h: 'Deliver', items: [
            'Build the role matrix: content, audiences, journeys, sending, governance - and who can do each.',
            'Say where you use roles and where you use an Enhanced CMS Workspace, and why the two are not the same mechanism.',
            'Name the two things you would deliberately leave admin-only, and the risk you are accepting by doing so.',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 11 Quiz - Setup & Governance', mins: 5,
    questions: [
      { q: 'What must be confirmed before Marketing Cloud Next can even be proposed?',
        opts: ['A Business Unit plan', 'Enterprise or Unlimited core edition and Lightning Experience', 'A dedicated IP', '10DLC registration'], a: 1, why: 'MCN requires Salesforce Enterprise or Unlimited and is Lightning Experience only.' },
      { q: 'What does the Marketing Data Kit install?',
        opts: ['IP warming schedules', 'Standard CRM-to-Data 360 mapping objects', 'Email templates', 'Suppression lists'], a: 1, why: 'The Marketing Data Kit provides the prebuilt Data 360 objects and mappings for CRM data.' },
      { q: 'Which mechanism formalises content governance in MCN?',
        opts: ['Roles plus Enhanced CMS Workspaces', 'An IP pool', 'A Business Unit per brand only', 'FTP permissions'], a: 0, why: 'Roles and Enhanced CMS Workspaces are named in the objective for content and user governance.' },
      { q: 'Why avoid granting Modify All to solve an access problem?',
        opts: ['It is slower', 'It defeats least privilege and creates an audit finding', 'Marketing Cloud rejects it', 'It is deprecated'], a: 1, why: 'Modify All bypasses the governance model the setup phase is supposed to establish.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 12 - REPORTS, DASHBOARDS & MARKETING CLOUD INTELLIGENCE                */
/* -------------------------------------------------------------------------- */
{
  id: 'analytics',
  n: 12,
  title: 'Reports, Dashboards & Marketing Cloud Intelligence',
  icon: '12',
  color: '#EA580C',
  tagline: 'Native reporting, MCI, attribution, KPI design',
  guide: '12-Reports-Dashboards-and-Marketing-Cloud-Intelligence.md',
  art: [
    { label: 'MarketingCloudIntelligenceExportService', href: 'force-app/main/default/classes/MarketingCloudIntelligenceExportService.cls' },
    { label: 'Dashboard: Marketing engagement', href: 'force-app/main/default/dashboards/' },
    { label: 'Reports (2)', href: 'force-app/main/default/reports/' },
  ],
  objectives: [
    'Choose between a pre-built dashboard, native reporting and a custom build',
    'Explain Marketing Cloud Intelligence and when it earns its cost',
    'Design a KPI set that survives contact with reality',
    'Set up multi-touch attribution and read it honestly',
    'Surface marketing insight where the user already works',
  ],
  lessons: [
    {
      title: 'Reporting Tiers & the Pre-Built Dashboard Objective', mins: 9,
      blocks: [
        { t: 'p', x: 'The Analytics & Performance Insights domain is 8% - the smallest on the MCN exam, and the easiest. One objective is almost free if you read it literally: identify a pre-built dashboard that best addresses the requirement. The trap is reaching for a custom build out of habit.' },
        { t: 'table', head: ['Tier', 'Use it when', 'Cost / effort'], rows: [
          ['Pre-built dashboard', 'The requirement matches a standard view', 'Minutes'],
          ['Native marketing reporting', 'Journey, email or send level detail', 'Low'],
          ['Data View query', 'You need a specific metric repeatedly', 'Low, but you own the SQL'],
          ['Marketing Cloud Intelligence', 'Cross-channel, governed, attribution', 'Significant - licensed product'],
          ['Custom build', 'None of the above fit', 'Highest'],
        ]},
        { t: 'h', x: 'Marketing Cloud Intelligence (formerly Datorama)' },
        { t: 'p', x: 'MCI is the analytics product: it ingests marketing, CRM and commerce data into a governed data model so you can do cross-channel analysis, segmentation and attribution properly. It is a real cost centre, so the consulting question is always whether the customer needs governed cross-channel truth or just campaign-level reporting.' },
        { t: 'table', head: ['KPI', 'Reads as', 'Trap'], rows: [
          ['Delivery rate', 'Did we actually send it', 'Ignoring bounces and blocks'],
          ['Bounce rate', 'List quality', 'Mixing hard and soft bounces'],
          ['Open rate', 'Subject line appeal', 'Apple Mail Privacy Protection makes it unreliable'],
          ['Click rate', 'Content relevance', 'Bot and security-scanner clicks'],
          ['Conversion rate', 'Business outcome', 'Attributing the last click only'],
          ['Unsubscribe rate', 'Permission and expectation', 'The most honest metric on the list'],
        ]},
        { t: 'callout', kind: 'tip', x: 'Read them together. A rising open rate with a rising unsubscribe rate is not success - it is a list being cleared.' },
        { t: 'selfcheck', q: 'A stakeholder asks for a bespoke dashboard of six custom metrics. What do you check first?', a: 'Whether pre-built dashboards or native reporting already cover most of it. Build only the gap - a custom build is the most expensive answer and the easiest to reach for by default.' },
      ]
    },
    {
      title: 'Attribution & Surfacing Insight', mins: 9,
      blocks: [
        { t: 'p', x: 'The other objective is about surfacing marketing data and insights across the Salesforce platform. The exam reward is for in-context insight - putting the answer where the user already works - not for extracting it somewhere else.' },
        { t: 'table', head: ['Model', 'Credits the', 'Best for'], rows: [
          ['First touch', 'The first interaction', 'Awareness and demand creation'],
          ['Last touch', 'The final interaction', 'Short, single-decision cycles'],
          ['Linear', 'Every touch equally', 'A neutral, defensible default'],
          ['Time decay', 'Recent touches more', 'Long consideration cycles'],
          ['Position based', 'First and last, less in the middle', 'Complex B2B buying groups'],
        ]},
        { t: 'num', items: [
          'Pick one attribution model and apply it consistently. Switching models between campaigns makes the numbers meaningless.',
          'Instrument the CRM side too - if the sale happens in Salesforce, the marketing data has to flow back to be joinable.',
          'Put campaign performance on the Account and Contact record pages, not only in a separate reporting tab.',
          'Reconcile MCI figures against platform figures and document the difference rather than picking the flattering one.',
          'Set a review cadence. A dashboard nobody reviews is decoration.',
        ]},
        { t: 'table', head: ['Question the business asks', 'Where the answer should appear'], rows: [
          ['Why did this customer buy?', 'Account and Opportunity record pages'],
          ['Which channel drove the pipeline?', 'Campaign and campaign member context'],
          ['Are we over-messaging this person?', 'Contact record, engagement history'],
          ['Which segment is saturating?', 'MCI or the reporting workspace'],
        ]},
        { t: 'selfcheck', q: 'A client compares two campaigns with different attribution models and concludes one performed better. What is wrong?', a: 'Attribution model choice explains the difference, not campaign performance. You cannot compare numbers produced by different models.' },
        { t: 'ex', id: 'ex-12-1', stars: 2, title: 'Pick the Reporting Surface', obj: 'Stop building dashboards nobody asked for.', verify: 'Six rows: reporting need, the surface you would use, and the build cost in days.', steps: [
          { h: 'Needs', items: [
            'Which campaign performed best last quarter.',
            'Which journey stage is leaking contacts.',
            'A bespoke board metric nobody has ever requested.',
            'Cross-channel attribution including non-email touches.',
            'Consent coverage by channel for an audit.',
            'Daily performance for 40 users who do not want to log in anywhere new.',
          ]},
          { h: 'Deliver', items: [
            'For each need, name the surface: standard report, custom report, dashboard, Marketing Cloud Intelligence, or a record-page insight.',
            'Give the build cost in days, including validation.',
            'Say which one you would refuse to build and what you would offer instead.',
          ]},
        ]},
        { t: 'ex', id: 'ex-12-2', stars: 2, title: 'Defend the Attribution Comparison', obj: 'Make two numbers comparable or admit they are not.', verify: 'A short method note: model, lookback, channel scope, the three things that had to match, and the sentence you would give the client.', steps: [
          { h: 'Scenario', items: [
            'Campaign A is measured last-click over a 7-day lookback on email only. Campaign B is measured first-touch over a 30-day lookback across email, SMS and paid.',
            'The client has already built a slide deck concluding B performed four times better than A.',
          ]},
          { h: 'Deliver', items: [
            'Name the three things that must match before the two numbers can be compared at all.',
            'Say what the honest comparison is, and what the misleading one is, in one sentence each.',
            'Recommend the model for this customer and justify it against their sales cycle length.',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 12 Quiz - Reports & Intelligence', mins: 5,
    questions: [
      { q: 'Marketing Cloud Intelligence was formerly known as what?',
        opts: ['Interaction Studio', 'Datorama', 'Audience Studio', 'Krux'], a: 1, why: 'Intelligence was formerly Datorama; Datorama Reports became Intelligence Reports for Engagement.' },
      { q: 'Which KPI is least reliable in 2026 and why?',
        opts: ['Conversion rate, because attribution is hard', 'Open rate, because privacy protections pre-load pixels', 'Bounce rate, because it is delayed', 'Delivery rate, because of throttling'], a: 1, why: 'Apple Mail Privacy Protection pre-fetches tracking images, so opens are no longer a reliable signal.' },
      { q: 'What is the exam-rewarded first move for a reporting requirement?',
        opts: ['Build a custom dashboard', 'Check whether a pre-built dashboard already fits', 'Buy Marketing Cloud Intelligence', 'Extract to CSV'], a: 1, why: 'The objective is to identify the pre-built dashboard that best addresses the requirement. Custom builds are the last resort.' },
      { q: 'Why can you not compare campaign results that used different attribution models?',
        opts: ['The numbers are stored differently', 'The model choice explains the difference, not the campaigns', 'Attribution is always wrong', 'You must use one model per brand'], a: 1, why: 'Different models produce different results for the same reality. Comparison requires a consistent model.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 13 - CERTIFICATION PREP                                                */
/* -------------------------------------------------------------------------- */
{
  id: 'cert',
  n: 13,
  title: 'Certification Prep',
  icon: '13',
  color: '#E11D48',
  tagline: 'Both blueprints, weighted study plan, exam tactics',
  guide: '13-Certification-Prep.md',
  art: [
    { label: 'Exam facts & blueprints (live page)', href: 'docs/index.html' },
    { label: 'Certification_Setting__mdt (MCE + MCN records)', href: 'force-app/main/default/customMetadata/Certification_Setting__mdt/' },
    { label: 'Mock exam simulator (60 Q, 105 min)', href: 'docs/index.html' },
  ],
  objectives: [
    'Know both exams cold: questions, time, pass mark, cost, prerequisite',
    'Study in blueprint-weight order, not in comfort order',
    'Manage 105 minutes for 60 questions',
    'Recognise the question types and the distractor patterns',
    'Pick the right credential for your career and your org access',
  ],
  lessons: [
    {
      title: 'The Two Exams Side by Side', mins: 10,
      blocks: [
        { t: 'p', x: 'Everything below is verified in the live Exam facts page, which is the single source of truth for this project. Re-verify before you book - Salesforce reissues exam guides.' },
        { t: 'table', head: ['', 'MCE Consultant', 'MCN Consultant'], rows: [
          ['Code', 'MCE-Con-201', 'MCN-Con-201'],
          ['Questions', '60 + unscored', '60 + up to 5 unscored'],
          ['Time', '105 min', '105 min'],
          ['Pass', '67% (reported 67-68%)', '72%'],
          ['Prerequisite', 'MCE Administrator', 'None'],
          ['Fee / retake', 'USD 200 / USD 100', 'USD 200 / USD 100'],
          ['Exam version', 'Varies', "Summer '26"],
          ['Heaviest domain', 'Data Modeling 21%', 'Campaign Design 30%'],
        ]},
        { t: 'p', x: 'Decision rule: if you have no hands-on MCN install and you already hold the MCE Administrator, sit MCE. If you have built or configured Marketing Cloud Next on Data 360, or you cannot get an MCE sandbox, sit MCN - it has no prerequisite.' },
        { t: 'h', x: 'Study in weight order' },
        { t: 'table', head: ['MCN domain', 'Weight', 'Questions in 60', 'Strategy'], rows: [
          ['Campaign Design, Flow Orchestration & Content', '30%', '~18', 'Deepest study. Biggest single return'],
          ['Data Modeling, Identity Resolution & Segmentation', '25%', '~15', 'Deep. Cross-link your Data 360 roadmap'],
          ['Platform Setup & Governance', '13%', '~8', 'Memorise the setup sequence'],
          ['Consent', '13%', '~8', 'Learn the data model, not the law'],
          ['Agentforce & AI Innovation', '11%', '~7', 'Learn the product family and the limits'],
          ['Analytics & Performance Insights', '8%', '~5', 'Easy marks if you read objectives literally'],
        ]},
        { t: 'selfcheck', q: 'Which gives the best return per hour of study on MCN?', a: 'Platform Setup & Governance and Analytics - 21% combined for relatively shallow learning - and Campaign Design, which is 30% and needs real depth. The 8% analytics domain is nearly free if you read the objectives literally.' },
      ]
    },
    {
      title: 'Exam Technique', mins: 9,
      blocks: [
        { t: 'num', items: [
          'Budget 1 minute 45 seconds per question. At 60 questions that is exactly 105 minutes, so there is no slack - pacing is a skill, not a hope.',
          'Flag anything over 90 seconds and move on. Unanswered questions cost the same as wrong ones, and a lost minute is unrecoverable.',
          'The 5 unscored questions are randomly integrated and do not affect your result. Answer all 65 and never try to identify which are which.',
          'Read the last sentence first. Scenario questions hide the actual requirement in the constraint, not the setup.',
          'On multiple-select, count the answers. If it reads "select two", there are exactly two - resist the third that sounds plausible.',
          'Eliminate before you evaluate. Three wrong options are usually visibly wrong; that is faster than justifying the right one.',
        ]},
        { t: 'table', head: ['Distractor pattern', 'Example', 'How to spot it'], rows: [
          ['Right answer, wrong scope', 'Correct tool, wrong environment', 'Check whether the question is MCE or MCN'],
          ['Doable but not compliant', 'Sends anyway, filters late', 'Look for the consent and quiet-hours constraint'],
          ['Simpler than the scenario', 'A DE when the requirement is real-time', 'Check whether the requirement says real-time'],
          ['Higher cost, same result', 'A Business Unit for a content variant', 'Ask whether governance really requires it'],
          ['Dead product', 'Advertising Studio, Audience Studio', 'Retired products appear as traps'],
        ]},
        { t: 'callout', kind: 'warn', x: 'The most reliable way to lose marks on MCN is answering MCE questions. If the option mentions Data Extensions and FTP, ask whether the scenario is actually a Data 360 one.' },
        { t: 'selfcheck', q: 'You are 40 questions in with 45 minutes left. What is the correct move?', a: 'Keep the 1:45 pace - that is exactly on plan. Do not speed up to "bank" time; you will misread the remaining questions and lose more than you gain.' },
      ]
    },
  ],
  quiz: {
    title: 'Phase 13 Quiz - Certification Prep', mins: 6,
    questions: [
      { q: 'What is the MCN Consultant prerequisite?',
        opts: ['MCE Administrator', 'MCE Email Specialist', 'None', 'Data 360 Consultant'], a: 2, why: 'The Marketing Cloud Next Consultant exam has no prerequisite certification.' },
      { q: 'What is the MCN passing score?',
        opts: ['65%', '67%', '72%', '68%'], a: 2, why: 'MCN Consultant is 72%. The 67-68% figures belong to the MCE track.' },
      { q: 'How long per question in a 105-minute, 60-question exam?',
        opts: ['1 min', '1 min 45 s', '2 min 30 s', '3 min'], a: 1, why: '105 x 60 / 60 = 105 seconds per question. There is no slack in the budget.' },
      { q: 'Which MCN domain is the heaviest?',
        opts: ['Consent', 'Analytics & Performance Insights', 'Campaign Design, Flow Orchestration & Content', 'Platform Setup & Governance'], a: 2, why: 'Campaign Design, Flow Orchestration & Content is 30%.' },
      { q: 'The MCE Consultant prerequisite is which credential?',
        opts: ['Marketing Cloud Engagement Administrator', 'Platform Administrator', 'Email Specialist', 'None'], a: 0, why: 'The MCE Consultant exam requires the Marketing Cloud Engagement Administrator credential.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 14 - PRACTICAL EXERCISES & MINI PROJECTS                               */
/* -------------------------------------------------------------------------- */
{
  id: 'practice',
  n: 14,
  title: 'Practical Exercises & Mini Projects',
  icon: '14',
  color: '#0369A1',
  tagline: 'Eight build-it-yourself projects with full solutions',
  guide: '14-Practical-Exercises-and-Mini-Projects.md',
  art: [
    { label: 'All solutions (guide 15)', href: 'developer%20Marketing%20Cloud%20Consultant%20Roadmap/15-Answers-and-Results.md' },
    { label: 'Training_Question__c (exercise tracking)', href: 'force-app/main/default/objects/Training_Question__c/' },
    { label: 'scripts/ (SOQL + Apex practice)', href: 'scripts/' },
  ],
  objectives: [
    'Build each artifact in the right tool rather than the familiar one',
    'Produce a defensible design document, not just a configuration',
    'Practise the migration and rollback conversation',
    'Validate every answer against the expected result',
  ],
  lessons: [
    {
      title: 'How to Use These Projects', mins: 6,
      blocks: [
        { t: 'p', x: 'Eight projects, each mapped to a phase. Every one has a requirements list and a success criterion, and every one has a full worked solution in phase 15. Do them on paper or in a sandbox - the point is the decision, not the clicking.' },
        { t: 'table', head: ['Project', 'Phase', 'Artifact produced'], rows: [
          ['MP-01 Edition & BU decision', '01 / 11', 'A one-page architecture decision record'],
          ['MP-02 Data extension model', '02', 'A relational DE design with keys and retention'],
          ['MP-03 Identity resolution rules', '03', 'Match and reconciliation rule definitions'],
          ['MP-04 Deliverability runbook', '04', 'DNS records, warm-up schedule, triage query'],
          ['MP-05 Personalised email build', '05', 'An email with AMPscript and Handlebars variants'],
          ['MP-06 Lifecycle flow design', '06', 'A flow design with entry, logic, waits and exits'],
          ['MP-07 SMS compliance gate', '08 / 10', 'A consent-aware send query with quiet hours'],
          ['MP-08 Advertising Studio migration', '09', 'A migration plan with rollback and match-rate validation'],
        ]},
        { t: 'callout', kind: 'tip', x: 'Write the decision before the configuration. If you cannot write why you chose a Data Extension over a query activity, you have not made the decision yet.' },
      ]
    },
    {
      title: 'Project Listing', mins: 8,
      blocks: [
        { t: 'proj', id: 'proj-01', stars: 2, title: 'MP-01 Edition and Business Unit Decision Record', obj: 'Practise the consultant recommendation and record it defensibly.', success: 'A one-page decision record that a client can sign off.', steps: [
          { h: 'Scenario', items: ['A fashion retailer on Salesforce Professional, 2 brands, 3 regions, 900k contacts, 2.5M emails/month, wants AI campaign creation and WhatsApp.'] },
          { h: 'Deliver', items: ['Recommend the edition and justify it against the core org constraint', 'Decide the Business Unit count and justify each one on governance grounds', 'Name the one thing that blocks go-live and how you would sequence around it'] },
        ]},
        { t: 'proj', id: 'proj-02', stars: 2, title: 'MP-02 Subscriber and Data Extension Model', obj: 'Design the data layer before you build it.', success: 'A DE design table with types, keys, relationships and retention.', steps: [
          { h: 'Scenario', items: ['An online retailer needs contact attributes, channel consent, a daily engagement segment, a per-send log and cross-channel suppression.'] },
          { h: 'Deliver', items: ['Design the DEs with types, primary keys and Subscriber Keys', 'Decide normalised vs denormalised and justify it', 'Set retention for every DE and justify each number'] },
        ]},
        { t: 'proj', id: 'proj-03', stars: 3, title: 'MP-03 Identity Resolution Rule Set', obj: 'Separate match from reconciliation - the most confused pair in Data 360.', success: 'Explicit match and reconciliation rules with the conflict cases resolved.', steps: [
          { h: 'Scenario', items: ['The same person exists as a Lead, a Contact and a commerce buyer, with conflicting phone numbers and one stale email.'] },
          { h: 'Deliver', items: ['Write the match rules and the order they evaluate in', 'Write the reconciliation rule for each conflicting field', 'State what the unified profile looks like afterwards'] },
        ]},
        { t: 'proj', id: 'proj-04', stars: 3, title: 'MP-04 Deliverability Runbook', obj: 'Produce the artefact a consultant actually hands over.', success: 'DNS records, an IP warm-up schedule and a triage query.', steps: [
          { h: 'Scenario', items: ['A new dedicated IP is about to send its first campaign of 400k messages.'] },
          { h: 'Deliver', items: ['Specify SPF, DKIM and DMARC records for the sending subdomain', 'Write a 14-day warm-up schedule with volumes and segment order', 'Write the triage query that identifies the failure mode by IP'] },
        ]},
        { t: 'proj', id: 'proj-05', stars: 2, title: 'MP-05 Personalised Email, Both Syntaxes', obj: 'Build the same personalisation twice - once per platform - and see the difference.', success: 'One MCE email in AMPscript and one MCN equivalent in Handlebars.', steps: [
          { h: 'Scenario', items: ['A welcome email with name fallback, device-aware hero, a repeat block of up to 3 recommendations and a compliant unsubscribe.'] },
          { h: 'Deliver', items: ['Build the MCE version in AMPscript with fallbacks on every field', 'Build the MCN version in Handlebars', 'List the three things that would break the MCE version in MCN'] },
        ]},
        { t: 'proj', id: 'proj-06', stars: 3, title: 'MP-06 Lifecycle Flow Design', obj: 'Design the flow, including the exits everyone forgets.', success: 'A flow with entry, decision, wait, exit and re-entry rules.', steps: [
          { h: 'Scenario', items: ['Cart abandonment, 30-day window, three value tiers, a conversion exit and a 90-day re-entry cooldown.'] },
          { h: 'Deliver', items: ['Choose the flow type and entry source and justify both', 'Design the tier decision and the wait logic', 'Define the conversion exit, the re-entry rule and the suppression behaviour'] },
        ]},
        { t: 'proj', id: 'proj-07', stars: 3, title: 'MP-07 Consent-Aware SMS Gate', obj: 'Build the query that makes a campaign compliant rather than apologetic.', success: 'A send query with consent, quiet hours, dedupe and suppression.', steps: [
          { h: 'Scenario', items: ['An SMS send to 250k contacts across four time zones, with a 10DLC opt-in list and a global suppression list.'] },
          { h: 'Deliver', items: ['Write the SQL with the consent predicate', 'Add time-zone-aware quiet hours that defer rather than drop', 'Add dedupe and suppression, and explain why each is not optional'] },
        ]},
        { t: 'proj', id: 'proj-08', stars: 4, title: 'MP-08 Advertising Studio Migration Plan', obj: 'Practise the highest-value conversation in Marketing Cloud right now.', success: 'A migration plan with phases, validation, cutover and rollback.', steps: [
          { h: 'Scenario', items: ['A customer is on Advertising Studio under a contract to March 2027, syncing to Google via Customer Match and Meta.'] },
          { h: 'Deliver', items: ['Map every Advertising Studio capability to its Data 360 equivalent', 'Sequence the migration so the contract is not the deadline', 'Define the match-rate validation and the rollback trigger'] },
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 14 Quiz - Practice Discipline', mins: 4,
    questions: [
      { q: 'Why write the decision before the configuration?',
        opts: ['It is faster', 'A decision you cannot justify in writing is a decision you have not made', 'Salesforce requires it', 'It avoids testing'], a: 1, why: 'If you cannot write why you chose it, you have not actually made the decision - you have just configured something.' },
      { q: 'What is the success criterion for MP-01?',
        opts: ['A working config', 'A one-page decision record the client can sign off', 'A passing quiz', 'A deployed org'], a: 1, why: 'The projects produce artefacts - decision records, designs, runbooks - not just configurations.' },
      { q: 'Which project is rated four stars and why?',
        opts: ['MP-06, because flows are hard', 'MP-08, because it is a live commercial situation with a rollback', 'MP-04, because DNS is hard', 'MP-02, because SQL is hard'], a: 1, why: 'MP-08 is the migration conversation with contractual and technical cutover risk.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 15 - ANSWERS & RESULTS                                                 */
/* -------------------------------------------------------------------------- */
{
  id: 'answers',
  n: 15,
  title: 'Answers & Results',
  icon: '15',
  color: '#0F766E',
  tagline: 'Full worked solutions for all exercises and projects',
  guide: '15-Answers-and-Results.md',
  art: [
    { label: 'Full answer key (guide 15)', href: 'developer%20Marketing%20Cloud%20Consultant%20Roadmap/15-Answers-and-Results.md' },
    { label: 'In-browser solutions (answers.js)', href: 'docs/assets/answers.js' },
  ],
  objectives: [
    'Self-grade every exercise against the expected result',
    'Read the common-mistakes list before you attempt, not after',
    'Track which domains your errors cluster in',
  ],
  lessons: [
    {
      title: 'Using the Answer Key', mins: 5,
      blocks: [
        { t: 'p', x: 'Every exercise in phases 1-12 and every project in phase 14 has a full solution here, in the browser under the exercise, and in this guide for the multi-part builds. Each answer carries an expected result and the common mistakes, which is the part that actually teaches.' },
        { t: 'num', items: [
          'Attempt first. An answer you read before trying teaches you nothing and feels like progress.',
          'Compare against the expected result, not against the wording. There is more than one correct design.',
          'Read the common mistakes even when you were right - you may have got there for a fragile reason.',
          'Log your errors by phase. The cluster is your study plan.',
          'Redo any exercise you had to look up, a week later, from a blank page.',
        ]},
        { t: 'table', head: ['If you struggled with', 'Go back to'], rows: [
          ['Keys, DE types, Data Views', 'Phase 2'],
          ['Match vs reconciliation, Actionable Lists', 'Phase 3'],
          ['SPF/DKIM/DMARC, warm-up, triage', 'Phase 4'],
          ['Fallbacks, Handlebars, consent gates', 'Phases 5 and 10'],
          ['Entry sources, splits, exits', 'Phase 6'],
          ['Which exam, which credential', 'Phase 13'],
        ]},
        { t: 'selfcheck', q: 'You got 80% of the phase 4 exercises wrong. What is the efficient response?', a: 'Go back to phase 4 content first, then redo the exercises. Redoing without re-reading is just repeated failure with a record.' },
      ]
    },
  ],
  quiz: {
    title: 'Phase 15 Quiz - Answer Discipline', mins: 3,
    questions: [
      { q: 'When should you read the common-mistakes list?',
        opts: ['Only when you got it wrong', 'Always, even when right', 'Never', 'Only before the exam'], a: 1, why: 'A right answer for a fragile reason is still a risk. The mistakes list shows you where the trap was.' },
      { q: 'What is the most useful way to log your errors?',
        opts: ['By date', 'By phase or domain, so the cluster becomes your study plan', 'By difficulty', 'Not at all'], a: 1, why: 'Errors cluster by domain. That cluster is a far better study plan than a chronological list.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 16 - REAL-WORLD USE CASES                                              */
/* -------------------------------------------------------------------------- */
{
  id: 'usecases',
  n: 16,
  title: 'Real-World Use Cases',
  icon: '16',
  color: '#B45309',
  tagline: 'Four consulting scenarios, briefed not solved',
  guide: '16-Real-World-Use-Cases.md',
  art: [
    { label: 'Full solutions (guide 17)', href: 'developer%20Marketing%20Cloud%20Consultant%20Roadmap/17-Use-Case-Solutions.md' },
    { label: 'JourneyEntryEventService', href: 'force-app/main/default/classes/JourneyEntryEventService.cls' },
  ],
  objectives: [
    'Read a brief the way a consultant reads a real one',
    'Identify the constraint that decides the architecture',
    'Produce a recommendation with trade-offs, not a list of features',
  ],
  lessons: [
    {
      title: 'The Four Scenarios', mins: 7,
      blocks: [
        { t: 'p', x: 'Four scenarios, briefed only. Full solutions with configuration, flows, reports, tests and answers are in phase 17. Attempt them the way you would attempt a real engagement: find the binding constraint first.' },
        { t: 'table', head: ['Case', 'Shape', 'The hard part'], rows: [
          ['UC1', 'Omnichannel lifecycle, retail', 'Sequencing three channels without annoying anyone'],
          ['UC2', 'B2B ABM and lead nurture', 'Identity across Sales and Marketing with consent'],
          ['UC3', 'AI-powered consent-first engagement', 'Agentforce on SMS and WhatsApp without breaking consent'],
          ['UC4', 'Marketing Cloud Engagement to Next migration', 'Running two platforms without losing the audience'],
        ]},
        { t: 'list', items: [
          'Read the constraint sentence twice. The binding constraint decides the architecture; the rest is preference.',
          'Ask what the system of record is for every attribute before proposing any sync.',
          'State the cost. A recommendation without a cost line will lose to a cheaper one.',
          'Always produce a rollback. A cutover with no rollback is a bet, not a plan.',
        ]},
        { t: 'ex', id: 'uc1', stars: 4, title: 'UC1 Omnichannel Lifecycle Campaign (Retail)', obj: 'Design a consent-safe, three-channel lifecycle program for a retailer.', verify: 'A recommendation document covering channel sequence, consent gates, suppression, exits and measurement.', steps: [
          { h: 'The brief', items: [
            'Omnichannel retailer, 1.2M loyalty members, growing 2.5% monthly. Wants email, SMS and WhatsApp in one program.',
            'Journey Builder exists for email only. SMS consent sits in a spreadsheet. WhatsApp is not yet set up.',
            'Marketing Cloud Engagement, Professional core edition, so Marketing Cloud Next is not available.',
            'Constraint: the CRM is losing SMS opt-ins every week because two systems write the list.',
            'Success is defined as incremental revenue, not engagement metrics.',
          ]},
          { h: 'Deliver', items: [
            'Fix the consent data model first, and explain why nothing else can be trusted until it is fixed',
            'Design the channel sequence and the per-channel consent gate',
            'Design the suppression and frequency policy across all three channels',
            'Say what you would NOT build, and why',
          ]},
        ]},
        { t: 'ex', id: 'uc2', stars: 4, title: 'UC2 B2B Account-Based Marketing and Lead Nurture', obj: 'Unify identity across Sales and Marketing and nurture without breaching consent.', verify: 'A design covering identity resolution, account selection, nurture orchestration and attribution.', steps: [
          { h: 'The brief', items: [
            'B2B software company, 40,000 contacts across Sales Cloud and Marketing Cloud, 600 target accounts.',
            'Leads captured by three systems. Marketing Cloud Connect is configured but scoped to one user.',
            'Sales asks for leads scored on buying intent; Marketing wants to nurture the whole buying group.',
            'Constraint: the buying group has 4-7 people and only one of them is ever in Marketing Cloud.',
            'Compliance: GDPR applies to EU contacts and the customer has no consent record for them.',
          ]},
          { h: 'Deliver', items: [
            'Design the identity resolution across Lead, Contact and account',
            'Decide the account selection model and justify it',
            'Design the nurture orchestration including the non-contact buying group members',
            'Design the attribution approach for a 6-month sales cycle',
          ]},
        ]},
        { t: 'ex', id: 'uc3', stars: 4, title: 'UC3 AI-Powered Consent-First Engagement', obj: 'Deploy Agentforce on SMS and WhatsApp with consent as a hard gate.', verify: 'A design with the agent scope, consent enforcement, human escalation and an intelligence dashboard.', steps: [
          { h: 'The brief', items: [
            'Financial services, 300k customers. Wants an Agentforce agent handling inbound SMS and WhatsApp.',
            'Two high-volume intents: balance enquiries and card-replacement requests. Everything else must go to a human.',
            'Regulated sector. No PII may be retained in the conversation beyond the retention window.',
            'Marketing Cloud Personalization is already deployed against a weak Data 360 profile.',
          ]},
          { h: 'Deliver', items: [
            'Define the agent scope, the escalation path and the human handoff criteria',
            'Design where consent is checked, and what the agent does when there is none',
            'Explain how you would fix the Data 360 profile so Personalization becomes useful',
            'Define the dashboard and the three metrics you would escalate on',
          ]},
        ]},
        { t: 'ex', id: 'uc4', stars: 4, title: 'UC4 Marketing Cloud Engagement to Marketing Cloud Next Migration', obj: 'Plan a coexistence migration that does not lose the audience or the audit trail.', verify: 'A phased migration plan with cutover, validation and rollback criteria.', steps: [
          { h: 'The brief', items: [
            'Subscription retailer, 8 years on Marketing Cloud Engagement, 45 journeys, 120 Data Extensions, core edition upgrading to Enterprise.',
            'Legal requires the full historical consent and send record to remain provable.',
            'Two Business Units today, with content built by an agency under a shared login.',
            'Constraint: the business case requires the WhatsApp channel, which the current edition does not include.',
          ]},
          { h: 'Deliver', items: [
            'Sequence the migration and state what stays in Engagement during coexistence',
            'Design the consent and send-record portability that satisfies legal',
            'Plan the agency access and content governance change',
            'Define the cutover criteria, the validation and the rollback trigger',
          ]},
        ]},
      ]
    },
  ],
  quiz: {
    title: 'Phase 16 Quiz - Scenario Reading', mins: 4,
    questions: [
      { q: 'In a consulting brief, what decides the architecture?',
        opts: ['The most modern feature available', 'The binding constraint stated in the brief', 'What the client asked for by name', 'The lowest cost option'], a: 1, why: 'The binding constraint decides the architecture. Everything else is preference around it.' },
      { q: 'Why must a recommendation include a cost line?',
        opts: ['To justify the timeline', 'Because without it a cheaper recommendation always wins', 'Because Salesforce requires it', 'To justify testing'], a: 1, why: 'A recommendation without a cost line loses to a cheaper one by default.' },
      { q: 'In UC1, what must be fixed before anything else can be trusted?',
        opts: ['The email templates', 'The consent data model', 'The Business Unit count', 'The IP pool'], a: 1, why: 'Two systems writing the SMS opt-in list means no downstream decision can be trusted until consent is modelled once.' },
    ]
  }
},

/* -------------------------------------------------------------------------- */
/* PHASE 17 - USE CASE SOLUTIONS                                                */
/* -------------------------------------------------------------------------- */
{
  id: 'solutions',
  n: 17,
  title: 'Use Case Solutions',
  icon: '17',
  color: '#166534',
  tagline: 'Full worked solutions for all four scenarios',
  guide: '17-Use-Case-Solutions.md',
  art: [
    { label: 'Solution document (guide 17)', href: 'developer%20Marketing%20Cloud%20Consultant%20Roadmap/17-Use-Case-Solutions.md' },
    { label: 'TriggeredSendService', href: 'force-app/main/default/classes/TriggeredSendService.cls' },
    { label: 'force-app/ (the Salesforce-core side of each solution)', href: 'force-app/main/default/' },
  ],
  objectives: [
    'Compare your answer to a defensible reference solution',
    'See the reasoning, not just the configuration',
    'Extract the reusable pattern for your own engagements',
  ],
  lessons: [
    {
      title: 'Solution Patterns Worth Stealing', mins: 8,
      blocks: [
        { t: 'p', x: 'The four solutions are in phase 17 with full configuration, flows, reports, tests and answers. The patterns below are the parts that transfer to any engagement.' },
        { t: 'table', head: ['Pattern', 'From', 'Reuse it when'], rows: [
          ['Consent before activation', 'UC1 / UC3', 'Always. Consent gates the audience, not the send'],
          ['Cross-channel frequency cap', 'UC1', 'Any multi-channel program'],
          ['Identity across systems first', 'UC2 / UC4', 'Before any segmentation or scoring'],
          ['Buying-group nurture', 'UC2', 'B2B with more than one stakeholder'],
          ['Human escalation boundary', 'UC3', 'Any agent in a regulated channel'],
          ['Coexistence with rollback', 'UC4', 'Any platform migration'],
        ]},
        { t: 'list', items: [
          'Every solution states what it deliberately does NOT build. Scope discipline is a consulting skill.',
          'Every solution names the system of record per attribute. Ambiguity there is where projects die.',
          'Every solution includes a rollback. If yours does not, it is not finished.',
          'Every solution has a validation step before cutover, with a numeric threshold.',
          'Every solution carries a cost line and a named owner for each decision.',
        ]},
        { t: 'callout', kind: 'tip', x: 'Read UC4 twice. The coexistence migration is the scenario that most resembles the work consultants are actually being asked to do right now.' },
        { t: 'selfcheck', q: 'Your UC2 solution used a nurture for the whole buying group but had no identity work. What is the gap?', a: 'You cannot nurture a buying group you cannot identify. Identity resolution across Lead, Contact and account has to come first, or the non-contact stakeholders stay invisible.' },
      ]
    },
  ],
  quiz: {
    title: 'Phase 17 Quiz - Solution Quality', mins: 4,
    questions: [
      { q: 'Which is the one pattern that applies to every engagement?',
        opts: ['IP warming', 'Consent gating the audience before activation', 'A dedicated IP', 'A Business Unit'], a: 1, why: 'Consent has to gate segmentation and activation. Everything else is situational.' },
      { q: 'What must every solution include?',
        opts: ['A dedicated IP', 'A rollback and a numeric cutover validation threshold', 'A Business Unit', 'An IP warm-up'], a: 1, why: 'A cutover with no rollback is a bet, not a plan, and validation without a threshold is not validation.' },
      { q: 'Why read UC4 twice?',
        opts: ['It is the shortest', 'Coexistence migration is the scenario closest to current consulting demand', 'It has the most SQL', 'It is the easiest'], a: 1, why: 'Marketing Cloud Engagement to Next coexistence is the live commercial problem in 2026.' },
    ]
  }
},

];
