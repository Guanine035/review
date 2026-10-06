import { makeRng, pick, shuffle } from './rng.js';
import { getUnit, units } from './content/index.js';

export const PRACTICE_MODES = [
  { id: 'mixed', label: '混合 70% 长题' },
  { id: 'long', label: '只练长题' },
  { id: 'objective', label: '只练客观题' }
];

function takeFamilies(rng, entries, count) {
  const shuffled = shuffle(rng, entries);
  const out = [];
  let i = 0;
  while (out.length < count && shuffled.length) {
    out.push(shuffled[i % shuffled.length]);
    i += 1;
    if (i > count * 4 + 20) break;
  }
  return out;
}

export function generateSession({ unitIds, mode = 'mixed', level = 2, count = 10, seed }) {
  const rng = makeRng(seed ?? Date.now());
  const selected = unitIds && unitIds.length ? unitIds : units.map((unit) => unit.id);
  const longEntries = selected.flatMap((id) =>
    getUnit(id).generators.long.map((family) => ({ unitId: id, family }))
  );
  const objectiveEntries = selected.flatMap((id) =>
    getUnit(id).generators.objective.map((family) => ({ unitId: id, family }))
  );

  const longCount = mode === 'long' ? count : mode === 'objective' ? 0 : Math.round(count * 0.7);
  const objectiveCount = count - longCount;
  const questions = [];

  for (const entry of takeFamilies(rng, longEntries, longCount)) {
    questions.push(entry.family.make(rng, level));
  }
  for (const entry of takeFamilies(rng, objectiveEntries, objectiveCount)) {
    questions.push(entry.family.make(rng, level));
  }
  return shuffle(rng, questions);
}

export function generateWrongBookSession(questions, level = 2) {
  return questions.map((item) => ({
    id: `wrong-${item.id}`,
    unitId: item.unitId,
    familyId: 'wrong-book',
    kind: item.kind,
    difficulty: level,
    prompt: item.prompt,
    choices: item.choices,
    answer: item.answer,
    accept: item.accept || [],
    solutionSteps: item.solutionSteps || [],
    rubric: item.rubric || null,
    marks: item.marks || 2
  }));
}

export function randomSeed() {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1e9).toString(36)}`;
}

export function pickUnit(rng) {
  return pick(rng, units).id;
}
