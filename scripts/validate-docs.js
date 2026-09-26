/* =============================================================================
 * validate-docs.js - offline consistency check for the academy docs.
 *
 * Runs the browser data files in a vm sandbox and cross-checks them against
 * the files on disk, so a broken guide link, a missing answer or a bad mock
 * paper shows up before anything is deployed.
 *
 *   node scripts/validate-docs.js
 *
 * Exit code 0 = clean, 1 = at least one problem.
 * ========================================================================== */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs', 'assets');
const GUIDE_DIRS = [path.join(ROOT, 'docs', 'guide'), path.join(ROOT, 'developer Marketing Cloud Consultant Roadmap')];

const errors = [];
const warnings = [];
const notes = [];

const fail = m => errors.push(m);
const warn = m => warnings.push(m);
const note = m => notes.push(m);

/* ------------------------------------------------------------- load data */

/* `const` declarations do not become properties of the sandbox object, so the
   values are copied out explicitly at the end of the file. */
const EXPORTS = ['ACADEMY', 'EXAM_FACTS', 'EXERCISE_ANSWERS', 'GUIDE'];

function load(file) {
  const full = path.join(DOCS, file);
  if (!fs.existsSync(full)) return null;
  const sandbox = { globalThis: null };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  const src = fs.readFileSync(full, 'utf8');
  const grab = EXPORTS.map(n => `${n}: typeof ${n} === 'undefined' ? undefined : ${n}`).join(', ');
  try {
    vm.runInContext(src + `\n;globalThis.__exports = { ${grab} };`, sandbox, { filename: file });
  } catch (e) {
    fail(`docs/assets/${file} threw while loading: ${e.message}`);
    return {};
  }
  return sandbox.__exports;
}

const factsCtx = load('examfacts.js') || {};
const curriculumCtx = load('curriculum.js') || {};
const answersCtx = load('answers.js') || {};

if (!factsCtx.EXAM_FACTS) fail('docs/assets/examfacts.js did not define EXAM_FACTS');
if (!curriculumCtx.ACADEMY) fail('docs/assets/curriculum.js did not define ACADEMY');
if (factsCtx.EXAM_FACTS && curriculumCtx.ACADEMY) checkData(factsCtx.EXAM_FACTS, curriculumCtx.ACADEMY, answersCtx.EXERCISE_ANSWERS);

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function existsDir(rel) {
  const full = path.join(ROOT, rel);
  return fs.existsSync(full) && fs.statSync(full).isDirectory();
}

