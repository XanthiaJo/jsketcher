import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const policy = await import(new URL('../web/app/cad/projectLoadOriginPolicy.js', import.meta.url).href);

describe('JSketcher project load origin policy', () => {
  it('loads project history through a craft reset seeded with origin geometry', () => {
    const history = [{ type: 'DATUM_CREATE', params: { x: 10, y: 0, z: 0, rotations: [] } }];
    const originGeometry = [{ id: 'D:0' }, { id: 'S:0' }, { id: 'S:1' }, { id: 'S:2' }];
    const calls = [];
    const craftService = {
      reset(receivedHistory, seedModelsFactory) {
        calls.push({
          history: receivedHistory,
          seedModels: seedModelsFactory(),
        });
      },
    };

    policy.resetCraftHistoryWithOriginGeometry(craftService, history, () => originGeometry);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].history, history);
    assert.deepEqual(calls[0].seedModels.map(model => model.id), ['D:0', 'S:0', 'S:1', 'S:2']);
  });

  it('does not treat a history-created datum as the implicit origin', () => {
    const historyDatum = { id: 'D:0', originatingOperation: 0 };
    const implicitOrigin = { id: 'D:0', originatingOperation: -1 };

    assert.equal(policy.hasImplicitOriginGeometry([historyDatum]), false);
    assert.equal(policy.hasImplicitOriginGeometry([implicitOrigin]), true);
  });

  it('adds implicit origin geometry when it is missing after load', () => {
    const historyDatum = { id: 'D:0', originatingOperation: 0 };
    const originGeometry = [
      { id: 'D:0', originatingOperation: -1 },
      { id: 'S:0', originatingOperation: -1 },
      { id: 'S:1', originatingOperation: -1 },
      { id: 'S:2', originatingOperation: -1 },
    ];

    const models = policy.ensureImplicitOriginGeometry([historyDatum], () => originGeometry);

    assert.deepEqual(models.map(model => model.originatingOperation), [-1, -1, -1, -1, 0]);
  });

  it('does not add duplicate implicit origin geometry', () => {
    const originGeometry = [
      { id: 'D:0', originatingOperation: -1 },
      { id: 'S:0', originatingOperation: -1 },
      { id: 'S:1', originatingOperation: -1 },
      { id: 'S:2', originatingOperation: -1 },
    ];

    const models = policy.ensureImplicitOriginGeometry(originGeometry, () => {
      throw new Error('should not create another origin');
    });

    assert.equal(models, originGeometry);
  });
});
