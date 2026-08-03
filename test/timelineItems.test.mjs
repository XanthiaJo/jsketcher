import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const policy = await import(new URL('../web/app/cad/craft/timelineItems.js', import.meta.url).href);

describe('timeline items composition', () => {

  it('returns an empty list when there are no sketches and no history', () => {
    assert.deepEqual(policy.composeTimelineItems([], []), []);
  });

  it('returns an empty list when both inputs are null/undefined', () => {
    assert.deepEqual(policy.composeTimelineItems(null, undefined), []);
  });

  it('lists only sketches when there is no operation history', () => {
    const sketches = [{ id: 'S1' }, { id: 'S2' }];
    const items = policy.composeTimelineItems([], sketches);
    assert.deepEqual(items, [
      { type: 'sketch', sketch: { id: 'S1' } },
      { type: 'sketch', sketch: { id: 'S2' } },
    ]);
  });

  it('lists only operations when there are no sketches', () => {
    const history = [{ type: 'extrude' }, { type: 'cut' }];
    const items = policy.composeTimelineItems(history, []);
    assert.deepEqual(items, [
      { type: 'operation', index: 0, modification: { type: 'extrude' } },
      { type: 'operation', index: 1, modification: { type: 'cut' } },
    ]);
  });

  it('places sketches first, then a separator, then operations', () => {
    const sketches = [{ id: 'S1' }];
    const history = [{ type: 'extrude' }];
    const items = policy.composeTimelineItems(history, sketches);
    assert.deepEqual(items, [
      { type: 'sketch', sketch: { id: 'S1' } },
      { type: 'separator' },
      { type: 'operation', index: 0, modification: { type: 'extrude' } },
    ]);
  });

  it('preserves operation order and indexes with multiple sketches and operations', () => {
    const sketches = [{ id: 'S1' }, { id: 'S2' }];
    const history = [{ type: 'extrude' }, { type: 'cut' }, { type: 'revolve' }];
    const items = policy.composeTimelineItems(history, sketches);
    assert.equal(items.length, 6);
    assert.equal(items[0].type, 'sketch');
    assert.equal(items[1].type, 'sketch');
    assert.equal(items[2].type, 'separator');
    assert.equal(items[3].type, 'operation');
    assert.equal(items[3].index, 0);
    assert.equal(items[5].type, 'operation');
    assert.equal(items[5].index, 2);
  });
});

describe('timeline visibility helpers', () => {

  it('shouldShowSketchGroup is true only when sketches exist', () => {
    assert.equal(policy.shouldShowSketchGroup([]), false);
    assert.equal(policy.shouldShowSketchGroup(null), false);
    assert.equal(policy.shouldShowSketchGroup(undefined), false);
    assert.equal(policy.shouldShowSketchGroup([{ id: 'S1' }]), true);
  });

  it('shouldShowSeparator is true only when both sketches and history exist', () => {
    assert.equal(policy.shouldShowSeparator([], []), false);
    assert.equal(policy.shouldShowSeparator([{ id: 'S1' }], []), false);
    assert.equal(policy.shouldShowSeparator([], [{ type: 'extrude' }]), false);
    assert.equal(policy.shouldShowSeparator([{ id: 'S1' }], [{ type: 'extrude' }]), true);
  });
});