function checkData(F, MODULES, ANSWERS) {
  /* ------------------------------------------------------------ modules */
  if (MODULES.length !== 17) fail(`expected 17 modules, found ${MODULES.length}`);

  const seenId = new Set();
  MODULES.forEach((m, i) => {
    ['id', 'n', 'title', 'icon', 'color', 'tagline', 'guide', 'art', 'objectives', 'lessons', 'quiz'].forEach(k => {
      if (m[k] === undefined) fail(`module ${m.id || i} is missing "${k}"`);
    });
    if (seenId.has(m.id)) fail(`duplicate module id "${m.id}"`);
    seenId.add(m.id);
    if (m.n !== i + 1) fail(`module ${m.id} has n=${m.n} but sits at position ${i + 1}`);
    if (!m.lessons || !m.lessons.length) fail(`module ${m.id} has no lessons`);
    if (!m.objectives || !m.objectives.length) fail(`module ${m.id} has no objectives`);
    if (!m.quiz || !m.quiz.questions || !m.quiz.questions.length) fail(`module ${m.id} has no quiz questions`);

    (m.lessons || []).forEach((l, li) => {
      if (l.mins == null) fail(`module ${m.id} lesson ${li} has no mins`);
      if (!l.blocks || !l.blocks.length) fail(`module ${m.id} lesson ${li} has no blocks`);
    });

    /* guides: identical file name in both locations */
    if (m.guide) {
      if (!/^0[1-9]|^1[0-7]/.test(m.guide)) fail(`module ${m.id} guide does not start with a phase number: ${m.guide}`);
      GUIDE_DIRS.forEach(dir => {
        if (!fs.existsSync(path.join(dir, m.guide))) {
          fail(`guide missing: ${path.relative(ROOT, path.join(dir, m.guide))}`);
        }
      });
    }

    /* artifacts must resolve on disk (after URL decoding) */
    (m.art || []).forEach(a => {
      if (!a.href) { fail(`module ${m.id} has an artifact with no href`); return; }
      const rel = decodeURIComponent(a.href);
      const full = path.join(ROOT, rel);
      if (!fs.existsSync(full)) fail(`module ${m.id} artifact does not exist: ${rel}`);
      else if (rel.endsWith('/') && !fs.statSync(full).isDirectory()) fail(`module ${m.id} artifact is not a directory: ${rel}`);
    });

    /* quiz integrity */
    (m.quiz.questions || []).forEach((q, qi) => {
      if (!q.opts || q.opts.length < 2) fail(`module ${m.id} quiz q${qi + 1} has fewer than 2 options`);
      if (!Number.isInteger(q.a) || q.a < 0 || q.a >= q.opts.length) fail(`module ${m.id} quiz q${qi + 1} has an out-of-range answer index`);
      if (!q.why) fail(`module ${m.id} quiz q${qi + 1} has no explanation`);
      if (!q.q) fail(`module ${m.id} quiz q${qi + 1} has no question text`);
    });
  });

  /* --------------------------------------------------------- exercises */
  const exIds = new Set();
  const walk = blocks => (blocks || []).forEach(b => {
    if (b.t !== 'ex' && b.t !== 'proj') return;
    if (!b.id) { fail('an exercise block has no id'); return; }
    if (exIds.has(b.id)) fail(`duplicate exercise id "${b.id}"`);
    exIds.add(b.id);
    if (!b.title) fail(`exercise ${b.id} has no title`);
    if (!b.verify && !b.success) fail(`exercise ${b.id} has neither verify nor success`);
    const steps = b.steps || b.reqs;
    if (!steps || !steps.length) fail(`exercise ${b.id} has no steps`);
    (steps || []).forEach(s => {
      if (typeof s === 'string') return;
      if (!s.h || !Array.isArray(s.items) || !s.items.length) fail(`exercise ${b.id} has a malformed step group`);
    });
    if (!b.stars) fail(`exercise ${b.id} has no difficulty rating`);

    /* the answer key is the contract with docs/assets/answers.js */
    if (!ANSWERS) return;
    if (!ANSWERS[b.id]) fail(`exercise ${b.id} has no entry in docs/assets/answers.js`);
    else if (String(ANSWERS[b.id]).trim().length < 40) warn(`answer for ${b.id} is very short`);
  });
  MODULES.forEach(m => (m.lessons || []).forEach(l => walk(l.blocks)));

  if (ANSWERS) {
    Object.keys(ANSWERS).forEach(k => {
      if (!exIds.has(k)) fail(`answers.js has an entry "${k}" that no exercise uses`);
    });
  }
  note(`exercises: ${exIds.size} ids` + (ANSWERS ? ', all answered' : ', answers.js MISSING'));

  /* ------------------------------------------------------------- facts */
  if (!Array.isArray(F.tracks) || F.tracks.length < 2) fail('EXAM_FACTS.tracks needs both certification tracks');
  (F.tracks || []).forEach(t => {
    const total = t.domains.reduce((a, d) => a + d.weight, 0);
    if (total !== 100) fail(`track ${t.code} domain weights sum to ${total}, not 100`);
    if (!t.objectives || !t.objectives.length) fail(`track ${t.code} has no objectives`);
    if (!t.pass) fail(`track ${t.code} has no pass mark`);
  });
  if (!F.sources || F.sources.length < 5) warn('fewer than 5 provenance sources recorded');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(F.verifiedOn || '')) fail(`verifiedOn "${F.verifiedOn}" is not an ISO date`);

  /* ------------------------------------------------------- question bank */
  const mcn = F.tracks[1];
  const domainNames = mcn.domains.map(d => d.name);
  const bankIds = new Set();
  (F.bank || []).forEach(q => {
    if (bankIds.has(q.id)) fail(`question bank has a duplicate id "${q.id}"`);
    bankIds.add(q.id);
    if (!domainNames.includes(q.domain)) fail(`bank question ${q.id} uses unknown domain "${q.domain}"`);
    if (!q.opts || q.opts.length < 2) fail(`bank question ${q.id} has fewer than 2 options`);
    if (!Number.isInteger(q.a) || q.a < 0 || q.a >= q.opts.length) fail(`bank question ${q.id} has an out-of-range answer index`);
    if (!q.why) fail(`bank question ${q.id} has no explanation`);
  });
  domainNames.forEach(d => {
    if (!F.bank.some(q => q.domain === d)) fail(`no bank questions for MCN domain "${d}"`);
  });
  if (new Set(F.bank.map(q => q.id)).size !== F.bank.length) fail('question bank ids are not unique');

  /* the mock paper must apportion to exactly the paper size (mirrors app.js) */
  const targets = mockTargets(mcn.domains, F.mock);
  const sum = targets.reduce((a, t) => a + t.want, 0);
  if (sum !== F.mock) fail(`mock paper apportions to ${sum} questions, expected ${F.mock}`);
  targets.forEach(t => {
    const pool = F.bank.filter(q => q.domain === t.name).length;
    if (t.want > pool) note(`domain "${t.name}" wants ${t.want} questions from a pool of ${pool} - options get rotated on repeats`);
  });
  note(`mock paper: ${targets.map(t => `${t.want}x ${t.name.split(',')[0]}`).join(', ')}`);

  /* ------------------------------------------------------------- ladder */
  (F.ladder || []).forEach(r => {
    if (!r.name || !r.pre || !r.why) fail(`ladder row "${r.name}" is incomplete`);
  });
  (F.renames || []).forEach(r => {
    if (!r.old || !r.now || !r.impact) fail(`rename row "${r.old}" is incomplete`);
  });
}

