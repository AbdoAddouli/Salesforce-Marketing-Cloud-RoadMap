/* =============================================================================
 * Marketing Cloud Consultant Academy — app
 * Client-side learning app: hash routing, lesson renderer, quiz engine,
 * progress persistence (localStorage), search, keyboard shortcuts.
 *
 * Engine copied verbatim from the Salesforce Dev I & II Academy. Only the
 * repo slug, branding and the extra `#/mock` exam-simulator route are new.
 * ============================================================================= */

/* ------------------------- repo identity ------------------------- */
/* Single place to re-point the whole site at a different GitHub repo. */
const REPO = 'AbdoAddouli/Salesforce-Marketing-Cloud-RoadMap';
const REPO_URL = 'https://github.com/' + REPO;
const REPO_TREE = REPO_URL + '/blob/main/';

/* ------------------------- theme ------------------------- */

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'dark';
}
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('mcc-consultant-theme', t);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = t === 'dark' ? '🌙' : '☀️';
}

/* ------------------------- small helpers ------------------------- */

const $  = (s, c) => (c || document).querySelector(s);
const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

const esc = (s = '') => s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const cyrb53 = s => { let h = 9; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 2654435761); return (h ^ h >>> 9) >>> 0; };

const MODULES = ACADEMY;

/* ------------------------- progress store ------------------------- */

const KEY = 'mcc-consultant-v1';
let store = load();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || defaultStore(); }
  catch (e) { return defaultStore(); }
}
function defaultStore() {
  return { done: {}, quiz: {}, best: {}, stars: {}, guide: {}, lastOpen: null };
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
}
function lessonDone(mid, li)  { return !!store.done[mid + ':' + li]; }
function markDone(mid, li, v) { store.done[mid + ':' + li] = v; save(); }
function guideRead(mid)       { return !!(store.guide && store.guide[mid]); }
function markGuideRead(mid, v) { if (!store.guide) store.guide = {}; store.guide[mid] = v; save(); }
function moduleProgress(mid) {
  const m = byId(mid);
  if (!m) return { done: 0, total: 0, pct: 0, quizPct: 0, complete: 0, totalUnits: 0 };
  const lessons = m.lessons.length;
  let done = 0;
  if (guideRead(mid)) {
    done = lessons;                       // reading the full guide = all lessons
  } else {
    m.lessons.forEach((_, i) => { if (lessonDone(mid, i)) done++; });
  }
  // lessons are worth 2 units, quiz worth 1
  const units = lessons * 2 + 1;
  const earned = done * 2 + (store.quiz[mid] ? 1 : 0);
  const pct = Math.round((earned / units) * 100);
  const complete = earned >= units;
  return { done, total: lessons, pct, quizPct: quizPctOf(mid), complete, earned, units };
}
function quizPctOf(mid) {
  const m = byId(mid);
  if (!m || !store.best[mid]) return 0;
  return Math.round((store.best[mid] / m.quiz.questions.length) * 100);
}
function overallPct() {
  const rows = MODULES.map(m => {
    const p = moduleProgress(m.id);
    return p.units ? p.earned / p.units * 100 : 0;
  });
  return Math.round(rows.reduce((a, b) => a + b, 0) / rows.length);
}

function byId(id) { return MODULES.find(m => m.id === id); }

/* ------------------------- routing ------------------------- */

let route = { view: 'home', mid: null, li: null };

