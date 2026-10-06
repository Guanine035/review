import { units, getUnit } from './content/index.js';
import { rich } from './render.js';
import { answerMatches, escapeHtml, formatPercent } from './text.js';
import { store } from './storage.js';
import { LEVELS } from './content/util.js';
import { generateSession, generateWrongBookSession, PRACTICE_MODES, randomSeed } from './practice.js';
import { generatePaper, getPastPaper, paperTotal, objectiveScore, selfScore } from './exam.js';

const app = document.getElementById('app');
const tabbar = document.getElementById('tabbar');

const ICONS = {
  notes:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  examples:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  practice:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  exam:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
  wrong:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/><path d="m14.5 7.5-5 5M9.5 7.5l5 5"/></svg>'
};

const TAB_ITEMS = [
  { id: 'notes', label: '笔记', icon: ICONS.notes },
  { id: 'examples', label: '例题', icon: ICONS.examples },
  { id: 'practice', label: '练习', icon: ICONS.practice },
  { id: 'exam', label: '试卷', icon: ICONS.exam },
  { id: 'wrong', label: '错题', icon: ICONS.wrong }
];

const state = {
  view: 'notes',
  unitId: store.settings().unitId || 'sets',
  level: store.settings().level || 2,
  mode: store.settings().mode || 'mixed',
  practiceScope: 'all',
  open: {},
  session: null,
  exam: null,
  message: ''
};

function scopeStore(scope) {
  return scope === 'exam' ? state.exam : state.session;
}

function unitById(id) {
  return getUnit(id);
}

function currentUnit() {
  return unitById(state.unitId);
}

function persistSettings() {
  store.saveSettings({ unitId: state.unitId, level: state.level, mode: state.mode });
}

function unitChips() {
  return `<div class="chips" role="group" aria-label="选择单元">${units
    .map(
      (unit) =>
        `<button class="chip" data-action="unit" data-id="${unit.id}" aria-pressed="${state.unitId === unit.id}">${unit.order}. ${unit.titleZh}</button>`
    )
    .join('')}</div>`;
}

function practiceScopeChips() {
  return `<div class="chips" role="group" aria-label="练习范围">
    <button class="chip" data-action="scope" data-id="all" aria-pressed="${state.practiceScope === 'all'}">全部单元</button>
    ${units
      .map(
        (unit) =>
          `<button class="chip" data-action="scope" data-id="${unit.id}" aria-pressed="${state.practiceScope === unit.id}">${unit.titleZh}</button>`
      )
      .join('')}
  </div>`;
}

function levelSeg() {
  return `<div class="seg" role="group" aria-label="难度">${LEVELS.map(
    (level) =>
      `<button data-action="level" data-id="${level.id}" aria-pressed="${state.level === level.id}">${level.label}</button>`
  ).join('')}</div>`;
}

function modeSeg() {
  return `<div class="seg" role="group" aria-label="练习模式">${PRACTICE_MODES.map(
    (mode) =>
      `<button data-action="mode" data-id="${mode.id}" aria-pressed="${state.mode === mode.id}">${mode.label}</button>`
  ).join('')}</div>`;
}

function topbar(title, sub) {
  return `<header class="topbar"><h1>${escapeHtml(title)}${
    sub ? `<span class="sub">${escapeHtml(sub)}</span>` : ''
  }</h1></header>`;
}

function renderTabbar() {
  tabbar.innerHTML = TAB_ITEMS.map(
    (item) =>
      `<button data-action="nav" data-id="${item.id}" aria-current="${state.view === item.id ? 'page' : 'false'}" title="${item.label}">${item.icon}<span>${item.label}</span></button>`
  ).join('');
}

function notesView() {
  const unit = currentUnit();
  return `${topbar('笔记 Notes', '中文讲解 + English terms')}${unitChips()}
  <section class="card"><div class="meta-row"><span class="badge accent">Unit ${unit.order}</span><span class="badge indigo">${escapeHtml(
    unit.title
  )}</span></div><h2>${escapeHtml(unit.titleZh)}</h2><p class="muted">${escapeHtml(unit.summary)}</p></section>
  ${unit.notes
    .map(
      (section) =>
        `<section class="card"><h2>${escapeHtml(section.heading)}</h2>${section.body
          .map((paragraph) => `<p>${rich(paragraph)}</p>`)
          .join('')}</section>`
    )
    .join('')}
  <section class="card"><h2>方法模板 Method templates</h2>${unit.methods
    .map(
      (method) =>
        `<h4>${escapeHtml(method.name)}</h4><p class="small muted">${escapeHtml(method.when)}</p><ol class="steps">${method.steps
          .map((step) => `<li>${rich(step)}</li>`)
          .join('')}</ol><p class="small"><strong>Watch:</strong> ${rich(method.watch)}</p>`
    )
    .join('')}</section>`;
}

