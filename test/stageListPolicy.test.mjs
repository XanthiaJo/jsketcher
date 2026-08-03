import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const policy = await import(new URL('../web/app/sketcher/stageListPolicy.js', import.meta.url).href);

describe('sketcher stage list policy', () => {
  it('appends a stage and makes it active', () => {
    const next = policy.addStage({ length: 1, pointer: 0 });
    assert.deepEqual(next, { length: 2, pointer: 1 });
  });

  it('keeps appending past the current pointer', () => {
    const next = policy.addStage({ length: 3, pointer: 0 });
    assert.deepEqual(next, { length: 4, pointer: 1 });
  });

  it('removes a stage after the active one and keeps the pointer', () => {
    const next = policy.removeStage({ length: 3, pointer: 0 }, 2);
    assert.deepEqual(next, { length: 2, pointer: 0 });
  });

  it('moves the pointer back when the active stage is removed', () => {
    const next = policy.removeStage({ length: 3, pointer: 2 }, 2);
    assert.deepEqual(next, { length: 2, pointer: 1 });
  });

  it('shifts the pointer down when an earlier stage is removed', () => {
    const next = policy.removeStage({ length: 3, pointer: 1 }, 0);
    assert.deepEqual(next, { length: 2, pointer: 0 });
  });

  it('removing the first active stage clamps the pointer to 0', () => {
    const next = policy.removeStage({ length: 2, pointer: 0 }, 0);
    assert.deepEqual(next, { length: 1, pointer: 0 });
  });

  it('refuses to remove the last remaining stage', () => {
    assert.equal(policy.removeStage({ length: 1, pointer: 0 }, 0), null);
  });

  it('refuses out-of-range indexes', () => {
    assert.equal(policy.removeStage({ length: 3, pointer: 0 }, 3), null);
    assert.equal(policy.removeStage({ length: 3, pointer: 0 }, -1), null);
  });
});
