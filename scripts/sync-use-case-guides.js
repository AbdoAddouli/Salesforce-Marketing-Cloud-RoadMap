/**
 * sync-use-case-guides.js
 *
 * Rebuilds guides 16 and 17 from a single source of truth:
 *
 *   - the briefs come from docs/assets/curriculum.js (phase 16 exercises)
 *   - the solutions come from docs/assets/answers.js (uc1..uc4)
 *
 * Those two files already drive the interactive academy, so writing the guides
 * by hand guaranteed drift: the browser showed one set of scenarios and the
 * Markdown showed another. Generating both guides removes the duplication.
 *
 * Run: node scripts/sync-use-case-guides.js
 * Or:  npm run docs:sync
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const CANON = path.join(ROOT, 'developer Marketing Cloud Consultant Roadmap');
const MIRROR = path.join(ROOT, 'docs', 'guide');

/** Load curriculum.js by evaluating it, because it exposes ACADEMY as a top-level const. */
function loadAcademy() {
  const source = fs.readFileSync(path.join(ROOT, 'docs', 'assets', 'curriculum.js'), 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(source + '\n;this.__ACADEMY = ACADEMY;', context, { timeout: 5000 });
  return context.__ACADEMY;
}

function loadAnswers() {
  const mod = require(path.join(ROOT, 'docs', 'assets', 'answers.js'));
  return mod.ANSWERS || mod.default || mod;
}

const CASES = [
  { id: 'uc1', n: 'UC1', slug: 'omnichannel-lifecycle-retail' },
  { id: 'uc2', n: 'UC2', slug: 'b2b-abm-and-lead-nurture' },
  { id: 'uc3', n: 'UC3', slug: 'ai-powered-consent-first-engagement' },
  { id: 'uc4', n: 'UC4', slug: 'mce-to-next-migration' }
];

const PROJECTS = Array.from({ length: 8 }, (_, i) => `proj-0${i + 1}`);

const GUIDE15 = '15-Answers-and-Results.md';
const PROJ_START = '<!-- projects:start -->';
const PROJ_END = '<!-- projects:end -->';

const HR = '\n\n---\n\n';

/** Pull the four exercise briefs out of phase 16. */
function extractBriefs(academy) {
  const phase16 = academy.find((m) => m.id === 'usecases');
  if (!phase16) {
    throw new Error('Phase 16 (usecases) not found in curriculum.js');
  }
  const blocks = phase16.lessons.flatMap((l) => l.blocks || []);
  const out = {};
  for (const b of blocks) {
    if (b.t === 'ex' && CASES.some((c) => c.id === b.id)) {
      const brief = (b.steps || []).find((s) => /the brief/i.test(s.h));
      const deliver = (b.steps || []).find((s) => /deliver/i.test(s.h));
      out[b.id] = {
        title: b.title,
        objective: b.obj,
        verify: b.verify,
        stars: b.stars,
        briefItems: (brief && brief.items) || [],
        deliverItems: (deliver && deliver.items) || []
      };
    }
  }
  for (const c of CASES) {
    if (!out[c.id]) {
      throw new Error(`Brief for ${c.id} not found in phase 16`);
    }
  }
  return out;
}

const bullets = (items) => (items || []).map((i) => `- ${i}`).join('\n');
const numbered = (items) =>
  (items || []).map((i, n) => `${n + 1}. ${i}`).join('\n');

function briefBlock(data) {
  return [
    `**Objective.** ${data.objective}`,
    '',
    `**Verified by.** ${data.verify}`,
    '',
    '**The brief**',
    '',
    bullets(data.briefItems),
    '',
    '**Deliver**',
    '',
    numbered(data.deliverItems)
  ].join('\n');
}

function buildGuide16(briefs) {
  const parts = [
    '# 16 — Real-World Use Cases',
    '',
    '> Phase 16 of 17 — four consulting scenarios, briefed not solved.',
    '',
    'Read each case **twice**: once for the story, once for the constraints. The',
    'binding constraint decides the architecture. The story is decoration.',
    '',
    'Attempt them the way you would attempt a real engagement, and find the',
    'binding constraint before you propose anything.',
    '',
    'Answers: [17 — Use Case Solutions](17-Use-Case-Solutions.md).',
    '',
    '---',
    '',
    '## How to read a brief',
    '',
    '1. Find the sentence that says what is *constraining* the work. That is the',
    '   binding constraint, and it decides the architecture.',
    '2. Ask what the system of record is for every attribute before proposing a',
    '   single sync.',
    '3. State the cost. A recommendation without a cost line loses to a cheaper',
    '   one by default.',
    '4. Always produce a rollback. A cutover with no rollback is a bet, not a',
    '   plan.',
    '5. Name what you would **not** build. Scope discipline is the skill being',
    '   tested.',
    '',
    '| Case | Shape | The hard part |',
    '| --- | --- | --- |',
    '| UC1 | Omnichannel lifecycle, retail | Sequencing three channels without annoying anyone |',
    '| UC2 | B2B ABM and lead nurture | Identity across Sales and Marketing with consent |',
    '| UC3 | AI-powered consent-first engagement | Agentforce on SMS and WhatsApp without breaking consent |',
    '| UC4 | Marketing Cloud Engagement to Next migration | Running two platforms without losing the audience |',
    ''
  ];

  for (const c of CASES) {
    const d = briefs[c.id];
    parts.push(
      HR.replace(/\n/g, '\n'),
      `## ${d.title}`,
      '',
      briefBlock(d),
      '',
      '> Attempt this before reading phase 17. The value is in the attempt, and',
      '> the specific mistake you make is what tells you what to re-read.',
      ''
    );
  }

  return parts.join('\n').replace(/\n{4,}/g, '\n\n\n');
}

function buildGuide17(briefs, answers) {
  const parts = [
    '# 17 — Use Case Solutions',
    '',
    '> Phase 17 of 17 — full worked solutions for all four scenarios.',
    '',
    '**These are not model answers, they are worked solutions.** Each one states',
    'the binding constraint, names the system of record for every attribute that',
    'matters, gives a numeric threshold wherever a decision can be validated, and',
    'ends with what it deliberately does **not** build.',
    '',
    'Generated from `docs/assets/answers.js` and the phase 16 briefs in',
    '`docs/assets/curriculum.js` by `scripts/sync-use-case-guides.js`, so the',
    'Markdown and the in-browser academy cannot drift apart.',
    '',
    'Briefs: [16 — Real-World Use Cases](16-Real-World-Use-Cases.md).',
    '',
    '---',
    '',
    '## What every solution below has in common',
    '',
    '- Every solution states what it deliberately does **not** build.',
    '- Every solution names the system of record per attribute.',
    '- Every solution includes a rollback.',
    '- Every solution validates before cutover, against a numeric threshold.',
    '- Every solution carries a cost line and a named owner for each decision.',
    '',
    '> **Read UC4 twice.** The coexistence migration is the scenario that most',
    '> resembles the work consultants are actually being asked to do right now.',
    ''
  ];

  for (const c of CASES) {
    const d = briefs[c.id];
    const solution = String(answers[c.id] || '').trim();
    if (!solution) {
      throw new Error(`No answer in answers.js for ${c.id}`);
    }
    parts.push(
      HR.replace(/\n/g, '\n'),
      `## ${d.title}`,
      '',
      '### The brief',
      '',
      bullets(d.briefItems),
      '',
      '### The solution',
      '',
      solution,
      ''
    );
  }

  return parts.join('\n').replace(/\n{4,}/g, '\n\n\n');
}

/**
 * Phase 14 project answers are generated into guide 15 between markers.
 *
 * The 24 exercise answers in guide 15 are hand-written and deliberately richer
 * than the in-browser key. The eight mini projects are not, because they are
 * long and they are the answers most likely to drift from what the academy
 * shows. Those come from answers.js, so there is one source.
 */
function buildProjectsSection(answers) {
  const parts = [
    PROJ_START,
    'Eight multi-part builds, one per project. Each answer opens with the',
    'recommendation, then the build, then the thing it deliberately does not do.',
    '',
    'Generated from `docs/assets/answers.js` by `scripts/sync-use-case-guides.js`.',
    ''
  ];

  for (const id of PROJECTS) {
    const body = String(answers[id] || '').trim();
    if (!body) {
      throw new Error(`No answer in answers.js for ${id}`);
    }
    parts.push(`### ${id}`, '', body, '');
  }

  parts.push(PROJ_END);
  return parts.join('\n');
}

function spliceProjects(body, section) {
  const start = body.indexOf(PROJ_START);
  const end = body.indexOf(PROJ_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`${GUIDE15} is missing the ${PROJ_START} / ${PROJ_END} markers`);
  }
  return body.slice(0, start) + section + body.slice(end + PROJ_END.length);
}

function main() {
  const academy = loadAcademy();
  const briefs = extractBriefs(academy);
  const answers = loadAnswers();

  const outputs = [
    { file: '16-Real-World-Use-Cases.md', body: buildGuide16(briefs) },
    { file: '17-Use-Case-Solutions.md', body: buildGuide17(briefs, answers) }
  ];

  for (const dir of [CANON, MIRROR]) {
    fs.mkdirSync(dir, { recursive: true });
    for (const out of outputs) {
      fs.writeFileSync(path.join(dir, out.file), out.body, 'utf8');
    }
    // Guide 15 is hand-authored except the project block, so read, splice, write.
    const path15 = path.join(dir, GUIDE15);
    const current = fs.readFileSync(path15, 'utf8');
    fs.writeFileSync(path15, spliceProjects(current, buildProjectsSection(answers)), 'utf8');
  }

  console.log(
    `synced guides 16 and 17 (${CASES.length} use cases) and the ${PROJECTS.length} project answers in guide 15, canonical + mirror`
  );
}

main();
