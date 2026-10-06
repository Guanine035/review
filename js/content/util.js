import { randInt, pick, shuffle } from '../rng.js';

export const LEVELS = [
  { id: 1, label: '基础' },
  { id: 2, label: '标准' },
  { id: 3, label: '挑战' }
];

export function makeId(familyId, rng) {
  return `${familyId}-${Math.floor(rng() * 1e9).toString(36)}`;
}

export function latexSet(items) {
  return `\\{${items.join(',')}\\}`;
}

export function union(a, b) {
  return [...new Set([...a, ...b])];
}

export function intersection(a, b) {
  return a.filter((item) => b.includes(item));
}

export function difference(a, b) {
  return a.filter((item) => !b.includes(item));
}

export function cartesian(a, b) {
  const out = [];
  for (const x of a) for (const y of b) out.push([x, y]);
  return out;
}

export function pairsLatex(pairs) {
  return `\\{${pairs.map(([x, y]) => `(${x},${y})`).join(',')}\\}`;
}

export function powerSetInfo(items) {
  const out = [[]];
  for (const item of items) {
    const current = out.slice();
    for (const subset of current) out.push([...subset, item]);
  }
  out.sort((a, b) => a.length - b.length);
  return out;
}

export function powerSetLatex(items) {
  const subsets = powerSetInfo(items);
  return `\\{${subsets.map((s) => (s.length ? latexSet(s) : '\\varnothing')).join(',')}\\}`;
}

export function tfQ(unitId, familyId, rng, prompt, answer, solutionSteps, marks = 2, difficulty = 2) {
  return {
    id: makeId(familyId, rng),
    unitId,
    familyId,
    kind: 'tf',
    difficulty,
    prompt,
    choices: ['True', 'False'],
    answer: answer ? 0 : 1,
    accept: [],
    solutionSteps,
    rubric: null,
    marks
  };
}

export function mcqQ(unitId, familyId, rng, prompt, correct, distractors, solutionSteps, marks = 2, difficulty = 2) {
  const choices = shuffle(rng, [correct, ...distractors]);
  return {
    id: makeId(familyId, rng),
    unitId,
    familyId,
    kind: 'mcq',
    difficulty,
    prompt,
    choices,
    answer: choices.indexOf(correct),
    accept: [],
    solutionSteps,
    rubric: null,
    marks
  };
}

export function shortQ(unitId, familyId, rng, prompt, answer, accept, solutionSteps, marks = 2, difficulty = 2) {
  return {
    id: makeId(familyId, rng),
    unitId,
    familyId,
    kind: 'short',
    difficulty,
    prompt,
    choices: null,
    answer,
    accept: accept || [],
    solutionSteps,
    rubric: null,
    marks
  };
}

export function longQ(unitId, familyId, rng, prompt, solutionSteps, rubric, marks = 10, difficulty = 2) {
  return {
    id: makeId(familyId, rng),
    unitId,
    familyId,
    kind: 'proof',
    difficulty,
    prompt,
    choices: null,
    answer: null,
    accept: [],
    solutionSteps,
    rubric,
    marks
  };
}

export function scaleRubric(rubric, targetMarks) {
  const total = rubric.reduce((sum, item) => sum + item.marks, 0);
  if (!total) return rubric.map((item) => ({ ...item, marks: Math.round(targetMarks / rubric.length) }));
  const scaled = rubric.map((item) => ({
    ...item,
    marks: Math.max(1, Math.round((item.marks / total) * targetMarks))
  }));
  let diff = targetMarks - scaled.reduce((sum, item) => sum + item.marks, 0);
  let i = 0;
  while (diff !== 0 && scaled.length) {
    const index = i % scaled.length;
    if (diff > 0) {
      scaled[index].marks += 1;
      diff -= 1;
    } else if (scaled[index].marks > 1) {
      scaled[index].marks -= 1;
      diff += 1;
    }
    i += 1;
  }
  return scaled;
}

export function randomDistinct(rng, pool, count) {
  return shuffle(rng, pool).slice(0, count);
}

export function letterSet(rng, count) {
  return randomDistinct(rng, ['a', 'b', 'c', 'd', 'e', 'f', 'g'], count).sort();
}

export function numberSet(rng, count, min = 1, max = 9) {
  const out = new Set();
  while (out.size < count) out.add(randInt(rng, min, max));
  return [...out].sort((a, b) => a - b);
}

export function randomPair(rng, list) {
  return pick(rng, list);
}

export function intervalLevel(rng, level) {
  if (level === 1) return { min: 1, max: 3 };
  if (level === 3) return { min: 3, max: 9 };
  return { min: 2, max: 6 };
}
