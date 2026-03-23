import assert from 'node:assert/strict';
import test from 'node:test';

import { ToolValidationError, validateToolDefinition } from '../../src/tools/validateToolInput';

test('validateToolDefinition rejects missing required fields', () => {
  assert.throws(() => {
    validateToolDefinition({});
  }, ToolValidationError);
});

test('validateToolDefinition accepts valid definitions', () => {
  const definition = validateToolDefinition({
    name: 'Echo',
    description: 'Echoes',
    toolType: 'script'
  });
  assert.equal(definition.name, 'Echo');
  assert.equal(definition.toolType, 'script');
});
