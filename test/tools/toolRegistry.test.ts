import assert from 'node:assert/strict';
import test from 'node:test';

import { ToolRegistry, ToolRegistryError } from '../../src/tools/toolRegistry.ts';
import type { CoreTool } from '../../src/tools/toolRegistry.ts';

const baseTool: CoreTool = {
	id: 'skill:hello',
	skillId: 'skill',
	name: 'Hello Tool',
	description: 'Say hello',
	toolType: 'knowledge',
	tags: ['greeting'],
	enabled: true,
	updatedAt: '2026-01-01T00:00:00.000Z'
};

test('ToolRegistry registers and lists tools', () => {
	const registry = new ToolRegistry();
	registry.register(baseTool);
	const list = registry.list();
	assert.strictEqual(list.length, 1);
	assert.strictEqual(list[0].id, baseTool.id);
	assert.strictEqual(registry.getBySkill('skill').length, 1);
});

test('ToolRegistry rejects duplicate tool ids', () => {
	const registry = new ToolRegistry();
	registry.register(baseTool);
	assert.throws(() => registry.register(baseTool), ToolRegistryError);
});