function mockTargets(domains, paperSize) {
  const raw = domains.map(d => ({ name: d.name, exact: paperSize * d.weight / 100 }));
  const out = raw.map(r => ({ name: r.name, want: Math.max(1, Math.floor(r.exact)) }));
  const byFrac = raw.map((r, i) => ({ i, frac: r.exact - Math.floor(r.exact) })).sort((a, b) => b.frac - a.frac || a.i - b.i);
  let remaining = paperSize - out.reduce((a, r) => a + r.want, 0);
  for (let k = 0; remaining > 0; k++, remaining--) out[byFrac[k % byFrac.length].i].want++;
  for (let k = byFrac.length - 1; remaining < 0; k--, remaining++) {
    const idx = byFrac[((k % byFrac.length) + byFrac.length) % byFrac.length].i;
    if (out[idx].want > 1) out[idx].want--;
  }
  return out;
}

/* ------------------------------------------------- repo-wide sanity sweep */

function sweep() {
  const stale = [
    { pattern: /Developer_Roadmap/, label: 'the reference project app name' },
    { pattern: /Async_Job_Monitor__c|Study_Plan__c|Code_Review__c|Integration_Log__c|Dev_Task__c/, label: 'reference-project metadata names' },
    { pattern: /devacademy-v1|devacademy-theme/, label: 'reference-project localStorage keys (both academies share the github.io origin)' }
  ];

  ['docs/index.html', 'docs/assets/app.js', 'docs/assets/curriculum.js', 'docs/assets/examfacts.js', 'docs/assets/style.css', 'README.md', 'ARCHITECTURE.md']
    .filter(f => fs.existsSync(path.join(ROOT, f)))
    .forEach(f => {
      const txt = fs.readFileSync(path.join(ROOT, f), 'utf8');
      stale.forEach(s => {
        if (s.pattern.test(txt)) fail(`${f} still contains ${s.label}`);
      });
    });

  const idx = path.join(ROOT, 'docs', 'index.html');
  if (fs.existsSync(idx)) {
    const html = fs.readFileSync(idx, 'utf8');
    ['examfacts.js', 'curriculum.js', 'answers.js', 'app.js'].forEach(s => {
      if (!html.includes(s)) fail(`docs/index.html does not load assets/${s}`);
    });
    if (/href="assets\/style\.css"/.test(html) === false) fail('docs/index.html does not link assets/style.css');
  }
  if (!existsDir('force-app/main/default/classes')) fail('force-app/main/default/classes is missing');
  if (!exists('sfdx-project.json')) fail('sfdx-project.json is missing');
  if (!existsDir('scripts/soql')) fail('scripts/soql is missing');
  if (!existsDir('scripts/apex')) fail('scripts/apex is missing');
}

sweep();

/* ------------------------------------------------------------------ report */

const out = [];
notes.forEach(n => out.push('note  ' + n));
warnings.forEach(w => out.push('warn  ' + w));
errors.forEach(e => out.push('ERROR ' + e));
out.push('');
out.push(`${errors.length} error(s), ${warnings.length} warning(s)`);
console.log(out.join('\n'));
process.exit(errors.length ? 1 : 0);
