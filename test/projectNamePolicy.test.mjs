import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

const policy = await import(new URL('../web/app/cad/projectNamePolicy.js', import.meta.url).href);

describe('JSketcher project name policy', () => {
  it('does not warn when the name is unique', () => {
    const name = policy.resolveProjectNameConflict(
      [{ uuid: 'other', name: 'Different' }],
      'current',
      'Bracket',
      () => {
        throw new Error('should not ask');
      }
    );

    assert.equal(name, 'Bracket');
  });

  it('does not warn for the current project name', () => {
    const name = policy.resolveProjectNameConflict(
      [{ uuid: 'current', name: 'Bracket' }],
      'current',
      'Bracket',
      () => {
        throw new Error('should not ask');
      }
    );

    assert.equal(name, 'Bracket');
  });

  it('warns and allows rename when another project has the same name', () => {
    const name = policy.resolveProjectNameConflict(
      [{ uuid: 'other', name: 'Bracket' }],
      'current',
      ' bracket ',
      duplicate => {
        assert.equal(duplicate.uuid, 'other');
        return 'Bracket v2';
      }
    );

    assert.equal(name, 'Bracket v2');
  });
});
