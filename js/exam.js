import { makeRng, shuffle } from './rng.js';
import { getUnit, units } from './content/index.js';
import { scaleRubric } from './content/util.js';
import { pastPaper2024 } from './content/u-past-paper.js';

export function scaleToMarks(question, marks) {
  return {
    ...question,
    marks,
    examMarks: marks,
    rubric: question.rubric ? scaleRubric(question.rubric, marks) : question.rubric
  };
}

export function generatePaper(seed) {
  const rng = makeRng(seed ?? Date.now());
  const tfQuestions = [];
  const usedUnits = new Set();

  const tfFamilies = shuffle(
    rng,
    units.flatMap((unit) => unit.generators.objective.map((family) => ({ unit, family })))
  );

  let guard = 0;
  while (tfQuestions.length < 10 && guard < 600) {
    guard += 1;
    const entry = tfFamilies[guard % tfFamilies.length];
    const question = entry.family.make(rng, 2);
    if (question.kind !== 'tf') continue;
    if (tfQuestions.length < 8 && usedUnits.has(entry.unit.id)) continue;
    usedUnits.add(entry.unit.id);
    tfQuestions.push({ ...question, marks: 2 });
  }

  const longFamilies = shuffle(
    rng,
    units.flatMap((unit) => unit.generators.long.map((family) => ({ unit, family })))
  );
  const longUnits = new Set();
  const longQuestions = [];
  for (const entry of longFamilies) {
    if (longQuestions.length === 4) break;
    if (longUnits.has(entry.unit.id) && longUnits.size < units.length) continue;
    longUnits.add(entry.unit.id);
    longQuestions.push(scaleToMarks(entry.family.make(rng, 2), 20));
  }

  return {
    id: `generated-${seed ?? 'seed'}`,
    title: '2026-27 规格生成卷（满分 100）',
    intro: 'Section A: 10 True or False questions (2 marks each). Section B: 4 conventional questions (20 marks each). Untimed practice paper.',
    questions: [
      ...tfQuestions.map((question, index) => ({ ...question, section: 'A', number: index + 1 })),
      ...longQuestions.map((question, index) => ({ ...question, section: 'B', number: index + 1 }))
    ]
  };
}

export function getPastPaper() {
  return {
    ...pastPaper2024,
    questions: pastPaper2024.questions.map((question, index) => ({ ...question, number: index + 1 }))
  };
}

export function paperTotal(paper) {
  return paper.questions.reduce((sum, question) => sum + (question.marks || 0), 0);
}

export function objectiveScore(paper, answers, checked) {
  let score = 0;
  for (const question of paper.questions) {
    if (question.kind === 'proof') continue;
    if (!checked[question.id]) continue;
    if (answers[question.id] === undefined) continue;
    if (Number(answers[question.id]) === question.answer || String(answers[question.id]) === String(question.answer)) {
      score += question.marks;
    }
  }
  return score;
}

export function selfScore(paper, rubricState) {
  let score = 0;
  for (const question of paper.questions) {
    if (question.kind !== 'proof') continue;
    const state = rubricState[question.id] || {};
    (question.rubric || []).forEach((item, index) => {
      if (state[index]) score += item.marks;
    });
  }
  return score;
}

export function unitOf(unitId) {
  return getUnit(unitId);
}
