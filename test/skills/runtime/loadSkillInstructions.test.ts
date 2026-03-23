import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { loadSkillInstructions, SkillInstructionError } from '../../../src/skills/runtime/loadSkillInstructions.ts';
import type { CoreSkill } from '../../../src/skills/types.ts';

async function createSkillDir(): Promise<string> {
	return await fs.mkdtemp(path.join(os.tmpdir(), 'skill-'));
}

function createSkill(dir: string): CoreSkill {
	return {
		id: 'alpha',
		slug: 'alpha',
		name: 'Alpha Skill',
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

test('loadSkillInstructions returns normalized data', async () => {
	const dir = await createSkillDir();
	const skill = createSkill(dir);
	await fs.writeFile(skill.path, '---\nid: alpha\n---', 'utf-8');
	const instructions = {
		model: 'gpt-4',
		steps: [
			{ id: 'step-1', name: 'Prompt', type: 'knowledge', promptTemplate: 'Hello' },
			{ id: 'step-2', name: 'Run script', type: 'script', script: 'scripts/run.js' }
		]
	};
	await fs.writeFile(path.join(dir, 'instructions.json'), JSON.stringify(instructions), 'utf-8');

	const loaded = await loadSkillInstructions(skill);
	assert.strictEqual(loaded.skillId, skill.id);
	assert.strictEqual(loaded.steps.length, 2);
	assert.strictEqual(loaded.model, 'gpt-4');
});

test('loadSkillInstructions throws when file missing', async () => {
	const dir = await createSkillDir();
	const skill = createSkill(dir);
	await assert.rejects(() => loadSkillInstructions(skill), SkillInstructionError);
});

test('loadSkillInstructions rejects invalid step types', async () => {
	const dir = await createSkillDir();
	const skill = createSkill(dir);
	await fs.writeFile(skill.path, '---\nid: alpha\n---', 'utf-8');
	await fs.writeFile(path.join(dir, 'instructions.json'), JSON.stringify({ steps: [{ id: 'x', type: 'unknown' }] }), 'utf-8');
	await assert.rejects(() => loadSkillInstructions(skill), SkillInstructionError);
});
