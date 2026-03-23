import assert from 'node:assert/strict';
import test from 'node:test';

import { isCoreSkill, normalizeCoreSkill } from '../../src/skills/types.ts';

test('normalizeCoreSkill fills defaults for a partial manifest', () => {
	const normalized = normalizeCoreSkill({
		id: 'foo',
		name: 'Foo',
		version: '1.0.0',
		description: 'desc'
	});

	assert.equal(normalized.id, 'foo');
	assert.equal(normalized.slug, 'foo');
	assert.deepEqual(normalized.tags, []);
	assert.deepEqual(normalized.categories, []);
	assert.equal(normalized.source, 'local');
	assert.equal(normalized.enabled, true);
	assert.equal(typeof normalized.updatedAt, 'string');
	assert.deepEqual(normalized.tools, []);
	assert.deepEqual(normalized.modelHints, []);
	assert.deepEqual(normalized.capabilityTags, []);
	assert.equal(isCoreSkill(normalized), true);
});

test('isCoreSkill rejects objects that are missing required fields', () => {
	assert.equal(
		isCoreSkill({
			id: 'foo',
			name: 'Foo'
		}),
		false
	);
});
