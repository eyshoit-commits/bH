import * as fs from 'fs/promises';
import * as path from 'path';

import type { CoreSkill } from '../types';

export type RuntimeStepType = 'knowledge' | 'script' | 'pipeline';

export interface SkillInstructionStep {
	id: string;
	name: string;
	type: RuntimeStepType;
	description?: string;
	promptTemplate?: string;
	script?: string;
	resources: string[];
}

export interface SkillInstructions {
	skillId: string;
	steps: SkillInstructionStep[];
	model?: string;
	version?: string;
	updatedAt: string;
}

export class SkillInstructionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'SkillInstructionError';
	}
}

const VALID_STEP_TYPES: RuntimeStepType[] = ['knowledge', 'script', 'pipeline'];

export async function loadSkillInstructions(skill: CoreSkill): Promise<SkillInstructions> {
	const skillDir = path.dirname(skill.path);
	const instructionsPath = path.join(skillDir, 'instructions.json');
	let content: string;
	try {
		content = await fs.readFile(instructionsPath, 'utf-8');
	} catch (error) {
		if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
			throw new SkillInstructionError(`instructions.json not found for skill ${skill.id}`);
		}
		throw error;
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(content);
	} catch (error) {
		throw new SkillInstructionError(`Failed to parse instructions.json for skill ${skill.id}: ${error instanceof Error ? error.message : 'invalid JSON'}`);
	}

	if (!parsed || typeof parsed !== 'object') {
		throw new SkillInstructionError(`Instructions file for skill ${skill.id} must be an object`);
	}

	const entry = parsed as Record<string, unknown>;
	const stepsRaw = entry.steps;
	if (!Array.isArray(stepsRaw) || stepsRaw.length === 0) {
		throw new SkillInstructionError(`Instructions for skill ${skill.id} must declare at least one step`);
	}

	const steps: SkillInstructionStep[] = stepsRaw.map((raw, index) => normalizeStep(raw, index));

	return {
		skillId: skill.id,
		steps,
		model: typeof entry.model === 'string' ? entry.model.trim() : undefined,
		version: typeof entry.version === 'string' ? entry.version.trim() : undefined,
		updatedAt: new Date().toISOString()
	};
}

function normalizeStep(entry: unknown, index: number): SkillInstructionStep {
	if (!entry || typeof entry !== 'object') {
		throw new SkillInstructionError(`Instruction step at index ${index} must be an object`);
	}
	const raw = entry as Record<string, unknown>;
	const id = typeof raw.id === 'string' && raw.id.trim()
		? raw.id.trim()
		: `step-${index}`;
	const name = typeof raw.name === 'string' && raw.name.trim()
		? raw.name.trim()
		: `Step ${index + 1}`;
	const typeRaw = typeof raw.type === 'string' ? raw.type.trim().toLowerCase() : '';
	if (!typeRaw || !VALID_STEP_TYPES.includes(typeRaw as RuntimeStepType)) {
		throw new SkillInstructionError(`Step ${id} has invalid type '${typeRaw}'`);
	}
	const resources: string[] = Array.isArray(raw.resources)
		? raw.resources
			.map(value => (typeof value === 'string' ? value.trim() : ''))
			.filter(Boolean)
		: [];

	return {
		id,
		name,
		type: typeRaw as RuntimeStepType,
		description: typeof raw.description === 'string' ? raw.description.trim() : undefined,
		promptTemplate: typeof raw.promptTemplate === 'string' ? raw.promptTemplate.trim() : undefined,
		script: typeof raw.script === 'string' ? raw.script.trim() : undefined,
		resources
	};
}
