import type { CoreToolPreview, ToolType } from './toolRegistry';

export interface ToolsFilters {
	skillId?: string;
	toolType?: ToolType;
}

const VALID_TOOL_TYPES: ToolType[] = ['knowledge', 'script', 'pipeline'];

export function parseToolsFilters(search: URLSearchParams): ToolsFilters {
	const filters: ToolsFilters = {};

	const skillId = search.get('skillId');
	if (skillId && skillId.trim()) {
		filters.skillId = skillId.trim();
	}

	const toolType = search.get('toolType');
	if (toolType) {
		const normalized = toolType.trim().toLowerCase();
		if (!VALID_TOOL_TYPES.includes(normalized as ToolType)) {
			throw new Error(`Invalid toolType: ${toolType}`);
		}
		filters.toolType = normalized as ToolType;
	}

	return filters;
}

export function buildToolsPayload(tools: CoreToolPreview[]): Record<string, unknown> {
	return {
		object: 'list',
		data: tools,
		total: tools.length
	};
}

export interface ToolExecutionPayload {
	toolId: string;
	input: Record<string, unknown>;
	context?: Record<string, unknown>;
}

export function parseToolExecutionBody(body: unknown): ToolExecutionPayload {
	if (!body || typeof body !== 'object') {
		throw new Error('Request body must be an object');
	}
	const entry = body as Record<string, unknown>;
	const toolId = typeof entry.tool_id === 'string' && entry.tool_id.trim()
		? entry.tool_id.trim()
		: '';
	if (!toolId) {
		throw new Error('tool_id is required');
	}
	const input = entry.input && typeof entry.input === 'object'
		? entry.input as Record<string, unknown>
		: {};
	const context = entry.context && typeof entry.context === 'object'
		? entry.context as Record<string, unknown>
		: undefined;

	return { toolId, input, context };
}
