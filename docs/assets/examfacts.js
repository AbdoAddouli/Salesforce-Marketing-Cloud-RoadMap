/* =============================================================================
 * Marketing Cloud Consultant Academy - EXAM FACTS
 * Single source of truth for certification facts. Feeds:
 *   - the "Exam facts & blueprints" page  (#/facts)
 *   - the mock exam simulator               (#/mock)
 *   - guide 13 (Certification Prep)
 *   - README.md
 *   - force-app .../customMetadata/Certification_Setting__mdt
 *
 * VERIFIED: 2026-09-26 via web search against the official Salesforce exam
 * guides. Exam facts drift - re-run verification before each exam attempt and
 * bump `verifiedOn`. Sources are listed in `sources` below.
 * ========================================================================== */

const EXAM_FACTS = {
  title: 'Marketing Cloud Consultant exam facts',
  sub: 'Two certifications, two very different blueprints. The legacy Engagement Consultant track is a Marketing Cloud Engagement exam. The Next Consultant track is a Salesforce-platform exam built on Data 360, Flow and Agentforce. Know which one you are sitting before you study a single objective.',
  verifiedOn: '2026-09-26',
  seed: 'mcn-consultant-v1',
  mock: 60,

  /* ---------------------------------------------------------------- tracks */
  tracks: [
    {
      code: 'MCE-Con-201',
      name: 'Salesforce Certified Marketing Cloud Engagement Consultant',
      tagline: 'The legacy / classic track. You configure and extend Marketing Cloud Engagement: Contact Builder, Email Studio, Journey Builder, Automation Studio, Content Builder and Marketing Cloud Connect. Expect scenario questions about setup, data, automation and integration.',
      color: '#38bdf8',
      pass: 67,
      facts: [
        { k: 'Questions', v: '60 multiple-choice / multiple-select, plus unscored items' },
        { k: 'Time', v: '105 minutes' },
        { k: 'Passing score', v: '67% (reported 67-68% across sources - re-verify)' },
        { k: 'Prerequisite', v: 'Marketing Cloud Engagement Administrator' },
        { k: 'Fee', v: 'USD 200 / JPY 30,000' },
        { k: 'Retake', v: 'USD 100' },
        { k: 'Materials', v: 'None - closed book' },
        { k: 'Experience', v: '6-12 months hands-on' }
      ],
      pacing: '105 minutes for 60 questions is 1 min 45 s per question. Multiple-select questions cost more - cap them at 2 min 30 s and move on.',
      note: 'Renamed. The old "Salesforce Certified Marketing Cloud Consultant" (prereq: Marketing Cloud Email Specialist, 68% pass, 2018 guide) is now the Marketing Cloud Engagement Consultant, and its prerequisite is the Marketing Cloud Engagement Administrator. Older blogs, dumps and slides still quote the old name, the old prereq and 68% - do not trust them.',
      domains: [
        { name: 'Discovery & Architecture', weight: 16, color: '#38bdf8' },
        { name: 'Integration', weight: 20, color: '#22d3ee' },
        { name: 'Account Configuration', weight: 12, color: '#34d399' },
        { name: 'Automation', weight: 20, color: '#a78bfa' },
        { name: 'Data Modeling & Management', weight: 21, color: '#fbbf24' },
        { name: 'Messaging', weight: 11, color: '#fb923c' }
      ],
      objectives: [
        'Discovery: articulate how the data construct drives one-to-one messaging and content; explain IP warming and recommend it from a customer need',
        'Marketing Cloud Connect: prerequisites before configuration (Salesforce edition, integration users, scoped user, admin credentials); send email to a contact, lead, campaign and report from Sales/Service Cloud; segment Sales/Service Cloud data inside Marketing Cloud',
        'Account configuration: recommend the right Marketing Cloud role from user stories; decide when a business unit is warranted; manage users, roles, IP pools and sending',
        'Data modeling: data extensions, list model, retention, publication lists, suppression lists; data types and send-log design; relational model and SQL; database-of-record implications; import method with lists vs data extensions',
        'Automation: scheduled vs triggered automations, activity types, file transfer, SQL activities, data extract, error handling',
        'Messaging: Content Builder, Email Studio, journey and campaign design, deliverability, unsubscribe and contact delete behaviour',
        'Reporting: standard reports vs data views vs tracking extracts; send logs and how to use them'
      ]
    },
    {
      code: 'MCN-Con-201',
      name: 'Salesforce Certified Marketing Cloud Next Consultant',
      tagline: 'The new track. Marketing Cloud Next is built natively on Salesforce core and Data 360, orchestrated with Flow, and driven by Agentforce. This is a Salesforce-platform consulting exam, not a Marketing Cloud Engagement configuration exam.',
      color: '#a78bfa',
      pass: 72,
      facts: [
        { k: 'Questions', v: '60 multiple-choice, plus up to 5 unscored' },
        { k: 'Time', v: '105 minutes' },
        { k: 'Passing score', v: '72%' },
        { k: 'Prerequisite', v: 'None' },
        { k: 'Fee', v: 'USD 200 / JPY 30,000' },
        { k: 'Retake', v: 'USD 100 / JPY 15,000' },
        { k: 'Materials', v: 'None - closed book' },
        { k: 'Exam version', v: "Summer '26 release" },
        { k: 'Experience', v: '6-12 months hands-on' }
      ],
      pacing: '72% is a high bar for 60 questions - that is 44 correct. Budget 1 min 45 s per question and do not let a hard one eat the clock. The 5 unscored questions are randomly integrated and do not affect your result, so answer everything.',
      note: 'Heaviest domains are Campaign Design, Flow Orchestration & Content (30%) and Data Modeling, Identity Resolution & Segmentation (25%) - together 55% of the paper. Platform Setup & Governance and Consent are 13% each and are the easiest points on the exam if you have actually done an MCN install.',
      domains: [
        { name: 'Campaign Design, Flow Orchestration & Content', weight: 30, color: '#a78bfa' },
        { name: 'Data Modeling, Identity Resolution & Segmentation', weight: 25, color: '#38bdf8' },
        { name: 'Platform Setup & Governance', weight: 13, color: '#34d399' },
        { name: 'Consent', weight: 13, color: '#fbbf24' },
        { name: 'Agentforce & AI Innovation', weight: 11, color: '#f472b6' },
        { name: 'Analytics & Performance Insights', weight: 8, color: '#fb923c' }
      ],
      objectives: [
        'Platform Setup & Governance (13%): environment setup for MCN including Core org Edition requirements, Data 360 provisioning, Marketing Data Kit installation and permission sets',
        'Platform Setup & Governance (13%): identify when Business Units are required and configure a content and user governance model using roles and Enhanced CMS Workspaces',
        'Platform Setup & Governance (13%): configure self-service domain authentication or domain authorization for branded, authenticated email delivery',
        'Consent (13%): consent management concepts and the role of consent in engagement and compliance',
        'Consent (13%): purpose and relationships of the platform consent objects used to capture and manage consent preferences',
        'Consent (13%): determine the appropriate method for creating, managing and updating consent records from a business requirement',
        'Consent (13%): configure a consent banner on marketing landing pages and external pages to support consent collection',
        'Data Modeling, Identity Resolution & Segmentation (25%): Data 360 data object concepts - connect, harmonize, unify and activate customer data for segmentation and content personalization',
        'Data Modeling (25%): ingest and use CRM data (objects, records, Actionable Lists) for audience segmentation, activation and content personalization',
        'Data Modeling (25%): configure Identity Resolution to link multiple data sources into a unified profile',
        'Data Modeling (25%): Data 360 consumption-based entitlements, and evaluate how marketing automation design decisions impact platform consumption and usage',
        'Campaign Design, Flow Orchestration & Content (30%): personalization using Handlebars, AMPscript, merge fields, repeaters and content variations',
        'Campaign Design (30%): determine the appropriate flow type, trigger conditions and configuration settings for a marketing or messaging outcome',
        'Campaign Design (30%): determine the appropriate data source to add personalized customer data to messaging content',
        'Campaign Design (30%): identify the appropriate flow elements, logic and configuration to automate business processes and messaging activities',
        'Analytics & Performance Insights (8%): identify the pre-built dashboard that best addresses reporting and analytics requirements; describe how to surface marketing data and insights across the Salesforce platform'
      ]
    }
  ],

  /* ------------------------------------------------------------- the ladder */
  ladder: [
    {
      name: 'Marketing Cloud Engagement Foundations',
      pre: 'None (free)',
      why: 'Free entry credential, 5 domains. Use it to prove the fundamentals before you pay USD 200 for anything.'
    },
    {
      name: 'Marketing Cloud Engagement Specialist',
      pre: 'None',
      why: 'Email-side fundamentals: automation, subscriber/data management, content, analytics. Not a prereq for the Consultant exam any more, but the cheapest way to find the gaps.'
    },
    {
      name: 'Marketing Cloud Engagement Administrator',
      pre: 'None',
      why: 'REQUIRED prerequisite for the MCE Consultant exam. If you are sitting MCE and do not hold this, book it first.'
    },
    {
      name: 'Marketing Cloud Engagement Consultant',
      pre: 'MCE Administrator',
      why: 'The legacy consultant credential. Marketing Cloud Engagement configuration, data, automation, Connect.'
    },
    {
      name: 'Marketing Cloud Next Consultant',
      pre: 'None',
      why: 'The new consultant credential. No prerequisite, so you can book it immediately - but it assumes you have done an MCN install on Data 360.'
    },
    {
      name: 'Data 360 Consultant',
      pre: 'None',
      why: 'Not required, but MCN leans on Data 360 identity resolution and entitlements so heavily that this removes about half the study load.'
    },
    {
      name: 'Agentforce Specialist',
      pre: 'None',
      why: 'Covers the 11% Agentforce & AI Innovation domain and the Agentforce Marketing product family.'
    },
    {
      name: 'Platform Administrator',
      pre: 'None',
      why: 'Permission sets, roles, SSO, data governance - the Platform Setup & Governance domain assumes you already know this.'
    }
  ],

  /* ------------------------------------------- renames and retired products */
  renames: [
    { old: 'Marketing Cloud Consultant (2018 guide)', now: 'Marketing Cloud Engagement Consultant', impact: 'Same exam lineage, renamed. Prereq moved from Email Specialist to Engagement Administrator.' },
    { old: 'Marketing Cloud Administrator', now: 'Marketing Cloud Engagement Administrator', impact: 'Renamed. It is the MCE Consultant prerequisite.' },
    { old: 'Data Cloud', now: 'Data 360', impact: 'Renamed. "Data Cloud Ad Audiences" is now "Data 360 Ad Audiences". Exam objectives already say Data 360.' },
    { old: 'Marketing Cloud Growth / Marketing Cloud Advanced', now: 'Marketing Cloud Next (Growth and Advanced editions)', impact: 'The Growth and Advanced step-stone editions are now the two editions of Marketing Cloud Next. Requires Salesforce Enterprise or Unlimited, Lightning Experience only.' },
    { old: 'Interaction Studio', now: 'Marketing Cloud Personalization', impact: 'Renamed. If you see Interaction Studio in study material, it is a 5-year-old doc.' },
    { old: 'Datorama / Datorama Reports', now: 'Marketing Cloud Intelligence / Intelligence Reports for Engagement', impact: 'Renamed. Datorama is still the underlying platform name.' },
    { old: 'Advertising Studio / Advertising Audiences / Journey Builder Advertising', now: 'RETIRED - non-renewable from 15 Aug 2026', impact: 'Replaced by Data 360 Ad Audiences. Do not design new solutions on Advertising Studio. Google also replaced Customer Match with the Data Manager API (cutover 1 Apr 2026), so legacy ad syncs break.' },
    { old: 'Social Studio', now: 'Sunset', impact: 'Gone. Any curriculum still teaching it is out of date.' },
    { old: 'Audience Studio (DMP / Krux)', now: 'Retired 1 Feb 2024, data deleted', impact: 'Gone. Data 360 is the strategic replacement.' },
    { old: 'MobileConnect / MobilePush / GroupConnect', now: 'Mobile Studio + Unified Messaging', impact: 'Still active. "Unified Messaging" is the current branded service name for authenticated cross-channel sending.' },
    { old: 'Einstein for Marketing', now: 'Agentforce Marketing', impact: 'Send Time Optimization, Content Selection and Copy Insights are now part of the Agentforce Marketing family.' }
  ],

  /* --------------------------------------------------------- the question bank */
  /* 5 questions per MCN blueprint domain. `a` is the index of the correct option. */
  bank: [
    /* --- Campaign Design, Flow Orchestration & Content (30%) --- */
    { id: 'cd1', domain: 'Campaign Design, Flow Orchestration & Content', q: 'A retailer wants a cart-abandonment journey in Marketing Cloud Next. Which flow type do you configure?', opts: ['A record-triggered flow on the Data 360 Contact Point', 'An autolaunched flow with no trigger', 'A scheduled flow that runs every night', 'A record-triggered flow on the Campaign object'], a: 0, why: 'Journey-style behaviour in MCN is a record-triggered flow whose entry is the Data 360 contact point (or an Actionable List) for that event. A scheduled flow is for batch, an autolaunched flow is for sub-processes, and Campaign is the container, not the trigger.' },
    { id: 'cd2', domain: 'Campaign Design, Flow Orchestration & Content', q: 'Which personalization syntax is native to Marketing Cloud Next and is NOT available in Marketing Cloud Engagement?', opts: ['AMPscript', 'SSJS', 'Handlebars', 'Merge fields'], a: 2, why: 'Handlebars is the MCN content templating syntax. AMPscript, SSJS and merge fields are Marketing Cloud Engagement (and still available in MCN for compatibility), but Handlebars is the MCN-native option.' },
    { id: 'cd3', domain: 'Campaign Design, Flow Orchestration & Content', q: 'You need the same email to show three different hero banners by product category. What do you configure?', opts: ['A content variation / repeater block', 'Three separate data extensions', 'A suppression list', 'An IP pool'], a: 0, why: 'Content variations and repeaters are the content-level answer to conditional or repeated content. Extra data extensions and suppression lists are data/deliverability concerns, and an IP pool has nothing to do with creative.' },
    { id: 'cd4', domain: 'Campaign Design, Flow Orchestration & Content', q: 'A marketer wants a 3-day wait between two messages in a marketing flow. Which flow element do you use?', opts: ['A scheduled path', 'A wait element / time delay on the path', 'A decision split on a date field', 'A hold-and-release rule'], a: 1, why: 'A wait element (or configured delay) on the path is the direct answer. Scheduled paths are for batch sends, a decision split branches on data, and hold-and-release is a deliverability throttle, not a delay.' },
    { id: 'cd5', domain: 'Campaign Design, Flow Orchestration & Content', q: 'Which is the correct source of personalized customer data inside a Marketing Cloud Next message?', opts: ['The Data 360 Data Model Object mapped into the flow, or an Actionable List', 'A CSV uploaded to the Marketing Cloud FTP', 'A Salesforce report attached to the email', 'The campaign member list'], a: 0, why: 'MCN content is fed by Data 360 - Data Model Objects and Actionable Lists. FTP files and Salesforce reports are Marketing Cloud Engagement patterns, not the MCN data path.' },

    /* --- Data Modeling, Identity Resolution & Segmentation (25%) --- */
    { id: 'dm1', domain: 'Data Modeling, Identity Resolution & Segmentation', q: 'What is the purpose of an Identity Resolution match rule in Data 360?', opts: ['Decide which profile wins when two records match', 'Encrypt PII at rest', 'Decide who may see a segment', 'Schedule a data ingest'], a: 0, why: 'Match rules define the rules for linking records into one unified profile; reconciliation rules then decide the surviving value on conflict. The other options are security, sharing and ingestion concerns.' },
    { id: 'dm2', domain: 'Data Modeling, Identity Resolution & Segmentation', q: 'What is an Actionable List in Data 360 / Marketing Cloud Next?', opts: ['A governed, reusable audience stored in Data 360 that campaigns activate from', 'A suppression list of unsubscribes', 'A Data Extension with a send log', 'A list of IP addresses'], a: 0, why: 'Actionable Lists are the MCN activation surface - reusable, governed audiences built from Data 360 segments and used as campaign entries. Data Extensions and suppression lists are the MCE equivalents.' },
    { id: 'dm3', domain: 'Data Modeling, Identity Resolution & Segmentation', q: 'A customer sends 5 million messages a month and their Data 360 consumption is spiking. What is the consultant move?', opts: ['Batch the sends and review consumption-based entitlements against the flow design', 'Move everything to SMS to save credits', 'Add more Data Spaces', 'Disable Identity Resolution'], a: 0, why: 'The objective explicitly asks candidates to understand consumption-based entitlements and how automation design impacts usage. Batching, deduplication and reducing unnecessary flow evaluations are the levers.' },
    { id: 'dm4', domain: 'Data Modeling, Identity Resolution & Segmentation', q: 'Why does a consultant add the Marketing Data Kit during an MCN implementation?', opts: ['To install the standard CRM-to-Data 360 mapping objects that support segmentation and activation', 'To migrate historical email sends from the legacy platform', 'To configure SPF and DKIM', 'To install the mobile SDK'], a: 0, why: 'The Marketing Data Kit provides the prebuilt Data 360 objects and mappings for CRM data. Authentication is a domain-authentication task and the SDK is for MobilePush apps.' },
    { id: 'dm5', domain: 'Data Modeling, Identity Resolution & Segmentation', q: 'A customer has the same person as a Lead, a Contact and a commerce buyer. What do you configure first?', opts: ['Identity Resolution match rules across those sources into a unified profile', 'A duplicate rule on the Campaign object', 'A shared Data Extension with a shared primary key', 'A Business Unit per source'], a: 0, why: 'Unifying the person across systems is exactly what Identity Resolution does. Data Extensions with a shared key are the old MCE workaround; it does not give you a profile.' },

    /* --- Platform Setup & Governance (13%) --- */
    { id: 'ps1', domain: 'Platform Setup & Governance', q: 'Which Salesforce core org editions are required to run Marketing Cloud Next?', opts: ['Enterprise and Unlimited only', 'Professional and above', 'Any edition with Marketing Cloud Growth', 'Developer and sandbox only'], a: 0, why: 'Marketing Cloud Next is available in Growth and Advanced editions and requires Salesforce Enterprise or Unlimited. It is Lightning Experience only.' },
    { id: 'ps2', domain: 'Platform Setup & Governance', q: 'When does a customer genuinely need a Business Unit in Marketing Cloud?', opts: ['When brands, regions or legal entities need separate content, users and data governance', 'Whenever more than 100k records exist', 'For every Data Space', 'Whenever Journey Builder is used'], a: 0, why: 'Business Units exist for content and user governance separation - brand, region or legal entity. They are not a data-volume or volume-of-traffic answer, and a Data Space is a Data 360 concept.' },
    { id: 'ps3', domain: 'Platform Setup & Governance', q: 'A customer wants marketers to edit content without seeing each other\'s drafts, while admins keep full control. What do you configure?', opts: ['Roles plus Enhanced CMS Workspaces', 'A permission set granting Modify All', 'A shared Data Space', 'An approval process on the Data Space'], a: 0, why: 'The objective names roles and Enhanced CMS Workspaces as the content and user governance model. Modify All defeats the purpose; a Data Space is a data concept.' },
    { id: 'ps4', domain: 'Platform Setup & Governance', q: 'What does self-service domain authentication give a Marketing Cloud Next customer?', opts: ['Branded, authenticated email delivery managed from inside the platform', 'Automatic GDPR deletion requests', 'A Data 360 identity graph', 'An Agentforce content approval workflow'], a: 0, why: 'Self-service domain authentication / domain authorization is exactly the branded authenticated delivery objective. The other options belong to other domains.' },
    { id: 'ps5', domain: 'Platform Setup & Governance', q: 'Which is NOT a Marketing Cloud Next setup step?', opts: ['Installing the Marketing Cloud Engagement-style FTP automation studio', 'Provisioning Data 360', 'Installing the Marketing Data Kit', 'Assigning permission sets'], a: 0, why: 'Automation Studio FTP automations are a Marketing Cloud Engagement construct. MCN setup is Data 360 provisioning, Marketing Data Kit, permission sets and domain authentication.' },

    /* --- Consent (13%) --- */
    { id: 'cs1', domain: 'Consent', q: 'Which statement about consent records is correct?', opts: ['Consent is modelled as platform objects that capture, store and relate the preferences', 'Consent is only a boolean on the Contact', 'Consent is enforced by the email template', 'Consent expires automatically after 90 days'], a: 0, why: 'The objective asks for the purpose AND relationships of the platform consent objects. It is a real data model with relationships, not a single field or a template setting.' },
    { id: 'cs2', domain: 'Consent', q: 'A customer wants to collect consent on their own website, outside Marketing Cloud. What do you configure?', opts: ['A consent banner for external pages', 'A Data Extension send log', 'An IP pool warming schedule', 'A Business Unit role'], a: 0, why: 'Consent banners can be configured on marketing landing pages AND external pages. Everything else is unrelated to consent capture.' },
    { id: 'cs3', domain: 'Consent', q: 'A customer changes their mind and opts out of SMS but not email. What is the correct outcome?', opts: ['Channel-level consent records: the SMS consent is revoked and email consent remains', 'All consent is revoked because consent is account-level', 'Nothing changes until the next data sync', 'The subscriber is deleted'], a: 0, why: 'Consent is captured per channel and per purpose. A single opt-out must not silently revoke other channels, and it must never delete the subscriber.' },
    { id: 'cs4', domain: 'Consent', q: 'Which regulation most directly governs commercial email consent and opt-out in the EU/UK?', opts: ['GDPR (plus ePrivacy rules on direct marketing)', 'CAN-SPAM', 'CCPA', 'CASL'], a: 0, why: 'GDPR with the ePrivacy/PECR direct-marketing rules governs the EU and UK. CAN-SPAM is US commercial email, CCPA is California privacy, CASL is Canada.' },
    { id: 'cs5', domain: 'Consent', q: 'A marketer builds an audience from Data 360 without checking consent status. What is the consultant response?', opts: ['Refuse - consent is the gate on segmentation and activation, not a send-time filter', 'Add an exclusion at send time', 'Ask the customer to accept the risk in writing', 'Add a suppression list after the send'], a: 0, why: 'Consent has to gate the audience, otherwise personalisation and measurement are already non-compliant. A send-time filter is too late and does not fix the data model.' },

    /* --- Agentforce & AI Innovation (11%) --- */
    { id: 'ai1', domain: 'Agentforce & AI Innovation', q: 'What is Agentforce Marketing best described as?', opts: ['The AI agent family that creates, optimizes and personalises marketing on Salesforce and Data 360', 'A replacement for Automation Studio', 'A Data 360 identity resolution engine', 'An email deliverability tool'], a: 0, why: 'Agentforce Marketing is the AI layer - campaign creation, decisioning, next-best-action, content generation. It does not replace the automation or the data layer.' },
    { id: 'ai2', domain: 'Agentforce & AI Innovation', q: 'Send Time Optimization predicts the best time to send. What does it need in order to be accurate?', opts: ['Enough historical send and engagement data on the unified profile', 'A dedicated IP pool', 'A Journey Builder entry source', 'An Agentforce topic'], a: 0, why: 'STO is a predictive model over past sends and engagement. Without history it has nothing to learn from; the other options are infrastructure, not model inputs.' },
    { id: 'ai3', domain: 'Agentforce & AI Innovation', q: 'A customer wants an AI agent to qualify and route inbound SMS and WhatsApp. What is the right home for it?', opts: ['An Agentforce agent handling the conversational channel, with marketing consent respected', 'A Journey Builder decision split', 'A Data 360 match rule', 'A Content Builder dynamic block'], a: 0, why: 'Conversational qualification and routing is an agent use case on the messaging channel. The other three are segmentation, identity and content features.' },
    { id: 'ai4', domain: 'Agentforce & AI Innovation', q: 'What is the consultant risk to flag when recommending AI-generated email content at scale?', opts: ['Brand, factual accuracy and consent/regulatory review must stay in the loop', 'It always reduces open rates', 'It cannot be personalised', 'It requires a Business Unit per brand'], a: 0, why: 'The realistic consulting answer is governance - human review for brand and claims, and no personalisation of sensitive data without consent. The absolute claims in the other options are false.' },
    { id: 'ai5', domain: 'Agentforce & AI Innovation', q: 'Where does an engagement score used for AI decisioning live?', opts: ['On the Data 360 unified profile, computed from cross-channel activity', 'In a Marketing Cloud Engagement Data Extension only', 'In the IP warming schedule', 'In the Salesforce report folder'], a: 0, why: 'MCN scoring rules compute engagement and fit scores on the unified profile in Data 360. An MCE Data Extension is the legacy pattern and does not feed MCN decisioning.' },

    /* --- Analytics & Performance Insights (8%) --- */
    { id: 'an1', domain: 'Analytics & Performance Insights', q: 'A marketer wants a campaign performance view without building anything. What do you use?', opts: ['A pre-built Marketing Cloud dashboard', 'A custom Apex trigger', 'A Data Extension', 'An Automation Studio SQL activity'], a: 0, why: 'The objective is literally "identify a pre-built dashboard that best addresses the reporting requirement". Building is the wrong instinct here.' },
    { id: 'an2', domain: 'Analytics & Performance Insights', q: 'What is the role of Marketing Cloud Intelligence?', opts: ['A governed marketing data mart for cross-channel analysis and attribution', 'A send-time optimizer', 'A consent store', 'A Journey canvas'], a: 0, why: 'MCI (formerly Datorama) is the analytics layer - it ingests marketing and CRM data into a governed model for cross-channel analysis, segmentation and attribution.' },
    { id: 'an3', domain: 'Analytics & Performance Insights', q: 'How does the exam expect you to "surface marketing data and insights across the Salesforce platform"?', opts: ['Place the marketing insight where the user already works - CRM record pages, the marketing app and reports', 'Export everything to CSV monthly', 'Only use the Marketing Cloud reporting tab', 'Email a daily digest'], a: 0, why: 'The point is in-context surfacing, not extraction. Bringing the insight to the record page beats making the user go and fetch it.' },
    { id: 'an4', domain: 'Analytics & Performance Insights', q: 'A customer measures every channel but cannot answer "which touch drove the sale". What do you add?', opts: ['An attribution model across the touchpoints', 'More IP pools', 'A longer IP warm-up', 'A second Business Unit'], a: 0, why: 'That is an attribution modelling gap. The other options are deliverability and org-structure changes and will not answer the question.' },
    { id: 'an5', domain: 'Analytics & Performance Insights', q: 'Which KPI set best describes a healthy email program?', opts: ['Delivery, bounce, open, click, conversion and unsubscribe rate, read together', 'Open rate alone', 'Total contacts on the list', 'Number of Data Extensions'], a: 0, why: 'Any single KPI can be gamed or gamed by bad deliverability. Open rate in isolation is the classic trap - a high open rate with a high spam-complaint rate is a failure.' }
  ],

  /* ------------------------------------------------------------- provenance */
  sources: [
    'Salesforce Help - Salesforce Certified Marketing Cloud Next Consultant Exam Guide (article 005387657). Facts: 60 MCQ + up to 5 unscored, 105 min, 72% pass, prerequisite none, Summer \'26 release, USD 200 / JPY 30,000, retake USD 100 / JPY 15,000, and the six weighted sections.',
    'Trailhead - Prepare for Your Marketing Cloud Next Consultant Certification. Confirms the MCN module framing (consent, Data 360, identity resolution match rules, flow builder elements, contact points and source priority order, reporting).',
    'Trailhead credential page - Salesforce Certified Marketing Cloud Engagement Consultant. Confirms the prerequisite is the Marketing Cloud Engagement Administrator.',
    'Salesforce Help - Salesforce Certification Exam Pricing. Confirms consultant-tier pricing: USD 200 / JPY 30,000, retake USD 100.',
    'Salesforce Help - Feature Availability by Marketing Cloud Next Edition. Confirms MCN is available in Growth and Advanced editions, requires Salesforce Enterprise or Unlimited, Lightning Experience only.',
    'Salesforce Help - Retirement of Marketing Cloud Advertising Studio. Subscriptions non-renewable from 15 Aug 2026; directed to Data Cloud Ad Audiences.',
    'Salesforce - Marketing Cloud Notice and License Information (published 22 May 2026). Confirms the renames: Marketing Cloud Next (formerly Growth and Advanced editions), Marketing Cloud Personalization (formerly Interaction Studio), Intelligence (formerly Datorama), Data 360, Unified Messaging.'
  ]
};