function examplesView() {
  const unit = currentUnit();
  return `${topbar('例题 Worked examples', '先自己想，再看完整步骤')}${unitChips()}
  ${unit.examples
    .map((example, index) => {
      const key = `${unit.id}-example-${index}`;
      const open = Boolean(state.open[key]);
      return `<section class="card">
        <div class="meta-row"><span class="badge indigo">Example ${index + 1}</span><span class="badge">${escapeHtml(
          unit.titleZh
        )}</span></div>
        <h2>${escapeHtml(example.title)}</h2>
        <div class="math-block">${rich(example.prompt)}</div>
        <button class="btn ghost" data-action="toggle" data-key="${key}">${open ? '收起步骤' : '显示一步步解答'}</button>
        ${
          open
            ? `<div class="solution"><ol class="steps">${example.steps
                .map((step) => `<li>${rich(step)}</li>`)
                .join('')}</ol><p><strong>Answer:</strong> ${rich(example.answer)}</p></div>`
            : ''
        }
      </section>`;
    })
    .join('')}`;
}

function choicesHtml(question, selected, checked, scope) {
  return `<div class="choices">${question.choices
    .map((choice, index) => {
      const isSelected = Number(selected) === index;
      const correct = checked && index === question.answer;
      const wrong = checked && isSelected && index !== question.answer;
      return `<button class="choice${correct ? ' correct' : ''}${wrong ? ' wrong' : ''}" data-action="choose" data-scope="${scope}" data-qid="${question.id}" data-index="${index}" aria-pressed="${isSelected}"><span class="key">${String.fromCharCode(
        65 + index
      )}</span><span>${rich(choice)}</span></button>`;
    })
    .join('')}</div>`;
}

function rubricHtml(question, scope) {
  const holder = scopeStore(scope);
  const rubricState = holder.rubric[question.id] || {};
  return `<div class="rubric">${(question.rubric || [])
    .map(
      (item, index) =>
        `<label><input type="checkbox" data-action="rubric" data-scope="${scope}" data-qid="${question.id}" data-index="${index}" ${
          rubricState[index] ? 'checked' : ''
        }><span>${rich(item.point)}</span><span class="m">${item.marks}</span></label>`
    )
    .join('')}</div>`;
}

function solutionHtml(question, scope) {
  const holder = scopeStore(scope);
  if (!holder.revealed[question.id]) return '';
  return `<div class="solution">
    <h4>Standard solution / 标准解答</h4>
    <ol class="steps">${(question.solutionSteps || []).map((step) => `<li>${rich(step)}</li>`).join('')}</ol>
    ${
      question.kind === 'proof' && question.rubric
        ? `<h4>Marking points / 评分点（勾选你拿到分的点）</h4>${rubricHtml(question, scope)}`
        : ''
    }
  </div>`;
}