function navigate(view, mid, li) {
  route = { view, mid, li: li != null ? li : null };
  history.replaceState(null, '', '#' + hashFor());
  render();
}
function hashFor() {
  if (route.view === 'phase') return '/phase/' + route.mid;
  if (route.view === 'lesson') return '/lesson/' + route.mid + '/' + route.li;
  if (route.view === 'quiz')  return '/quiz/' + route.mid;
  if (route.view === 'guide') return '/guide/' + route.mid + (route.anchor ? '/' + route.anchor : '');
  if (route.view === 'mock') return '/mock';
  if (route.view === 'facts') return '/facts';
  return '/';
}
function parseHash() {
  const h = decodeURIComponent((location.hash || '#/').replace(/^#/, ''));
  const parts = h.split('/').filter(Boolean);
  if (parts[0] === 'phase') return { view: 'phase', mid: parts[1] };
  if (parts[0] === 'lesson') return { view: 'lesson', mid: parts[1], li: Number(parts[2]) };
  if (parts[0] === 'quiz')   return { view: 'quiz', mid: parts[1] };
  if (parts[0] === 'guide')  return { view: 'guide', mid: parts[1], anchor: parts[2] || null };
  if (parts[0] === 'mock')   return { view: 'mock' };
  if (parts[0] === 'facts')  return { view: 'facts' };
  return { view: 'home' };
}

/* ------------------------- renderer ------------------------- */

const view = $('#view');

function render() {
  const mod = route.mid ? byId(route.mid) : null;
  const r = parseHash(); // keep in sync with friendly URLs
  document.title = 'Marketing Cloud Consultant Academy' + (mod ? ' · ' + mod.title : '');

  // sidebar
  renderSidebar();

  // topbar progress
  const tp = $('#topPct');
  if (tp) tp.textContent = overallPct() + '%';
  const tbar = $('#topBar');
  if (tbar) tbar.style.width = overallPct() + '%';
  bindTopSearch();

  if (r.view === 'phase')  return renderModule(mod);
  if (r.view === 'lesson') return renderLesson(mod, Math.min(Number(r.li) || 0, mod.lessons.length - 1));
  if (r.view === 'quiz')   return renderQuiz(mod);
  if (r.view === 'guide')  return renderGuide(mod);
  if (r.view === 'mock')   return renderMock();
  if (r.view === 'facts')  return renderFacts();
  renderHome();
}

/* ------------------------- sidebar ------------------------- */

function renderSidebar() {
  const aside = $('aside.sidebar');
  aside.innerHTML = `
    <div class="side-brand">
      <div class="logo">☁️</div>
      <div><b>Marketing Cloud Consultant</b><span>17-phase roadmap</span></div>
    </div>`;

  const nav = document.createElement('nav');
  nav.className = 'side-nav';

  const home = document.createElement('a');
  home.href = '#/';
  home.className = 'side-link' + (route.view === 'home' ? ' active' : '');
  home.innerHTML = `<span class="sli">🏠</span> Dashboard`;
  nav.appendChild(home);

  const facts = document.createElement('a');
  facts.href = '#/facts';
  facts.className = 'side-link' + (route.view === 'facts' ? ' active' : '');
  facts.innerHTML = `<span class="sli">🎯</span> Exam facts & blueprints`;
  nav.appendChild(facts);

  const mock = document.createElement('a');
  mock.href = '#/mock';
  mock.className = 'side-link' + (route.view === 'mock' ? ' active' : '');
  mock.innerHTML = `<span class="sli">⏱️</span> Mock exam simulator`;
  nav.appendChild(mock);

  MODULES.forEach(m => {
    const p = moduleProgress(m.id);
    const a = document.createElement('a');
    a.href = '#/phase/' + m.id;
    a.className = 'side-phase' + (route.mid === m.id ? ' active' : '');
    a.innerHTML = `
      <span class="sp-n" style="border-color:${m.color}">${String(m.n).padStart(2, '0')}</span>
      <span class="sp-body">
        <span class="sp-title">${m.title}</span>
        <span class="sp-bar"><i style="width:${p.pct}%;background:${m.color}"></i></span>
      </span>
      <span class="sp-pct">${p.pct}%</span>
      ${p.complete ? '<span class="sp-ok">✓</span>' : ''}`;
    nav.appendChild(a);
  });

  aside.appendChild(nav);

  const progWrap = document.createElement('div');
  progWrap.className = 'side-progress';
  const op = overallPct();
  progWrap.innerHTML = `<div class="sp-bar big"><i style="width:${op}%"></i></div>
    <div class="side-prog-label"><b>${op}%</b> of roadmap complete</div>`;
  aside.appendChild(progWrap);
}

/* ------------------------- home ------------------------- */

function renderHome() {
  const op = overallPct();
  const totalLessons = MODULES.reduce((a, m) => a + m.lessons.length, 0);
  const totalMin = MODULES.reduce((a, m) => a + m.lessons.reduce((x, l) => x + l.mins, 0), 0) + MODULES.reduce((a, m) => a + m.quiz.mins, 0);
  const totalDone = MODULES.reduce((a, m) => a + moduleProgress(m.id).earned, 0);
  const totalUnits = MODULES.reduce((a, m) => a + moduleProgress(m.id).units, 0);

  // continue card
  let next = null;
  for (const m of MODULES) {
    for (let i = 0; i < m.lessons.length; i++) {
      if (!lessonDone(m.id, i)) { next = { m, i }; break; }
    }
    if (next) break;
  }
  if (!next) next = { m: MODULES[0], i: 0 };
  let resume = null;
  if (store.lastOpen && byId(store.lastOpen.mid)) {
    const lm = byId(store.lastOpen.mid);
    resume = { m: lm, li: Math.max(0, Math.min(store.lastOpen.li, lm.lessons.length - 1)) };
  }
  if (!resume) resume = { m: next.m, li: next.i };
  const rm = resume.m;

  view.innerHTML = `
    <div class="home-hero reveal">
      <div>
        <div class="hero-kicker">Marketing Cloud · MCE Consultant + MCN Consultant · study from zero</div>
        <h1 class="hero-title">Become <span class="grad">Marketing Cloud Expert</span>, phase by phase.</h1>
        <p class="hero-sub">${MODULES.length} guided modules, ${totalLessons} lessons, ${MODULES.length} quizzes — covering both the legacy Marketing Cloud Engagement Consultant track and the new Marketing Cloud Next Consultant track, with real metadata in the repo to deploy and practice on.</p>
        <div class="hero-actions">
          <button class="btn primary" id="startBtn">${next ? '▶ Continue learning' : '🎉 Restart'}</button>
          <button class="btn ghost" id="phasesBtn">Browse all phases</button>
          <a class="btn ghost" href="#/facts">🎯 Exam blueprints</a>
          <a class="btn ghost" href="#/mock">⏱️ Mock exam</a>
          <span class="hero-meta">📅 17 phases · self-paced</span>
        </div>
      </div>
      <div class="ring-wrap">
        <div class="ring" style="--p:${op}"><span>${op}<small>%</small></span></div>
        <div class="ring-caption">roadmap progress</div>
      </div>
    </div>

    <div class="stats reveal">
      <div class="stat"><div class="st-n">${totalDone}<small>/${totalUnits}</small></div><div class="st-l">units completed</div></div>
      <div class="stat"><div class="st-n">${MODULES.filter(m => moduleProgress(m.id).complete).length}<small>/</small></div><div class="st-l">phases mastered</div></div>
      <div class="stat"><div class="st-n">${MODULES.filter(m => store.best[m.id] >= m.quiz.questions.length).length}<small>/</small></div><div class="st-l">quizzes passed</div></div>
      <div class="stat"><div class="st-n">${totalMin}<small> min</small></div><div class="st-l">~ total study time</div></div>
    </div>

    <div class="home-cards">
      <div class="card continue-card" style="--c:${rm.color}">
        <div class="cc-top"><span class="cc-label">Continue where you left off</span><span class="pill">Phase ${rm.n}</span></div>
        <h3>${resume.li != null && resume.li < rm.lessons.length ? rm.lessons[resume.li].title : rm.lessons[0].title}</h3>
        <div class="cc-sub">${rm.title}</div>
        <div class="sp-bar"><i style="width:${moduleProgress(rm.id).pct}%;background:${rm.color}"></i></div>
        <button class="btn primary sm" id="resumeBtn">Resume →</button>
      </div>
      <div class="card next-card" style="--c:${next.m.color}">
        <div class="cc-top"><span class="cc-label">Next up</span><span class="pill">Phase ${next.m.n}</span></div>
        <h3>${next.i != null && next.i < next.m.lessons.length ? next.m.lessons[next.i].title : next.m.lessons[0].title}</h3>
        <div class="cc-sub">${next.m.lessons[next.i].mins} min · ${next.m.lessons.length} lessons · ${next.m.quiz.questions.length}-question quiz</div>
        <button class="btn sm" id="nextBtn">Open →</button>
      </div>
      <div class="card streak-card" style="--c:#e8b93d">
        <div class="cc-top"><span class="cc-label">Learning tips</span></div>
        <h3>3 wins today</h3>
        <ul class="tips">
          <li>Finish <b>one lesson</b> then take its phase quiz.</li>
          <li>Re-create flows / reports in your own org.</li>
          <li>Use <kbd>/</kbd> to search anything.</li>
        </ul>
      </div>
    </div>

    <div class="grid-head reveal"><h2>Your roadmap</h2><span>${MODULES.length} phases · study in order or jump anywhere</span></div>
    <div class="module-grid reveal" id="modGrid"></div>`;

  $('#startBtn').addEventListener('click', () => navigate('lesson', resume.m.id, resume.li != null && resume.li < rm.lessons.length ? resume.li : 0));
  $('#resumeBtn').addEventListener('click', () => navigate('lesson', resume.m.id, resume.li != null && resume.li < rm.lessons.length ? resume.li : 0));
  $('#nextBtn').addEventListener('click', () => navigate('lesson', next.m.id, next.i));
  $('#phasesBtn').addEventListener('click', () => navigate('phase', MODULES[0].id));

  const grid = $('#modGrid');
  MODULES.forEach(m => {
    const p = moduleProgress(m.id);
    const card = document.createElement('a');
    card.href = '#/phase/' + m.id;
    card.className = 'mod-card';
    card.style.setProperty('--c', m.color);
    card.innerHTML = `
      <div class="mc-top">
        <span class="mc-num">${String(m.n).padStart(2, '0')}</span>
        <span class="mc-ico">${m.icon}</span>
        ${p.complete ? '<span class="mc-done">✓ completed</span>' : ''}
      </div>
      <h3>${esc(m.title)}</h3>
      <div class="mc-tag">${esc(m.tagline)}</div>
      <div class="mc-prog">
        <div class="sp-bar"><i style="width:${p.pct}%;background:${m.color}"></i></div>
        <div class="mc-sub">${p.done}/${p.total} lessons · ${p.quizPct}% quiz</div>
      </div>
      <div class="mc-foot">
        <span>${m.lessons.length} lessons · ${m.quiz.questions.length} quiz</span>
        <span class="mc-arrow">→</span>
      </div>`;
    grid.appendChild(card);
  });
}

/* ------------------------- module/phase page ------------------------- */

function renderModule(mod) {
  const p = moduleProgress(mod.id);
  const quizScore = store.best[mod.id];
  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>›</span> <b>${mod.title}</b></div>

    <div class="phase-hero reveal" style="--c:${mod.color}">
      <div class="ph-ico">${mod.icon}</div>
      <div class="ph-body">
        <div class="ph-kicker">Phase ${String(mod.n).padStart(2, '0')} · ${mod.tagline}</div>
        <h1>${mod.title}</h1>
        <div class="ph-obj"><span>By the end you can:</span>
          <ul>${mod.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="ph-side">
        <div class="ring sm" style="--p:${p.pct};--c:${mod.color}"><span>${p.pct}<small>%</small></span></div>
        <div class="ph-stats">
          <span>${p.done}/${p.total} lessons</span>
          <span>${store.quiz[mod.id] ? '✓ quiz taken' : 'quiz pending'}</span>
        </div>
        <a class="btn primary sm" href="#/guide/${mod.id}">📖 Read the full guide</a>
        <a class="btn ghost sm" target="_blank" rel="noopener"
           href="${GUIDE}${mod.guide}">📄 raw</a>
      </div>
    </div>

    <div class="lessons reveal">
      <a class="lesson-row guide-row" href="#/guide/${mod.id}" style="--c:${mod.color}">
        <span class="lr-state guide">📖</span>
        <span class="lr-info">
          <b>Full module guide</b>
          <span class="lr-meta">complete walkthrough · sections, tables, code & checklists${guideRead(mod.id) ? ' · read ✓' : ''}</span>
        </span>
        <span class="lr-arrow">→</span>
      </a>
      ${mod.lessons.map((l, i) => `
        <a class="lesson-row" href="#/lesson/${mod.id}/${i}" style="--c:${mod.color}">
          <span class="lr-state">${lessonDone(mod.id, i) ? '<span class="lr-done">✓</span>' : String(i + 1).padStart(2, '0')}</span>
          <span class="lr-info">
            <b>${l.title}</b>
            <span class="lr-meta">${l.mins} min</span>
          </span>
          <span class="lr-arrow">→</span>
        </a>`).join('')}
    </div>

    <div class="quiz-card reveal" style="--c:${mod.color}">
      <div class="qc-left">
        <div class="qc-ico">🧠</div>
        <div>
          <h3>Module quiz · check your understanding</h3>
          <p>${mod.quiz.questions.length} questions · ${mod.quiz.mins} min.
             ${quizScore != null ? `Your best: <b>${quizScore}/${mod.quiz.questions.length}</b> (${Math.round(quizScore / mod.quiz.questions.length * 100)}%).` : 'Not attempted yet.'}
          </p>
        </div>
      </div>
      <div class="qc-right">
        ${quizScore != null && quizScore === mod.quiz.questions.length ? '<span class="qc-perfect">★ perfect</span>' : ''}
        <a class="btn primary" href="#/quiz/${mod.id}">${quizScore != null ? 'Retake quiz' : 'Take quiz →'}</a>
      </div>
    </div>

    <div class="artifacts reveal">
      <h3>📦 Real artifacts in this repo</h3>
      <div class="artifacts-grid">
        ${mod.art.map(a => `
          <a class="artifact" target="_blank" rel="noopener"
 href="${REPO_TREE}${a.href}" style="--c:${mod.color}">
            <span class="a-ico">🗂️</span> <span>${a.label}</span>
          </a>`).join('')}
      </div>
    </div>

    <div class="phase-nav reveal">
      ${mod.n > 1 ? `<a class="btn ghost" href="#/phase/${MODULES[mod.n - 2].id}">← ${MODULES[mod.n - 2].title}</a>` : '<span></span>'}
      ${mod.n < MODULES.length
        ? `<a class="btn primary" href="#/phase/${MODULES[mod.n].id}">${MODULES[mod.n].title} →</a>`
        : `<a class="btn primary" href="#/quiz/${mod.id}">🎯 Take the final quiz</a>`}
    </div>`;
}

/* ------------------------- lesson page ------------------------- */

function renderLesson(mod, li) {
  const lesson = mod.lessons[li];
  const prevI = li > 0 ? li - 1 : null;
  const nextI = li < mod.lessons.length - 1 ? li + 1 : null;
  const done = lessonDone(mod.id, li);

  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>›</span> <a href="#/phase/${mod.id}">${mod.title}</a> <span>›</span> <b>${lesson.title}</b></div>

    <div class="lesson-wrap reveal">
      <aside class="lesson-toc">
        <div class="toc-title">${mod.title}</div>
        ${mod.lessons.map((l, i) => `
          <a href="#/lesson/${mod.id}/${i}" class="toc-item ${i === li ? 'active' : ''}">
            <span class="toc-state">${lessonDone(mod.id, i) ? '✓' : i + 1}</span>
            <span>${l.title}<span class="toc-min">${l.mins}′</span></span>
          </a>`).join('')}
        <a href="#/guide/${mod.id}" class="toc-item toc-guide" style="--c:${mod.color}">
          <span class="toc-state">📖</span><span>Full module guide</span>
        </a>
        <a href="#/quiz/${mod.id}" class="toc-item toc-quiz" style="--c:${mod.color}">
          <span class="toc-state">🧠</span><span>Module quiz</span>
        </a>
      </aside>

      <article class="lesson article" style="--c:${mod.color}">
        <div class="lesson-head" style="--c:${mod.color}">
          <div class="lh-meta">Phase ${String(mod.n).padStart(2, '0')} · Lesson ${li + 1} of ${mod.lessons.length} · ${lesson.mins} min</div>
          <h1>${lesson.title}</h1>
        </div>
        <div class="chips">
          ${mod.objectives.map((o, i) => `<span class="chip-o">${o}</span>`).join('')}
        </div>

        <div class="blocks">${lesson.blocks.map(renderBlock).join('')}</div>

        <div class="lesson-foot">
          <div class="lf-left">
            ${done
              ? '<button class="btn ghost sm" id="unbtn">↩ Mark as unlearned</button>'
              : `<button class="btn primary" id="doneBtn">✓ Mark lesson complete</button>`}
          </div>
          <div class="lf-right">
            ${prevI != null ? `<a class="btn ghost sm" href="#/lesson/${mod.id}/${prevI}">← Prev</a>` : ''}
            ${nextI != null
              ? `<a class="btn primary sm" href="#/lesson/${mod.id}/${nextI}">Next →</a>`
              : `<a class="btn primary sm" href="#/quiz/${mod.id}">Take the quiz →</a>`}
          </div>
        </div>
      </article>
    </div>`;

  const b = $('#doneBtn'); const u = $('#unbtn');
  if (b) b.addEventListener('click', () => { markDone(mod.id, li, true); store.lastOpen = { mid: mod.id, li }; save(); toast('Lesson complete! 🎉'); render(); });
  if (u) u.addEventListener('click', () => { markDone(mod.id, li, false); render(); });
  store.lastOpen = { mid: mod.id, li }; save();
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

/* Minimal markdown renderer for the exercise answer blocks + full guides */
let mdToc = [];            // filled on every md() call: { lvl, slug, label }

function slugify(txt) {
  return String(txt || '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'section';
}

function mdInline(t) {
  return String(t)
    .replace(/`([^`]+)`/g, (m, c) => '\u0001' + c + '\u0002')       // protect inline code
    .replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*\u0001\u0002])\*([^*\n\u0001\u0002]+?)\*(?!\*)/g, '$1<i>$2</i>')
    .replace(/\u0001([^\u0002]*)\u0002/g, '<code class="inline">$1</code>');
}

function md(src, opts) {
  opts = opts || {};
  const lines = String(src || '').split(/\r?\n/);
  const html = [];
  const seen = new Set();
  mdToc = [];
  let i = 0, inFence = false, fenceBuf = [], fenceLang = '';

  while (i < lines.length) {
    const line = lines[i];

    if (!inFence && /^```/.test(line)) {
      inFence = true; fenceLang = (line.match(/^```(\w*)/) || [])[1] || 'text'; fenceBuf = []; i++; continue;
    }
    if (inFence) {
      if (/^```/.test(line)) {
        html.push(renderCode(fenceLang, fenceBuf));
        inFence = false; fenceBuf = []; fenceLang = ''; i++; continue;
      }
      fenceBuf.push(line); i++; continue;
    }
    if (/^\s*---\s*$/.test(line)) { i++; continue; }

    const head = line.match(/^(#{1,4})\s+(.*)/);
    if (head) {
      const hl = head[1].length;
      if (opts.skipH1 && hl === 1 && !seen.has('h1')) { seen.add('h1'); i++; continue; }
      const lvl = hl + (opts.shift || 0);
      const txt = esc(head[2]);
      const label = mdInline(txt).replace(/<[^>]+>/g, '');
      let slug = slugify(label), base = slug, n = 2;
      while (seen.has(slug)) { slug = base + '-' + n; n++; }
      seen.add(slug);
      if (lvl <= 4) mdToc.push({ lvl, slug, label });
      html.push(`<h${lvl} id="${slug}">${mdInline(txt)}</h${lvl}>`);
      i++; continue;
    }

    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      html.push(mdTable(rows));
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      const isTask = /^\s*[-*]\s+\[[ xX]\]/.test(line);
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i]); i++; }
      if (isTask) {
        html.push('<ul class="task-list">' + items.map(x => {
          const m = x.match(/^\s*[-*]\s+\[([ xX])\]\s+(.*)/);
          if (!m) return `<li>${mdInline(esc(x.replace(/^\s*[-*]\s+/, '')))}</li>`;
          const done = m[1] === 'x' || m[1] === 'X';
          return `<li class="task ${done ? 'done' : ''}"><span class="t-box">${done ? '✓' : ''}</span><span class="t-text">${mdInline(esc(m[2]))}</span></li>`;
        }).join('') + '</ul>');
      } else {
        html.push(`<ul class="tick-list">${items.map(x => `<li>${mdInline(esc(x.replace(/^\s*[-*]\s+/, '')))}</li>`).join('')}</ul>`);
      }
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
      html.push(`<ol>${items.map(x => `<li>${mdInline(esc(x))}</li>`).join('')}</ol>`);
      continue;
    }
    if (/^\s*$/.test(line)) { i++; continue; }

    const para = [];
    while (i < lines.length) {
      const l = lines[i];
      if (/^\s*$/.test(l) || /^```/.test(l) || /^\|/.test(l) || /^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l) || /^(#{1,4})\s+/.test(l) || /^\s*---\s*$/.test(l)) break;
      para.push(l); i++;
    }
    if (para.length) html.push(`<p>${mdInline(esc(para.join(' ')))}</p>`);
  }

  if (inFence && fenceBuf.length) html.push(renderCode(fenceLang, fenceBuf));
  return html.join('');
}

function renderCode(lang, buf) {
  return `<div class="codeblock"><div class="cb-head"><span class="cb-lang">${esc(lang || 'text')}</span></div><pre><code>${buf.map(esc).join('\n')}</code></pre></div>`;
}

function mdTable(rows) {
  const parseRow = r => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
  let head = [], body = [], sep = false;
  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    if (idx === 1 && /^[\s|:-]+$/.test(r.replace(/^\|/, '').replace(/\|$/, ''))) { sep = true; head = parseRow(rows[0]); continue; }
    if (sep) body.push(parseRow(r)); else head = parseRow(r);
  }
  if (!sep) { body = rows.map(parseRow); head = []; }
  const thead = head.length ? `<thead><tr>${head.map(h => `<th>${mdInline(esc(h))}</th>`).join('')}</tr></thead>` : '';
  const tbody = `<tbody>${body.map(r => `<tr>${r.map(c => `<td>${mdInline(esc(c))}</td>`).join('')}</tr>`).join('')}</tbody>`;
  return `<div class="tbl"><table>${thead}${tbody}</table></div>`;
}

/* Block renderer for the curriculum blocks */
function renderBlock(b) {
  switch (b.t) {
    case 'p': return `<p>${esc(b.x)}</p>`;
    case 'h': return `<h2>${esc(b.x)}</h2>`;
    case 'list': return `<ul class="tick-list">${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    case 'num': return `<ol>${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ol>`;
    case 'table': return `
      <div class="tbl"><table>
        <thead><tr>${b.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    case 'code': {
      const cid = 'c' + cyrb53(b.x);
      const bT = b.lang || 'text';
      return `<div class="codeblock">
        <div class="cb-head"><span class="cb-lang">${esc(bT)}</span><button class="cb-copy" data-copy="${cid}" title="Copy">⧉ Copy</button></div>
        <pre id="${cid}" class="lang-${esc(bT)}"><code>${esc(b.x)}</code></pre>
      </div>`;
    }
    case 'callout': {
      const icons = { tip: '💡', warn: '⚠️' };
      return `<div class="callout ${esc(b.kind)}"><div class="co-ico">${icons[b.kind] || '💡'}</div><div>${esc(b.x)}</div></div>`;
    }
    case 'selfcheck': return `
      <div class="selfcheck">
        <div class="sc-head"><span class="sc-qmark">?</span> <span>Check yourself</span></div>
        <div class="sc-q">${esc(b.q)}</div>
        <div class="sc-actions"><button class="btn sm ghost showA">Show answer</button></div>
        <div class="sc-a" hidden>${esc(b.a)}</div>
      </div>`;
    case 'ex':
    case 'proj': {
      const isProject = b.t === 'proj';
      const items = b.steps || b.reqs || [];
      const lis = items.map(i =>
        typeof i === 'string'
          ? `<li>${esc(i)}</li>`
          : `<li class="ex-group"><b>${esc(i.h)}</b><ul>${i.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></li>`
      ).join('');
      const stars = '★'.repeat(b.stars) + '☆'.repeat(Math.max(0, 4 - b.stars));
      const code = b.code ? renderBlock({ t: 'code', ...b.code }) : '';
      const footer = isProject
        ? `<div class="ex-verify">🎯 Success — ${esc(b.success)}</div>`
        : `<div class="ex-verify">✅ Verify — ${esc(b.verify)}</div>`;
      const hasAnswer = typeof EXERCISE_ANSWERS !== 'undefined' && EXERCISE_ANSWERS[b.id];
      const answer = hasAnswer
        ? `<details class="ex-answer"><summary><span class="ea-ico">💡</span><span>Show answer</span><span class="ea-caret">▾</span></summary><div class="ex-answer-body">${md(EXERCISE_ANSWERS[b.id])}</div></details>`
        : '';
      return `
        <div class="ex-card ${isProject ? 'proj' : ''}" data-stars="${b.stars}">
          <div class="ex-head">
            <span class="ex-id">${esc(b.id)}</span>
            <span class="ex-stars">${stars}</span>
          </div>
          <h3 class="ex-title">${esc(b.title)}</h3>
          <p class="ex-obj">${esc(b.obj)}</p>
          ${code}
          <div class="ex-label">${isProject ? '📋 Requirements' : '🧭 Instructions'}</div>
          <ol class="ex-list">${lis}</ol>
          ${footer}
          ${answer}
        </div>`;
    }
    default: return '';
  }
}

/* ------------------------- full guide page ------------------------- */

const GUIDE_DIR = 'guide/';
const guideCache = {};

function fetchGuide(mod) {
  const key = mod.guide;
  if (guideCache[key]) return Promise.resolve(guideCache[key]);
  if (!window.fetch) return Promise.reject(new Error('fetch unavailable'));
  return fetch(GUIDE_DIR + key)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(t => { guideCache[key] = t; return t; });
}

function renderGuide(mod) {
  const p = moduleProgress(mod.id);
  const read = guideRead(mod.id);

  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>›</span> <a href="#/phase/${mod.id}">${mod.title}</a> <span>›</span> <b>Full guide</b></div>

    <div class="guide-hero reveal" style="--c:${mod.color}">
      <div class="ph-ico">${mod.icon}</div>
      <div class="ph-body">
        <div class="ph-kicker">Phase ${String(mod.n).padStart(2, '0')} · complete guide</div>
        <h1>${mod.title}</h1>
        <p class="qc-sub">The full roadmap guide is rendered right here — every section, table, code sample and checklist from ${esc(mod.guide)}. ${read ? '<b>You marked this guide as read.</b>' : 'Read it end-to-end, then mark it as read to complete the module.'}</p>
        <div class="guide-meta">
          ${mod.art.map(a => `<a class="artifact" target="_blank" rel="noopener" href="${REPO_TREE}${a.href}" style="--c:${mod.color}"><span class="a-ico">🗂️</span> <span>${a.label}</span></a>`).join('')}
        </div>
      </div>
      <div class="ph-side">
        <div class="ring sm" style="--p:${p.pct};--c:${mod.color}"><span>${p.pct}<small>%</small></span></div>
        <div class="ph-stats"><span>${read ? '✓ guide read' : 'guide unread'}</span></div>
        <a class="btn ghost sm" target="_blank" rel="noopener" href="${GUIDE}${mod.guide}">📄 raw on GitHub</a>
      </div>
    </div>

    <div class="guide-wrap reveal">
      <aside class="guide-toc" aria-label="Table of contents">
        <div class="toc-title">On this guide</div>
        <div id="guideToc"><div class="gt-loading">…</div></div>
      </aside>
      <article class="article guide-article" style="--c:${mod.color}">
        <div class="guide-loading"><span class="spinner"></span> Loading the full guide…</div>
      </article>
    </div>

    <div class="lesson-foot reveal">
      <div class="lf-left">
        <button class="btn primary" id="greadBtn">${read ? '✓ Guide read — toggle' : '✔ Mark guide as read'}</button>
      </div>
      <div class="lf-right">
        ${mod.n > 1 ? `<a class="btn ghost sm" href="#/guide/${MODULES[mod.n - 2].id}">← ${MODULES[mod.n - 2].title}</a>` : ''}
        ${mod.n < MODULES.length
          ? `<a class="btn primary sm" href="#/guide/${MODULES[mod.n].id}">${MODULES[mod.n].title} →</a>`
          : `<a class="btn primary sm" href="#/quiz/${mod.id}">🎯 Take the final quiz →</a>`}
      </div>
    </div>`;

  fetchGuide(mod).then(src => {
    const article = $('.guide-article');
    article.innerHTML = md(src, { skipH1: true });
    buildGuideToc();
    if (route.anchor) {
      const el = document.getElementById(route.anchor);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
    }
    const fail = $('.guide-loading', article);
    if (fail) fail.remove();
  }).catch(() => {
    const article = $('.guide-article');
    article.innerHTML = `
      <div class="guide-fail">
        <div class="gf-ico">⚠️</div>
        <h3>Could not load the guide file</h3>
        <p>The full guide is served from <code class="inline">docs/guide/${esc(mod.guide)}</code> in this repo. If you are viewing a local file (not through GitHub Pages), the fetch may be blocked.</p>
        <a class="btn" target="_blank" rel="noopener" href="${GUIDE}${mod.guide}">📄 Open the guide on GitHub</a>
      </div>`;
  });

  const rb = $('#greadBtn');
  if (rb) rb.addEventListener('click', () => { markGuideRead(mod.id, !guideRead(mod.id)); toast(guideRead(mod.id) ? 'Guide marked as read — module complete! 🎉' : 'Guide marked as unread'); render(); });

  store.lastOpen = { mid: mod.id, li: 0 }; save();
  requestAnimationFrame(() => window.scrollTo(0, 0));
}

function buildGuideToc() {
  const toc = $('#guideToc');
  if (!toc) return;
  toc.innerHTML = '';
  if (!mdToc.length) { toc.innerHTML = '<div class="gt-empty">Smooth reading — no section headings in this file.</div>'; return; }
  mdToc.forEach(t => {
    const a = document.createElement('a');
    a.className = 'gt-item lvl' + t.lvl;
    a.textContent = t.label;
    a.href = '#/guide/' + route.mid + '/' + t.slug;
    a.addEventListener('click', e => {
      e.preventDefault();
      const el = document.getElementById(t.slug);
      if (el) {
        route.anchor = t.slug;
        history.replaceState(null, '', '#' + hashFor());
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    toc.appendChild(a);
  });
}

/* ------------------------- quiz page ------------------------- */

function renderQuiz(mod) {
  const qs = mod.quiz.questions;
  const prevBest = store.quiz[mod.id]; // fractional 0..1
  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>›</span> <a href="#/phase/${mod.id}">${mod.title}</a> <span>›</span> <b>Quiz</b></div>

    <div class="quiz-top reveal" style="--c:${mod.color}">
      <div>
        <div class="ph-kicker">Phase ${String(mod.n).padStart(2, '0')} · ${mod.quiz.title}</div>
        <h1>${mod.icon} ${mod.title} — Quiz</h1>
        <p class="qc-sub">${qs.length} questions. Answer all, get instant feedback + explanations, then save your score.</p>
      </div>
      <div class="quiz-best">
        ${prevBest != null
          ? `Best: <b>${Math.round(prevBest * qs.length)}/${qs.length}</b> · ${Math.round(prevBest * 100)}%`
          : 'No score yet'}
      </div>
    </div>

    <div class="quiz-list reveal" id="quizList"></div>
    <div class="lesson-foot reveal" id="quizFoot"></div>`;

  const list = $('#quizList');
  qs.forEach((q, qi) => {
    const item = document.createElement('div');
    item.className = 'q-item';
    item.dataset.qi = qi;
    item.innerHTML = `
      <div class="q-head"><span class="q-num">Q${qi + 1}</span><span class="q-prog"></span></div>
      <div class="q-text">${esc(q.q)}</div>
      <div class="q-opts">
        ${q.opts.map((o, oi) => `
          <button class="q-opt" data-oi="${oi}">
            <span class="q-letter">${String.fromCharCode(65 + oi)}</span>
            <span class="q-otext">${esc(o)}</span>
            <span class="q-mark"></span>
          </button>`).join('')}
      </div>
      <div class="q-why" hidden><div class="qw-label"></div><div class="qw-text">${esc(q.why)}</div></div>`;
    list.appendChild(item);
  });

  // footer buttons
  const foot = $('#quizFoot');
  foot.innerHTML = `
    <div class="lf-left"><button class="btn ghost sm" id="resetQuiz">↺ Reset</button></div>
    <div class="lf-right">
      <button class="btn primary" id="saveScore" disabled>✓ Save my score</button>
      <a class="btn ghost sm" href="#/phase/${mod.id}">Back to module</a>
    </div>`;

  $('#resetQuiz').addEventListener('click', () => renderQuiz(mod));

  const saveBtn = $('#saveScore');
  let answered = 0, score = 0;
  const reset = () => { answered = 0; score = 0; saveBtn.disabled = true; };

  $$('.q-item', list).forEach(item => {
    const qi = +item.dataset.qi;
    const prog = $('.q-prog', item);

    $$('.q-opt', item).forEach(btn => {
      btn.addEventListener('click', () => {
        if (item.dataset.state) return; // already answered
        const oi = +btn.dataset.oi;
        const correct = oi === qs[qi].a;
        item.dataset.state = correct ? 'right' : 'wrong';
        prog.textContent = item.dataset.state === 'right' ? '✓ correct' : '✗';
        prog.classList.add(item.dataset.state === 'right' ? 'ok' : 'bad');

        $$('.q-opt', item).forEach(o => {
          const t = +o.dataset.oi;
          o.classList.add(t === qs[qi].a ? 'right' : 'dim');
          if (t === oi && !correct) o.classList.add('wrong');
          o.disabled = true;
        });
        const why = $('.q-why', item);
        why.hidden = false;
        $('.qw-label', why).textContent = item.dataset.state === 'right' ? '🎉 That\u2019s right' : '🙈 Not quite';
        why.classList.add(item.dataset.state === 'right' ? 'ok' : 'bad');

        answered++; if (correct) score++;
        saveBtn.disabled = answered < qs.length;
        if (answered === qs.length) {
          const pct = Math.round(score / qs.length * 100);
          toast(`Quiz complete: ${score}/${qs.length} (${pct}%)`);
          if (pct === 100) confetti();
        }
      });
    });
  });

  saveBtn.addEventListener('click', () => {
    const pct = score / qs.length;
    if (prevBest == null || pct > prevBest) {
      store.quiz[mod.id] = pct;
      store.best[mod.id] = Math.round(pct * qs.length);
      save();
      toast('Score saved — keep it up! 🏆');
      saveBtn.textContent = '✓ Saved — nice work!';
      saveBtn.disabled = true;
    }
    renderSidebar();
  });
}

/* ------------------------- toast ------------------------- */

let toastTimer;
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ------------------------- confetti ------------------------- */

function confetti() {
  const colors = ['#00A1E0', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#e8b93d'];
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('i');
    p.className = 'confetti';
    const x = Math.random() * 100;
    const d = Math.random() * 2.4 + 1.2;
    const s = 8 + Math.random() * 8;
    p.style.left = x + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = d + 's';
    p.style.width = p.style.height = s + 'px';
    p.style.setProperty('--tx', (Math.random() * 160 - 80) + 'px');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), d * 1000 + 400);
  }
}

/* ------------------------- events wiring ------------------------- */

document.addEventListener('click', e => {
  const sc = e.target.closest('.selfcheck');
  if (sc) {
    const a = $('.sc-a', sc); const btn = $('.showA', sc);
    if (a.hidden) { a.hidden = false; btn.textContent = 'Hide answer'; }
    else { a.hidden = true; btn.textContent = 'Show answer'; }
    return;
  }
  const copy = e.target.closest('.cb-copy');
  if (copy) {
    const pre = document.getElementById(copy.dataset.copy);
    if (pre) {
      const txt = pre.innerText;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
        .then(() => { copy.textContent = '✓ Copied'; setTimeout(() => copy.textContent = '⧉ Copy', 1400); })
        .catch(() => { /* fallback select */ const r = document.createRange(); r.selectNodeContents(pre); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('copy'); copy.textContent = '✓ Copied'; setTimeout(() => copy.textContent = '⧉ Copy', 1400); });
    }
  }
});

/* search */
let searchBox = null;
function ensureSearch() {
  if (searchBox) return searchBox;
  searchBox = document.createElement('div');
  searchBox.className = 'search-wrap';
  searchBox.innerHTML = `<input id="globalQ" type="search" placeholder="Search lessons, concepts, topics…" autocomplete="off" />
    <div class="search-results" id="searchRes"></div>`;
  document.body.appendChild(searchBox);

  const input = $('#globalQ', searchBox);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const first = $('.sr-item', wrap);
      if (first) { location.hash = first.getAttribute('href'); closeSearch(); }
    }
    if (e.key === 'Escape') closeSearch();
  });

  const wrap = $('#searchRes', searchBox);
  input.addEventListener('input', runSearch);
  input.addEventListener('focus', () => { if (input.value.trim().length >= 2) searchBox.classList.add('open'); });
  return searchBox;
}

function runSearch() {
  const sb = searchBox || ensureSearch();
  const input = $('#globalQ', sb);
  const wrap = $('#searchRes', sb);
  const q = input.value.trim().toLowerCase();
  wrap.innerHTML = '';
  if (q.length < 2) { sb.classList.remove('open'); return; }

  const results = [];
  MODULES.forEach(m => {
    m.lessons.forEach((l, i) => {
      const hay = (m.title + ' ' + m.tagline + ' ' + l.title + ' ' + m.objectives.join(' ') + ' ' + l.blocks.map(bd => bd.x || (bd.items || []).join(' ')).join(' ')).toLowerCase();
      if (hay.includes(q) || m.title.toLowerCase().includes(q)) {
        results.push({ mod: m, li: i, label: m.title + ' → ' + l.title });
      }
    });
    m.quiz.questions.forEach(qq => {
      if ((qq.q + ' ' + qq.why).toLowerCase().includes(q)) {
        results.push({ mod: m, quiz: true, label: `Quiz · ${m.title}: "${qq.q.slice(0, 60)}…"` });
      }
    });
  });
  const seen = new Set(); const uniq = [];
  results.forEach(r => { const k = r.quiz ? 'q' + r.label : r.mod.id + ':' + r.li; if (!seen.has(k)) { seen.add(k); uniq.push(r); } });
  if (!uniq.length) { wrap.innerHTML = '<div class="sr-empty">No results — try "lead", "flow", "report", "quota"…</div>'; }
  else {
    uniq.slice(0, 10).forEach(r => {
      const a = document.createElement('a');
      a.className = 'sr-item';
      a.href = r.quiz ? '#/quiz/' + r.mod.id : '#/lesson/' + r.mod.id + '/' + r.li;
      a.innerHTML = `<span class="sr-ico">${r.quiz ? '🧠' : r.mod.icon}</span><span>${r.label}</span><span class="sr-go">→</span>`;
      a.addEventListener('click', closeSearch);
      wrap.appendChild(a);
    });
  }
  sb.classList.add('open');
}

function openSearch() {
  const sb = ensureSearch();
  sb.classList.add('open');
  const inp = $('#globalQ', sb);
  inp.focus();
  const top = $('#topSearch');
  if (top) { inp.value = top.value; }
  runSearch();
}
function closeSearch() {
  if (searchBox) { searchBox.classList.remove('open'); const inp = $('#globalQ', searchBox); inp.value = ''; }
}

/* hotkey */
window.addEventListener('keydown', e => {
  const ae = document.activeElement;
  const typing = ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA');
  if ((e.key === '/' || e.key === 'f') && !e.ctrlKey && !e.metaKey) {
    if (!typing) { e.preventDefault(); openSearch(); }
    return;
  }
  if (e.key === 'Escape') {
    if (searchBox && searchBox.classList.contains('open')) { closeSearch(); e.preventDefault(); return; }
  }
  if (e.key === 'ArrowLeft' && !typing && route.view === 'lesson') {
    const mod = byId(route.mid);
    if (route.li > 0) navigate('lesson', route.mid, route.li - 1);
  }
  if (e.key === 'ArrowRight' && !typing && route.view === 'lesson') {
    const mod = byId(route.mid);
    if (route.li < mod.lessons.length - 1) navigate('lesson', route.mid, route.li + 1);
  }
});

function bindTopSearch() {
  const topQ = $('#topSearch');
  if (!topQ || topQ.dataset.bound) return;
  topQ.dataset.bound = '1';
  topQ.addEventListener('focus', () => {
    const sb = ensureSearch();
    sb.classList.add('open');
    $('#globalQ', sb).value = topQ.value;
    runSearch();
  });
  topQ.addEventListener('input', () => {
    const sb = ensureSearch();
    sb.classList.add('open');
    $('#globalQ', sb).value = topQ.value;
    runSearch();
  });
}

/* ------------------------- exam facts page ------------------------- */
/* Renders assets/examfacts.js — the single source of truth that also feeds
   guide 13, the README and the Certification_Setting__mdt custom metadata. */

function renderFacts() {
  const F = EXAM_FACTS;
  const wt = (d, total) => `<div class="wt-row"><span class="wt-name">${esc(d.name)}</span><span class="wt-bar"><i style="width:${(d.weight / total) * 100}%;background:${d.color || 'var(--accent)'}"></i></span><span class="wt-pct">${d.weight}%</span></div>`;

  const track = t => {
    const total = t.domains.reduce((a, d) => a + d.weight, 0) || 100;
    return `
    <section class="track-card reveal" style="--c:${t.color}">
      <header class="track-head">
        <div class="ph-kicker">${t.code}</div>
        <h2>${esc(t.name)}</h2>
        <p class="qc-sub">${esc(t.tagline)}</p>
      </header>
      <div class="fact-grid">
        ${t.facts.map(f => `<div class="fact"><span class="fact-k">${esc(f.k)}</span><span class="fact-v">${esc(f.v)}</span></div>`).join('')}
      </div>
      <h3 class="track-h3">Exam outline &amp; weighting</h3>
      <div class="wt-list">${t.domains.map(d => wt(d, total)).join('')}</div>
      <h3 class="track-h3">Objectives to master</h3>
      <ul class="tick-list">${t.objectives.map(o => `<li>${esc(o)}</li>`).join('')}</ul>
      ${t.pacing ? `<div class="callout warn"><b>Pacing:</b> ${esc(t.pacing)}</div>` : ''}
      ${t.note ? `<div class="callout info"><b>Note:</b> ${esc(t.note)}</div>` : ''}
    </section>`;
  };

  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <b>Exam facts &amp; blueprints</b></div>
    <div class="ph-hero reveal" style="--c:#38bdf8">
      <div class="ph-kicker">verified ${esc(F.verifiedOn)}</div>
      <h1 class="ph-title">${esc(F.title)}</h1>
      <p class="qc-sub">${esc(F.sub)}</p>
      <div class="ph-stats">
        <span>${F.tracks.length} certification tracks</span>
        <span>${F.sources.length} sources</span>
        <span>${F.ladder.length} ladder rungs</span>
      </div>
    </div>

    <div class="callout warn reveal"><b>Exam facts drift.</b> Salesforce re-issues exam guides and pricing periodically. Re-verify against the official exam guide before you book the exam. Sources used for this snapshot are listed at the bottom.</div>

    ${F.tracks.map(track).join('')}

    <section class="track-card reveal" style="--c:#a78bfa">
      <h2 class="track-h3" style="margin-top:0">Credential ladder</h2>
      <table class="tbl">
        <thead><tr><th>Credential</th><th>Prerequisite</th><th>Why it matters for you</th></tr></thead>
        <tbody>${F.ladder.map(r => `<tr><td><b>${esc(r.name)}</b></td><td>${esc(r.pre)}</td><td>${esc(r.why)}</td></tr>`).join('')}</tbody>
      </table>
    </section>

    <section class="track-card reveal" style="--c:#34d399">
      <h2 class="track-h3" style="margin-top:0">Retirements &amp; renames to stop using</h2>
      <table class="tbl">
        <thead><tr><th>Old name</th><th>Current name / status</th><th>Impact</th></tr></thead>
        <tbody>${F.renames.map(r => `<tr><td>${esc(r.old)}</td><td><b>${esc(r.now)}</b></td><td>${esc(r.impact)}</td></tr>`).join('')}</tbody>
      </table>
    </section>

    <section class="track-card reveal" style="--c:#fb923c">
      <h2 class="track-h3" style="margin-top:0">Sources</h2>
      <ol class="tick-list">${F.sources.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      <p class="qc-sub">Last verified ${esc(F.verifiedOn)}. Re-run the verification pass before each exam attempt.</p>
    </section>`;
}

/* ------------------------- mock exam simulator ------------------------- */
/* Draws a deterministic 60-question paper from EXAM_FACTS.bank, times it at
   the real 105-minute limit and scores per blueprint domain. */

let mock = null;

/* Largest-remainder apportionment so the per-domain question counts add up to
   exactly the paper size. Weights are percentages, so they may not divide the
   paper size evenly (13% of 60 is 7.8). */
function mockTargets(domains, paperSize) {
  const raw = domains.map(d => ({ name: d.name, exact: paperSize * d.weight / 100 }));
  const out = raw.map(r => ({ name: r.name, want: Math.max(1, Math.floor(r.exact)) }));
  const byFrac = raw
    .map((r, i) => ({ i, frac: r.exact - Math.floor(r.exact) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  let remaining = paperSize - out.reduce((a, r) => a + r.want, 0);
  for (let k = 0; remaining > 0; k++, remaining--) out[byFrac[k % byFrac.length].i].want++;
  for (let k = byFrac.length - 1; remaining < 0; k--, remaining++) {
    if (out[byFrac[((k % byFrac.length) + byFrac.length) % byFrac.length].i].want > 1) {
      out[byFrac[((k % byFrac.length) + byFrac.length) % byFrac.length].i].want--;
    }
  }
  return out;
}

/* A recycled question gets its options rotated so a repeat sighting cannot be
   answered from memory of the letter. The correct index is moved with it. */
function rotateOptions(q, pass) {
  if (!q.opts || q.opts.length < 2) return q;
  const shift = 1 + (pass % (q.opts.length - 1));
  return {
    ...q,
    opts: q.opts.slice(shift).concat(q.opts.slice(0, shift)),
    a: (q.a - shift + q.opts.length) % q.opts.length
  };
}

function mockPick() {
  // cyrb53 makes the shuffle deterministic: same paper for the same seed.
  const F = EXAM_FACTS;
  const size = F.mock;
  const bank = F.bank.slice().sort((a, b) => cyrb53(F.seed + a.id) - cyrb53(F.seed + b.id));
  const picked = [];
  mockTargets(F.tracks[1].domains, size).forEach(t => {
    const pool = bank.filter(q => q.domain === t.name);
    if (!pool.length) return;
    for (let k = 0; k < t.want; k++) picked.push(k < pool.length ? pool[k] : rotateOptions(pool[k % pool.length], k));
  });
  return picked
    .map((q, i) => ({ q, k: cyrb53(F.seed + '|' + q.id + '|' + q.opts.join('|') + '|' + i) }))
    .sort((a, b) => a.k - b.k)
    .map(x => x.q);
}

function renderMock() {
  if (mock && mock.done) return renderMockResult();

  view.innerHTML = `
    <div class="crumb reveal"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <b>Mock exam simulator</b></div>
    <div class="ph-hero reveal" style="--c:#f472b6">
      <div class="ph-kicker">MCN Consultant paper &middot; ${EXAM_FACTS.mock} scored questions &middot; 105 minutes</div>
      <h1 class="ph-title">Mock exam simulator</h1>
      <p class="qc-sub">Timed at the real limits: ${EXAM_FACTS.mock} scored questions, 105 minutes, ${EXAM_FACTS.tracks[1].pass}% to pass. Questions are drawn per blueprint domain so your result shows exactly where you leak points.</p>
    </div>
    <div class="mock-start reveal">
      <div class="fact-grid">
        <div class="fact"><span class="fact-k">Questions</span><span class="fact-v">${EXAM_FACTS.mock} scored</span></div>
        <div class="fact"><span class="fact-k">Time limit</span><span class="fact-v">105:00</span></div>
        <div class="fact"><span class="fact-k">Pass mark</span><span class="fact-v">${EXAM_FACTS.tracks[1].pass}%</span></div>
        <div class="fact"><span class="fact-k">Per question</span><span class="fact-v">1 min 45 s</span></div>
        <div class="fact"><span class="fact-k">Question bank</span><span class="fact-v">${EXAM_FACTS.bank.length} questions</span></div>
        <div class="fact"><span class="fact-k">Seed</span><span class="fact-v">${esc(EXAM_FACTS.seed)}</span></div>
      </div>
      <p class="qc-sub">Closed book. No notes, no phone. Flag anything you are unsure about and come back to it &mdash; that is how the real paper behaves.</p>
      <p class="qc-sub">The paper is apportioned to the blueprint, so a ${EXAM_FACTS.tracks[1].domains[0].weight}%-weight domain needs more questions than the bank holds and those items are recycled with their options rotated. The seed is fixed, so the same paper comes back until you change it in <code class="inline">assets/examfacts.js</code>.</p>
      <button class="btn primary" id="mockStart">▶ Start the paper</button>
    </div>`;

  const b = $('#mockStart');
  if (b) b.addEventListener('click', startMock);
}

function startMock() {
  const qs = mockPick();
  mock = { qs, answers: {}, flags: {}, left: 105 * 60, done: false, timer: null };
  paintMock();
  mock.timer = setInterval(tickMock, 1000);
}

function tickMock() {
  if (!mock || mock.done) return;
  mock.left--;
  const t = $('#mockClock');
  if (t) {
    const m = String(Math.floor(mock.left / 60)).padStart(2, '0');
    const s = String(mock.left % 60).padStart(2, '0');
    t.textContent = m + ':' + s;
    t.classList.toggle('urgent', mock.left < 600);
  }
  if (mock.left <= 0) { clearInterval(mock.timer); finishMock(); }
}

function paintMock() {
  const F = EXAM_FACTS;
  view.innerHTML = `
    <div class="crumb"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <b>Mock exam</b></div>
    <div class="mock-bar">
      <span class="mock-clock" id="mockClock">${String(Math.floor(mock.left / 60)).padStart(2, '0')}:${String(mock.left % 60).padStart(2, '0')}</span>
      <span class="mock-prog">${mock.qs.length} questions &middot; ${F.tracks[1].pass}% to pass</span>
      <button class="btn primary sm" id="mockSubmit">Submit paper</button>
    </div>
    <div class="mock-list">
      ${mock.qs.map((q, i) => `
        <article class="mock-q reveal" data-i="${i}">
          <div class="mq-head">
            <span class="mq-n">${i + 1}</span>
            <span class="mq-dom">${esc(q.domain)}</span>
            <button class="mq-flag" data-flag="${i}">${mock.flags[i] ? '⚑ flagged' : '⚐ flag'}</button>
          </div>
          <p class="mq-q">${esc(q.q)}</p>
          <div class="mq-opts">
            ${q.opts.map((o, oi) => `
              <label class="mq-opt">
                <input type="radio" name="q${i}" value="${oi}" ${mock.answers[i] === oi ? 'checked' : ''} />
                <span>${esc(o)}</span>
              </label>`).join('')}
          </div>
          <div class="mq-why" hidden><b>Why:</b> ${esc(q.why)}</div>
        </article>`).join('')}
    </div>`;

  view.addEventListener('change', e => {
    const m = /^q(\d+)$/.exec(e.target.name || '');
    if (m) mock.answers[Number(m[1])] = Number(e.target.value);
  });
  $$('.mq-flag').forEach(b => b.addEventListener('click', () => {
    const i = Number(b.dataset.flag);
    mock.flags[i] = !mock.flags[i];
    b.textContent = mock.flags[i] ? '⚑ flagged' : '⚐ flag';
  }));
  $('#mockSubmit').addEventListener('click', () => {
    if (!confirm('Submit the paper? You have ' + Math.floor(mock.left / 60) + ' min left.')) return;
    clearInterval(mock.timer);
    finishMock();
  });
}

function finishMock() {
  mock.done = true;
  if (mock.timer) clearInterval(mock.timer);

  // MCQ: exactly one correct option.
  const per = {};
  let correct = 0;
  mock.qs.forEach((q, i) => {
    const dom = q.domain;
    per[dom] = per[dom] || { got: 0, total: 0, weight: 0 };
    per[dom].total++;
    if (mock.answers[i] === q.a) { correct++; per[dom].got++; }
  });
  EXAM_FACTS.tracks[1].domains.forEach(d => {
    if (per[d.name]) per[d.name].weight = d.weight;
  });

  const pct = Math.round((correct / mock.qs.length) * 100);
  const pass = EXAM_FACTS.tracks[1].pass;

  view.innerHTML = `
    <div class="crumb"><a href="#/">Dashboard</a> <span>&rsaquo;</span> <b>Mock result</b></div>
    <div class="ph-hero reveal" style="--c:${pct >= pass ? '#34d399' : '#f87171'}">
      <div class="ph-kicker">mock exam complete</div>
      <h1 class="ph-title">${pct}% &mdash; ${pct >= pass ? 'PASS ✅' : 'NOT YET ❌'}</h1>
      <p class="qc-sub">${correct} / ${mock.qs.length} correct against a ${pass}% pass mark. ${pct >= pass ? 'You are above the line — tighten the weakest domain below and you are there.' : 'Work the domains below in weight order. The heaviest domain is where the points are.'}</p>
    </div>

    <section class="track-card reveal" style="--c:#38bdf8">
      <h2 class="track-h3" style="margin-top:0">Score by blueprint domain</h2>
      <table class="tbl">
        <thead><tr><th>Domain</th><th>Weight</th><th>Correct</th><th>Domain score</th><th>Verdict</th></tr></thead>
        <tbody>${Object.keys(per).sort((a, b) => per[b].weight - per[a].weight).map(d => {
          const r = per[d];
          const p = Math.round((r.got / r.total) * 100);
          return `<tr><td><b>${esc(d)}</b></td><td>${r.weight}%</td><td>${r.got}/${r.total}</td>
            <td><span class="wt-bar sm"><i style="width:${p}%;background:${p >= 75 ? '#34d399' : p >= 60 ? '#fbbf24' : '#f87171'}"></i></span> ${p}%</td>
            <td>${p >= 75 ? 'strong' : p >= 60 ? 'shaky' : 'rebuild this'}</td></tr>`;
        }).join('')}</tbody>
      </table>
    </section>

    <section class="track-card reveal" style="--c:#a78bfa">
      <h2 class="track-h3" style="margin-top:0">Review &mdash; every question, every why</h2>
      ${mock.qs.map((q, i) => {
        const mine = mock.answers[i];
        const ok = mine === q.a;
        return `<div class="mock-q ${ok ? 'ok' : 'bad'}">
          <div class="mq-head"><span class="mq-n">${i + 1}</span><span class="mq-dom">${esc(q.domain)}</span><span class="mq-verdict">${ok ? '✓' : '✗'}</span></div>
          <p class="mq-q">${esc(q.q)}</p>
          <p class="mq-ans">Your answer: <b>${mine == null ? '<i>not answered</i>' : esc(q.opts[mine])}</b>${ok ? '' : ' &nbsp;→&nbsp; Correct: <b class="ok-txt">' + esc(q.opts[q.a]) + '</b>'}</p>
          <p class="mq-why-inline"><b>Why:</b> ${esc(q.why)}</p>
        </div>`;
      }).join('')}
    </section>

    <div class="hero-actions reveal">
      <button class="btn primary" id="againBtn">🔁 New paper</button>
      <a class="btn ghost" href="#/facts">🎯 Blueprint reference</a>
      <a class="btn ghost" href="#/phase/m13">📘 Certification prep guide</a>
    </div>`;

  $('#againBtn').addEventListener('click', () => { mock = null; renderMock(); });
  if (pct >= pass) confetti();
}

/* ------------------------- lazy event (hashchange) ------------------------- */
window.addEventListener('hashchange', () => { route = parseHash(); render(); });

/* ------------------------- boot ------------------------- */
route = parseHash();
render();

/* mobile menu */
const menuBtn = $('#menuBtn');
if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    document.body.classList.toggle('sb-open');
    if (document.body.classList.contains('sb-open')) {
      const first = $('.side-phase');
      if (first) first.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  });
}
document.addEventListener('click', e => {
  if (document.body.classList.contains('sb-open') && !e.target.closest('.sidebar') && !e.target.closest('#menuBtn')) {
    document.body.classList.remove('sb-open');
  }
});

/* theme toggle */
const themeBtn = $('#themeToggle');
if (themeBtn) {
  themeBtn.textContent = getTheme() === 'dark' ? '🌙' : '☀️';
  themeBtn.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });
}