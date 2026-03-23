const VALID_TOOL_TYPES = ['knowledge', 'script', 'pipeline'];
export function parseToolsFilters(search) {
    const filters = {};
    const skillId = search.get('skillId');
    if (skillId && skillId.trim()) {
        filters.skillId = skillId.trim();
    }
    const toolType = search.get('toolType');
    if (toolType) {
        const normalized = toolType.trim().toLowerCase();
        if (!VALID_TOOL_TYPES.includes(normalized)) {
            throw new Error(`Invalid toolType: ${toolType}`);
        }
        filters.toolType = normalized;
    }
    return filters;
}
export function buildToolsPayload(tools) {
    return {
        object: 'list',
        data: tools,
        total: tools.length
    };
}
export function parseToolExecutionBody(body) {
    if (!body || typeof body !== 'object') {
        throw new Error('Request body must be an object');
    }
    const entry = body;
    const toolId = typeof entry.tool_id === 'string' && entry.tool_id.trim()
        ? entry.tool_id.trim()
        : '';
    if (!toolId) {
        throw new Error('tool_id is required');
    }
    const input = entry.input && typeof entry.input === 'object'
        ? entry.input
        : {};
    const context = entry.context && typeof entry.context === 'object'
        ? entry.context
        : undefined;
    return { toolId, input, context };
}
//# sourceMappingURL=toolsApi.js.map