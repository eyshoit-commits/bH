import assert from 'node:assert/strict';
import test from 'node:test';

import { getToolRegistry, resetToolRegistry } from '../../../src/tools/registry.ts';
import type { CoreTool } from '../../../src/tools/toolRegistry.ts';
import { ToolExecutionError, invokeSkillTool } from '../../../src/skills/runtime/invokeSkillTool.ts';

const baseTool: CoreTool = {
	id: 'skill:knowledge',
	skillId: 'skill',
	name: 'Knowledge Tool',
	description: 'desc',
	toolType: 'knowledge',
	tags: [],
	enabled: true,
	updatedAt: '2026-01-01T00:00:00Z'
};

const scriptTool: CoreTool = {
	id: 'skill:script',
	skillId: 'skill',
	name: 'Script Tool',
	description: 'desc',
	toolType: 'script',
	tags: [],
	enabled: true,
	updatedAt: '2026-01-01T00:00:00Z',
	inputSchema: { script: 'scripts/run.js' }
};

test('invokeSkillTool returns response for knowledge tool', async () => {
	resetToolRegistry();
	const registry = getToolRegistry();
	registry.register(baseTool);

	const result = await invokeSkillTool(baseTool.id, { input: { foo: 'bar' } });
	assert.strictEqual(result.toolId, baseTool.id);
	assert.strictEqual((result.response as Record<string, unknown>).message, `Knowledge tool ${baseTool.name} ran`);
});

test('invokeSkillTool rejects unknown tool', async () => {
	resetToolRegistry();
	await assert.rejects(() => invokeSkillTool('missing', { input: {} }), ToolExecutionError);
});

test('invokeSkillTool returns script execution placeholder', async () => {
	resetToolRegistry();
	const registry = getToolRegistry();
	registry.register(scriptTool);

	const result = await invokeSkillTool(scriptTool.id, { input: { value: 1 } });
	assert.strictEqual(result.toolId, scriptTool.id);
	assert.strictEqual((result.response as Record<string, unknown>).message, `Script tool ${scriptTool.name} simulated`);
});
