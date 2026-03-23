import assert from 'node:assert/strict';
import test from 'node:test';

import { buildToolsPayload, parseToolsFilters } from '../../src/tools/toolsApi.ts';
import type { CoreToolPreview } from '../../src/tools/toolRegistry.ts';

test('parseToolsFilters accepts skillId and toolType', () => {
	const params = new URLSearchParams([['skillId', 'skill-alpha'], ['toolType', 'knowledge']]);
	assert.strictEqual(parseToolsFilters(params).skillId, 'skill-alpha');
});

test('parseToolsFilters rejects invalid toolType', () => {
	const params = new URLSearchParams([['toolType', 'unknown']]);
	assert.throws(() => parseToolsFilters(params));
});

test('buildToolsPayload returns list object', () => {
	const preview: CoreToolPreview = {
		id: 'skill:tool',
		skillId: 'skill',
		name: 'Tool',
		description: 'desc',
		toolType: 'knowledge',
		tags: [],
		enabled: true,
		updatedAt: '2026-01-01T00:00:00Z'
	};
	const payload = buildToolsPayload([preview]);
	assert.strictEqual(payload.object, 'list');
	assert.strictEqual(Array.isArray(payload.data), true);
	assert.strictEqual(payload.total, 1);
});
