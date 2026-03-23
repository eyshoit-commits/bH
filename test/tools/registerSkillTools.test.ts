import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promises as fs } from 'node:fs';

import { registerSkillTools } from '../../src/tools/registerSkillTools.ts';
import { ToolRegistry } from '../../src/tools/toolRegistry.ts';
import type { CoreSkill } from '../../src/skills/types.ts';

async function createSkillDir(): Promise<string> {
	const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'skill-'));
	await fs.mkdir(tmp, { recursive: true });
	return tmp;
}

function baseSkill(dir: string): CoreSkill {
	return {
		id: 'skill',
		slug: 'skill',
		name: 'A Skill',
		version: '1.0.0',
		description: 'desc',
		tags: ['core'],
		categories: ['tooling'],
		source: 'local',
		path: path.join(dir, 'SKILL.md'),
		enabled: true,
		updatedAt: '2026-01-01T00:00:00Z'
	};
}

test('registerSkillTools registers tools from tools.json', async () => {
	const dir = await createSkillDir();
	const skill = baseSkill(dir);
	const entry = [{
		name: 'Tool A',
		description: 'desc',
		toolType: 'knowledge'
	}];
	await fs.writeFile(path.join(dir, 'tools.json'), JSON.stringify(entry), 'utf-8');

	const registry = new ToolRegistry();
	const result = await registerSkillTools(skill, registry);

	assert.strictEqual(result.registered.length, 1);
	assert.strictEqual(registry.list().length, 1);
});

test('registerSkillTools reports rejection on invalid JSON', async () => {
	const dir = await createSkillDir();
	const skill = baseSkill(dir);
	await fs.writeFile(path.join(dir, 'tools.json'), '{ invalid }', 'utf-8');

	const registry = new ToolRegistry();
	const result = await registerSkillTools(skill, registry);

	assert.strictEqual(result.registered.length, 0);
	assert.strictEqual(result.rejections.length, 1);
});
