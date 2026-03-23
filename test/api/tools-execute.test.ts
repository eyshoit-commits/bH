import assert from 'node:assert/strict';
import test from 'node:test';

import { parseToolExecutionBody } from '../../src/tools/toolsApi.ts';

test('parseToolExecutionBody extracts required fields', () => {
	const payload = parseToolExecutionBody({
		tool_id: 'skill:tool',
		input: { foo: 'bar' },
		context: { env: 'dev' }
	});
	assert.strictEqual(payload.toolId, 'skill:tool');
	assert.deepStrictEqual(payload.input, { foo: 'bar' });
	assert.deepStrictEqual(payload.context, { env: 'dev' });
});

test('parseToolExecutionBody rejects missing tool_id', () => {
	assert.throws(() => parseToolExecutionBody({ input: {} }));
});
