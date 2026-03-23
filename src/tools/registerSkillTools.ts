import * as fs from 'fs/promises';
import * as path from 'path';

import type { CoreSkill } from '../skills/types';
import type { CoreTool, ToolRegistry, ToolRejection } from './toolRegistry';
import { ToolRegistryError } from './toolRegistry';
import { validateToolDefinition, type ToolDefinition } from './validateToolInput';

export interface RegisterSkillToolsResult {
	registered: CoreTool[];
	rejections: ToolRejection[];
}

export async function registerSkillTools(skill: CoreSkill, registry: ToolRegistry): Promise<RegisterSkillToolsResult> {
	const skillDir = path.dirname(skill.path);
	const toolsPath = path.join(skillDir, 'tools.json');
	let content: string;
	try {
		content = await fs.readFile(toolsPath, 'utf-8');
	} catch (error) {
		if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
			return { registered: [], rejections: [] };
		}
		throw error;
	}

	let definitions: unknown;
	try {
		definitions = JSON.parse(content);
	} catch (error) {
		const rejection = createRejection(skill.id, 'Invalid JSON in tools.json');
		registry.recordRejection(rejection);
		return { registered: [], rejections: [rejection] };
	}

	if (!Array.isArray(definitions)) {
		const rejection = createRejection(skill.id, 'tools.json must be an array');
		registry.recordRejection(rejection);
		return { registered: [], rejections: [rejection] };
	}

	const registered: CoreTool[] = [];
	const rejections: ToolRejection[] = [];

	for (const entry of definitions) {
		let normalized: ToolDefinition | null = null;
		try {
			normalized = validateToolDefinition(entry);
			const tool = buildTool(skill, normalized);
			registry.register(tool);
			registered.push(tool);
		} catch (error) {
			const reason = error instanceof Error ? error.message : 'Unknown error';
			const rejection = createRejection(skill.id, reason, normalized?.id ?? definitionId(entry, skill.id));
			registry.recordRejection(rejection);
			rejections.push(rejection);
			if (error instanceof ToolRegistryError) {
				continue;
			}
		}
	}

	return { registered, rejections };
}

function buildTool(skill: CoreSkill, definition: ToolDefinition): CoreTool {
	const slug = definition.slug ? definition.slug : slugify(definition.name);
	const toolId = definition.id && definition.id.trim()
		? definition.id.trim()
		: `${skill.id}:${slug}`;

	return {
		id: toolId,
		skillId: skill.id,
		name: definition.name,
		description: definition.description,
		toolType: definition.toolType,
		inputSchema: definition.inputSchema,
		outputSchema: definition.outputSchema,
		dependencies: definition.dependencies ?? [],
		tags: definition.tags ?? [],
		enabled: definition.enabled !== false,
		updatedAt: new Date().toISOString()
	};
}

function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function createRejection(skillId: string, reason: string, toolId?: string): ToolRejection {
	return {
		toolId: toolId ?? `${skillId}:unknown`,
		skillId,
		reason,
		timestamp: new Date().toISOString()
	};
}

function definitionId(entry: unknown, skillId: string): string {
	if (entry && typeof entry === 'object') {
		const id = (entry as Record<string, unknown>).id;
		if (typeof id === 'string' && id.trim()) {
			return id.trim();
		}
	}
	return `${skillId}:unknown`;
}
