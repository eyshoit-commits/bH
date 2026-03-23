import type { ToolType } from './toolRegistry.ts';

export interface ToolDefinition {
	id?: string;
	slug?: string;
	name: string;
	description: string;
	toolType: ToolType;
	inputSchema?: Record<string, unknown>;
	outputSchema?: Record<string, unknown>;
	dependencies?: string[];
	tags?: string[];
	enabled?: boolean;
}

export class ToolValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ToolValidationError';
	}
}

const VALID_TOOL_TYPES: ToolType[] = ['knowledge', 'script', 'pipeline'];

export function validateToolDefinition(raw: unknown): ToolDefinition {
	if (!raw || typeof raw !== 'object') {
		throw new ToolValidationError('Tool entry must be an object');
	}

	const entry = raw as Record<string, unknown>;

	const name = getString(entry.name, 'name');
	const description = getString(entry.description, 'description');
	const toolTypeRaw = getString(entry.toolType, 'toolType');
	if (!VALID_TOOL_TYPES.includes(toolTypeRaw as ToolType)) {
		throw new ToolValidationError(`Invalid toolType: ${toolTypeRaw}`);
	}

	const toolType = toolTypeRaw as ToolType;
	const tags = normalizeStringArray(entry.tags);
	const dependencies = normalizeStringArray(entry.dependencies);

	const inputSchema = entry.inputSchema && typeof entry.inputSchema === 'object'
		? entry.inputSchema as Record<string, unknown>
		: undefined;
	const outputSchema = entry.outputSchema && typeof entry.outputSchema === 'object'
		? entry.outputSchema as Record<string, unknown>
		: undefined;

	return {
		id: entry.id && typeof entry.id === 'string' ? entry.id.trim() : undefined,
		slug: entry.slug && typeof entry.slug === 'string' ? entry.slug.trim() : undefined,
		name,
		description,
		toolType,
		inputSchema,
		outputSchema,
		tags,
		dependencies,
		enabled: entry.enabled !== false
	};
}

function getString(value: unknown, field: string): string {
	if (typeof value !== 'string' || !value.trim()) {
		throw new ToolValidationError(`Tool ${field} must be a non-empty string`);
	}
	return value.trim();
}

function normalizeStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value
		.map(entry => (typeof entry === 'string' ? entry.trim() : ''))
		.filter(Boolean);
}
