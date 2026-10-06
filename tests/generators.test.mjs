import test from 'node:test';
import assert from 'node:assert/strict';
import { units } from '../js/content/index.js';
import { makeRng } from '../js/rng.js';
import { generateSession } from '../js/practice.js';
import { generatePaper, getPastPaper, paperTotal } from '../js/exam.js';

function assertValidQuestion(question, familyId) {
  assert.ok(question.id, `${familyId}: missing id`);
  assert.ok(question.prompt && question.prompt.length > 5, `${familyId}: missing prompt`);
  assert.ok(['tf', 'mcq', 'short', 'proof'].includes(question.kind), `${familyId}: bad kind`);
  assert.ok(Array.isArray(question.solutionSteps) && question.solutionSteps.length > 0, `${familyId}: missing steps`);
  assert.ok(question.marks > 0, `${familyId}: missing marks`);

  if (question.kind === 'tf' || question.kind === 'mcq') {
    assert.ok(Array.isArray(question.choices) && question.choices.length >= 2, `${familyId}: missing choices`);
    assert.ok(Number.isInteger(question.answer), `${familyId}: answer must be an index`);
    assert.ok(question.answer >= 0 && question.answer < question.choices.length, `${familyId}: answer index out of range`);
  }

  if (question.kind === 'short') {
    assert.ok(question.answer !== undefined && question.answer !== null, `${familyId}: missing short answer`);
  }

  if (question.kind === 'proof') {
    assert.ok(Array.isArray(question.rubric) && question.rubric.length > 0, `${familyId}: missing rubric`);
    const total = question.rubric.reduce((sum, item) => sum + item.marks, 0);
    assert.equal(total, question.marks, `${familyId}: rubric marks must sum to question marks`);
  }
}

test('every long generator produces valid 200-sample output across levels', () => {
  for (const unit of units) {
    for (const family of unit.generators.long) {
      for (const level of [1, 2, 3]) {
        const rng = makeRng(`${unit.id}-${family.id}-${level}`);
        for (let i = 0; i < 200; i += 1) {
          const question = family.make(rng, level);
          assertValidQuestion(question, family.id);
        }
      }
    }
  }
});

test('every objective generator produces valid 200-sample output across levels', () => {
  for (const unit of units) {
    for (const family of unit.generators.objective) {
      for (const level of [1, 2, 3]) {
        const rng = makeRng(`${unit.id}-${family.id}-${level}`);
        for (let i = 0; i < 200; i += 1) {
          const question = family.make(rng, level);
          assertValidQuestion(question, family.id);
        }
      }
    }
  }
});

test('practice sessions respect the 70/30 long-question weighting', () => {
  const mixed = generateSession({ mode: 'mixed', level: 2, count: 10, seed: 'mixed' });
  assert.equal(mixed.length, 10);
  assert.ok(mixed.filter((q) => q.kind === 'proof').length >= 6);

  const long = generateSession({ mode: 'long', level: 2, count: 10, seed: 'long' });
  assert.equal(long.length, 10);
  assert.ok(long.every((q) => q.kind === 'proof'));

  const objective = generateSession({ mode: 'objective', level: 2, count: 10, seed: 'objective' });
  assert.equal(objective.length, 10);
  assert.ok(objective.every((q) => q.kind !== 'proof'));
});

test('generated paper matches the 2026-27 specification', () => {
  const paper = generatePaper('paper-seed');
  const tf = paper.questions.filter((q) => q.kind === 'tf');
  const long = paper.questions.filter((q) => q.kind === 'proof');
  assert.equal(tf.length, 10);
  assert.equal(long.length, 4);
  assert.ok(tf.every((q) => q.marks === 2));
  assert.ok(long.every((q) => q.marks === 20));
  assert.equal(paperTotal(paper), 100);
  for (const question of long) {
    const total = question.rubric.reduce((sum, item) => sum + item.marks, 0);
    assert.equal(total, 20);
  }
});

test('2024-25 past paper totals 50 marks across five questions', () => {
  const paper = getPastPaper();
  assert.equal(paper.questions.length, 5);
  assert.equal(paperTotal(paper), 50);
  assert.ok(paper.questions.every((q) => Array.isArray(q.rubric) && q.rubric.length > 0));
});
