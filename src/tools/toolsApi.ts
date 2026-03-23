import type { CoreToolPreview, ToolType } from './toolRegistry.ts';

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