function questionCard(question, scope, options = {}) {
  const holder = scopeStore(scope);
  const selected = holder.answers[question.id];
  const checked = Boolean(holder.checked[question.id]);
  const isProof = question.kind === 'proof';
  const unit = unitById(question.unitId);
  const kindLabel =
    question.kind === 'tf' ? 'True / False' : question.kind === 'mcq' ? 'Multiple choice' : question.kind === 'short' ? 'Short answer' : 'Long question';
  const isCorrect = !isProof && checked && answerMatches(selected, question);
  const feedback = checked
    ? isProof
      ? ''
      : `<div class="feedback ${isCorrect ? 'ok' : 'bad'}">${isCorrect ? 'Correct.' : 'Not correct.'} ${rich(
          (question.solutionSteps || [])[0] || ''
        )}</div>`
    : '';
  return `<section class="card" data-question="${question.id}">
    <div class="meta-row"><span class="badge accent">${escapeHtml(unit.titleZh)}</span><span class="badge">${kindLabel}</span><span class="badge warn">${
      question.marks || 2
    } marks</span>${options.number ? `<span class="badge indigo">Q${options.number}</span>` : ''}</div>
    <div class="math-block">${rich(question.prompt)}</div>
    ${
      question.choices
        ? choicesHtml(question, selected, checked, scope)
        : isProof
          ? `<textarea class="answer-input" data-action="proof-input" data-scope="${scope}" data-qid="${question.id}" placeholder="Write your proof / working here before revealing the model answer.">${escapeHtml(
              selected || ''
            )}</textarea>`
          : `<input class="answer-input" data-action="short-input" data-scope="${scope}" data-qid="${question.id}" value="${escapeHtml(
              selected || ''
            )}" placeholder="Type your answer">`
    }
    <div class="btn-row">
      ${
        isProof
          ? `<button class="btn indigo" data-action="reveal" data-scope="${scope}" data-qid="${question.id}">${
              holder.revealed[question.id] ? 'Hide answer' : 'Show answer & marking points'
            }</button>`
          : `<button class="btn primary" data-action="submit" data-scope="${scope}" data-qid="${question.id}" ${
              selected === undefined ? 'disabled' : ''
            }>Check answer</button>
             <button class="btn ghost" data-action="reveal" data-scope="${scope}" data-qid="${question.id}">${
               holder.revealed[question.id] ? 'Hide solution' : 'Show solution'
             }</button>`
      }
    </div>
    ${feedback}
    ${solutionHtml(question, scope)}
  </section>`;
}

function practiceSetup() {
  return `${topbar('无限练习 Practice', '默认 70% 长题，题目全英文')}
  <section class="card">
    <h2>练习范围</h2>${practiceScopeChips()}
    <h2>练习模式</h2>${modeSeg()}
    <h2>难度</h2>${levelSeg()}
    <button class="btn primary" data-action="start-practice">开始 10 题练习</button>
  </section>
  <section class="card"><h2>练习说明</h2>
    <p>默认一场 10 题：约 7 道长题（Section B 式证明与多步题）+ 3 道选择 / 判断 / 短答。所有题目使用课件风格模板随机生成，可无限练习。</p>
    <p class="small muted">客观题会自动判分；长题提供英文标准解答和评分点，由你逐项自评。</p>
  </section>`;
}

function practiceSummary() {
  const session = state.session;
  const objective = session.questions.filter((q) => q.kind !== 'proof');
  const correct = objective.filter((q) => session.checked[q.id] && answerMatches(session.answers[q.id], q)).length;
  const long = session.questions.filter((q) => q.kind === 'proof').length;
  return `${topbar('练习完成 Summary', `${session.questions.length} 题`) }
  <section class="card">
    <h2>本轮结果</h2>
    <p>客观题：<strong>${correct}/${objective.length}</strong>，正确率 ${formatPercent(correct, objective.length)}。</p>
    <p>长题：<strong>${long}</strong> 道，已完成自评 ${Object.keys(session.rubric).length} 项。</p>
    <div class="btn-row">
      <button class="btn primary" data-action="start-practice">再来一组</button>
      <button class="btn ghost" data-action="practice-setup">重新设置</button>
    </div>
  </section>
  ${session.questions
    .map((question, index) => `<section class="card"><h2>第 ${index + 1} 题</h2>${questionCard(question, 'session')}</section>`)
    .join('')}`;
}

function practiceView() {
  if (!state.session) return practiceSetup();
  if (state.session.finished) return practiceSummary();
  const session = state.session;
  const question = session.questions[session.index];
  const total = session.questions.length;
  const answered = Object.keys(session.checked).length + Object.keys(session.revealed).length;
  return `${topbar('无限练习 Practice', `第 ${session.index + 1} / ${total} 题`)}
  <section class="card">
    <div class="progress-line"><div class="bar"><span style="width:${Math.round((answered / total) * 100)}%"></span></div><span class="small muted">${answered}/${total}</span></div>
    <div class="btn-row">
      <button class="btn ghost" data-action="prev" ${session.index === 0 ? 'disabled' : ''}>上一题</button>
      <button class="btn ghost" data-action="next" ${session.index >= total - 1 ? 'disabled' : ''}>下一题</button>
      <button class="btn danger" data-action="finish-practice">结束并看总结</button>
    </div>
  </section>
  ${questionCard(question, 'session')}`;
}

function examPicker() {
  return `${topbar('整卷练习 Papers', '不计时，按考试规格出卷')}
  <section class="card">
    <h2>2024-25 历年真题卷</h2>
    <p>5 道长题，共 50 分，包含集合运算、真值表、逆否证明、直接证明和反证法。附完整标准解答与评分点。</p>
    <button class="btn primary" data-action="start-exam" data-type="past">打开历年真题卷</button>
  </section>
  <section class="card">
    <h2>2026-27 规格生成卷</h2>
    <p>10 道 True/False（每题 2 分）+ 4 道长题（每题 20 分），满分 100 分。每次生成新的题目组合。</p>
    <button class="btn indigo" data-action="start-exam" data-type="generated">生成一套新卷</button>
  </section>`;
}

function examView() {
  if (!state.exam) return examPicker();
  const exam = state.exam;
  const paper = exam.paper;
  const total = paperTotal(paper);
  const objScore = objectiveScore(paper, exam.answers, exam.checked);
  const proofScore = selfScore(paper, exam.rubric);
  return `${topbar(paper.title, exam.submitted ? '已交卷' : '不计时练习卷')}
  <section class="card">
    <p class="small muted">${escapeHtml(paper.intro || '')}</p>
    <div class="meta-row"><span class="badge accent">满分 ${total}</span><span class="badge ok">客观题得分 ${objScore}</span><span class="badge indigo">长题自评 ${proofScore}</span></div>
    ${
      exam.submitted
        ? `<div class="feedback ok">Total so far: <strong>${objScore + proofScore} / ${total}</strong>. 长题分数来自你勾选的评分点；未勾选项按 0 分计。</div>`
        : ''
    }
    <div class="btn-row">
      <button class="btn primary" data-action="submit-exam">交卷并计算得分</button>
      <button class="btn ghost" data-action="close-exam">返回试卷选择</button>
    </div>
  </section>
  ${paper.questions
    .map((question) => questionCard(question, 'exam', { number: `${question.section || ''}${question.number || ''}` }))
    .join('')}`;
}

function wrongView() {
  const wrong = store.wrong();
  const progress = store.progress();
  const stats = units
    .map((unit) => {
      const record = progress[unit.id] || { correct: 0, total: 0 };
      return `<div class="card"><div class="meta-row"><span class="badge accent">${unit.titleZh}</span><span class="badge">${record.correct}/${record.total}</span><span class="badge ok">${formatPercent(
        record.correct,
        record.total
      )}</span></div></div>`;
    })
    .join('');
  return `${topbar('错题与进度 Progress', `${wrong.length} 道错题`)}
  <section class="card">
    <h2>分单元正确率</h2>
    ${stats}
    <div class="btn-row">
      <button class="btn ghost" data-action="reset-progress">重置正确率</button>
      <button class="btn danger" data-action="clear-wrong" ${wrong.length ? '' : 'disabled'}>清空错题本</button>
    </div>
  </section>
  ${
    wrong.length
      ? `<section class="card"><h2>重做错题</h2><button class="btn primary" data-action="redo-wrong">开始重做错题</button></section>`
      : '<p class="empty">还没有错题。练习中提交错误的客观题会自动收进这里。</p>'
  }
  ${wrong
    .map(
      (item) => `<section class="card">
        <div class="meta-row"><span class="badge accent">${escapeHtml(unitById(item.unitId).titleZh)}</span><span class="badge warn">${item.marks} marks</span><span class="badge">${item.attempts} attempt(s)</span></div>
        <div class="math-block">${rich(item.prompt)}</div>
        <div class="btn-row">
          <button class="btn ghost" data-action="wrong-toggle" data-id="${item.id}">${state.open[`wrong-${item.id}`] ? '收起解析' : '查看解析'}</button>
          <button class="btn danger" data-action="wrong-remove" data-id="${item.id}">移除</button>
        </div>
        ${
          state.open[`wrong-${item.id}`]
            ? `<div class="solution"><ol class="steps">${(item.solutionSteps || []).map((step) => `<li>${rich(step)}</li>`).join('')}</ol></div>`
            : ''
        }
      </section>`
    )
    .join('')}`;
}

function render() {
  const views = {
    notes: notesView,
    examples: examplesView,
    practice: practiceView,
    exam: examView,
    wrong: wrongView
  };
  app.innerHTML = (views[state.view] || notesView)();
  renderTabbar();
}

function startPractice(questions) {
  state.session = {
    questions,
    index: 0,
    answers: {},
    checked: {},
    revealed: {},
    rubric: {},
    finished: false
  };
  state.view = 'practice';
  render();
}

function handleChoice(questionId, index, scope) {
  const holder = scopeStore(scope);
  holder.answers[questionId] = index;
  render();
}

function handleSubmit(questionId, scope) {
  const holder = scopeStore(scope);
  const question = (holder.paper ? holder.paper.questions : holder.questions).find((q) => q.id === questionId);
  if (!question) return;
  holder.checked[questionId] = true;
  const correct = answerMatches(holder.answers[questionId], question);
  store.recordAttempt(question.unitId, correct);
  if (!correct) store.addWrong(question);
  render();
}

function handleReveal(questionId, scope) {
  const holder = scopeStore(scope);
  holder.revealed[questionId] = !holder.revealed[questionId];
  render();
}

function handleRubric(questionId, index, scope, checked) {
  const holder = scopeStore(scope);
  const rubric = { ...(holder.rubric[questionId] || {}) };
  rubric[index] = checked;
  holder.rubric[questionId] = rubric;
  render();
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  if (action === 'nav') {
    state.view = target.dataset.id;
    if (state.view !== 'practice') state.session = state.session && state.session.finished ? state.session : state.session;
    render();
    return;
  }

  if (action === 'unit') {
    state.unitId = target.dataset.id;
    persistSettings();
    render();
    return;
  }

  if (action === 'scope') {
    state.practiceScope = target.dataset.id;
    render();
    return;
  }

  if (action === 'level') {
    state.level = Number(target.dataset.id);
    persistSettings();
    render();
    return;
  }

  if (action === 'mode') {
    state.mode = target.dataset.id;
    persistSettings();
    render();
    return;
  }

  if (action === 'toggle' || action === 'wrong-toggle') {
    const key = action === 'toggle' ? target.dataset.key : `wrong-${target.dataset.id}`;
    state.open[key] = !state.open[key];
    render();
    return;
  }

  if (action === 'start-practice') {
    const unitIds = state.practiceScope === 'all' ? null : [state.practiceScope];
    startPractice(generateSession({ unitIds, mode: state.mode, level: state.level, count: 10, seed: randomSeed() }));
    return;
  }

  if (action === 'practice-setup') {
    state.session = null;
    render();
    return;
  }

  if (action === 'choose') {
    handleChoice(target.dataset.qid, Number(target.dataset.index), target.dataset.scope || 'session');
    return;
  }

  if (action === 'submit') {
    handleSubmit(target.dataset.qid, target.dataset.scope || 'session');
    return;
  }

  if (action === 'reveal') {
    handleReveal(target.dataset.qid, target.dataset.scope || 'session');
    return;
  }

  if (action === 'rubric') {
    return;
  }

  if (action === 'prev' && state.session) {
    state.session.index = Math.max(0, state.session.index - 1);
    render();
    return;
  }

  if (action === 'next' && state.session) {
    state.session.index = Math.min(state.session.questions.length - 1, state.session.index + 1);
    render();
    return;
  }

  if (action === 'finish-practice' && state.session) {
    state.session.finished = true;
    render();
    return;
  }

  if (action === 'start-exam') {
    state.exam = {
      paper: target.dataset.type === 'past' ? getPastPaper() : generatePaper(randomSeed()),
      answers: {},
      checked: {},
      revealed: {},
      rubric: {},
      submitted: false
    };
    render();
    return;
  }

  if (action === 'submit-exam' && state.exam) {
    state.exam.submitted = true;
    render();
    return;
  }

  if (action === 'close-exam') {
    state.exam = null;
    render();
    return;
  }

  if (action === 'redo-wrong') {
    const questions = generateWrongBookSession(store.wrong(), state.level);
    if (questions.length) startPractice(questions);
    return;
  }

  if (action === 'wrong-remove') {
    store.removeWrong(target.dataset.id);
    render();
    return;
  }

  if (action === 'clear-wrong') {
    store.clearWrong();
    render();
    return;
  }

  if (action === 'reset-progress') {
    store.resetProgress();
    render();
    return;
  }
});

document.addEventListener('input', (event) => {
  const target = event.target.closest('[data-action="short-input"], [data-action="proof-input"]');
  if (!target) return;
  const holder = scopeStore(target.dataset.scope || 'session');
  holder.answers[target.dataset.qid] = target.value;
  const submit = document.querySelector(`[data-action="submit"][data-qid="${target.dataset.qid}"]`);
  if (submit) submit.disabled = target.value.trim() === '';
});

document.addEventListener('change', (event) => {
  const target = event.target.closest('[data-action="rubric"]');
  if (!target) return;
  handleRubric(target.dataset.qid, Number(target.dataset.index), target.dataset.scope || 'session', target.checked);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

render();
