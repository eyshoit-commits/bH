import * as fs from 'fs/promises';
import * as path from 'path';

import type { CoreSkill } from '../types.ts';
import type { SkillInstructions } from './loadSkillInstructions.ts';

export interface ResolvedSkillResources {
	scriptPaths: Record<string, string>;
	resources: string[];
}

export class SkillResourceError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SkillResourceError';
	}
}

export async function resolveSkillResources(skill: CoreSkill, instructions: SkillInstructions): Promise<ResolvedSkillResources> {
	const skillDir = path.dirname(skill.path);
	const scriptPaths: Record<string, string> = {};
	const resources = new Set<string>();

	for (const step of instructions.steps) {
		if (step.script) {
			const scriptPath = path.join(skillDir, step.script);
			await ensureFileExists(scriptPath, `Script for step ${step.id} not found`);
			scriptPaths[step.id] = scriptPath;
		}
		for (const resource of step.resources ?? []) {
			const resourcePath = path.join(skillDir, resource);
			await ensureFileExists(resourcePath, `Resource ${resource} referenced by step ${step.id} not found`);
			resources.add(resourcePath);
		}
	}

	for (const resource of instructions.steps.flatMap(step => step.resources ?? [])) {
		const resourcePath = path.join(skillDir, resource);
		resources.add(resourcePath);
	}

	return {
		scriptPaths,
		resources: [...resources]
	};
}

async function ensureFileExists(filePath: string, message: string): Promise<void> {
	try {
		const stats = await fs.stat(filePath);
		if (!stats.isFile()) {
			throw new SkillResourceError(message);
		}
	} catch (error) {
		if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
			throw new SkillResourceError(message);
		}
		throw error;
	}
}
