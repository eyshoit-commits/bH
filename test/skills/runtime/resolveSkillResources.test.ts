import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import type { CoreSkill } from '../../../src/skills/types.ts';
import { resolveSkillResources, SkillResourceError } from '../../../src/skills/runtime/resolveSkillResources.ts';
import type { SkillInstructions } from '../../../src/skills/runtime/loadSkillInstructions.ts';

async function skillDir(): Promise<string> {
	return await fs.mkdtemp(path.join(os.tmpdir(), 'skill-'));
}

function coreSkill(dir: string): CoreSkill {
	return {
		id: 'beta',
		slug: 'beta',
		name: 'Beta Skill',
		version: '1.0.0',
		description: 'desc',
		tags: ['core'],
		categories: ['tools'],
		source: 'local',
		path: path.join(dir, 'SKILL.md'),
		enabled: true,
		updatedAt: '2026-01-01T00:00:00Z'
	};
}

const instructions: SkillInstructions = {
	skillId: 'beta',
	model: 'gpt-4',
	version: '1',
	updatedAt: new Date().toISOString(),
	steps: [
		{ id: 's1', name: 'Run script', type: 'script', script: 'scripts/run.js', resources: ['data/config.json'] }
	],
	tools: []
};

test('resolveSkillResources succeeds when files exist', async () => {
	const dir = await skillDir();
	const skill = coreSkill(dir);
	await fs.mkdir(path.join(dir, 'scripts'), { recursive: true });
	await fs.mkdir(path.join(dir, 'data'), { recursive: true });
	await fs.writeFile(path.join(dir, 'scripts', 'run.js'), '//');
	await fs.writeFile(path.join(dir, 'data', 'config.json'), '{}');

	const result = await resolveSkillResources(skill, instructions);
	assert.strictEqual(result.scriptPaths['s1'], path.join(dir, 'scripts', 'run.js'));
	assert.ok(result.resources.includes(path.join(dir, 'data', 'config.json')));
});

test('resolveSkillResources rejects missing script', async () => {
	const dir = await skillDir();
	const skill = coreSkill(dir);
	await fs.mkdir(path.join(dir, 'data'), { recursive: true });
	await fs.writeFile(path.join(dir, 'data', 'config.json'), '{}');

	await assert.rejects(() => resolveSkillResources(skill, instructions), SkillResourceError);
});
