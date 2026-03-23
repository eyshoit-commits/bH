import assert from 'node:assert/strict';
import test from 'node:test';

import { ToolValidationError, validateToolDefinition } from '../../src/tools/validateToolInput.ts';

test('validateToolDefinition accepts valid entry', () => {
	const entry = validateToolDefinition({
		name: 'Test Tool',
		description: 'desc',
		toolType: 'knowledge',
		tags: ['alpha', 'beta'],
		dependencies: ['dep']
	});
	assert.strictEqual(entry.name, 'Test Tool');
	assert.strictEqual(entry.toolType, 'knowledge');
	assert.deepStrictEqual(entry.tags, ['alpha', 'beta']);
});

test('validateToolDefinition rejects missing name', () => {
	assert.throws(() => validateToolDefinition({ description: 'desc', toolType: 'knowledge' }), ToolValidationError);
});

test('validateToolDefinition rejects invalid toolType', () => {
	assert.throws(() => validateToolDefinition({ name: 'x', description: 'desc', toolType: 'unknown' }), ToolValidationError);
});
