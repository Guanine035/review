import { unit as sets } from './u1-sets.js';
import { unit as logic } from './u2-logic.js';
import { unit as directProof } from './u3-direct-proof.js';
import { unit as contrapositive } from './u4-contrapositive.js';
import { unit as contradiction } from './u5-contradiction.js';
import { unit as nonConditional } from './u6-non-conditional.js';
import { unit as setProofs } from './u7-set-proofs.js';
import { unit as disproof } from './u8-disproof.js';

export const units = [sets, logic, directProof, contrapositive, contradiction, nonConditional, setProofs, disproof].sort(
  (a, b) => a.order - b.order
);

export function getUnit(id) {
  return units.find((unit) => unit.id === id) || units[0];
}

export function allLongFamilies(unitIds = units.map((unit) => unit.id)) {
  return unitIds.flatMap((id) => getUnit(id).generators.long.map((family) => ({ unitId: id, family })));
}

export function allObjectiveFamilies(unitIds = units.map((unit) => unit.id)) {
  return unitIds.flatMap((id) => getUnit(id).generators.objective.map((family) => ({ unitId: id, family })));
}
