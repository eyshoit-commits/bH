export class ToolValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ToolValidationError';
    }
}
const VALID_TOOL_TYPES = ['knowledge', 'script', 'pipeline'];
export function validateToolDefinition(raw) {
    if (!raw || typeof raw !== 'object') {
        throw new ToolValidationError('Tool entry must be an object');
    }
    const entry = raw;
    const name = getString(entry.name, 'name');
    const description = getString(entry.description, 'description');
    const toolTypeRaw = getString(entry.toolType, 'toolType');
    if (!VALID_TOOL_TYPES.includes(toolTypeRaw)) {
        throw new ToolValidationError(`Invalid toolType: ${toolTypeRaw}`);
    }
    const toolType = toolTypeRaw;
    const tags = normalizeStringArray(entry.tags);
    const dependencies = normalizeStringArray(entry.dependencies);
    const inputSchema = entry.inputSchema && typeof entry.inputSchema === 'object'
        ? entry.inputSchema
        : undefined;
    const outputSchema = entry.outputSchema && typeof entry.outputSchema === 'object'
        ? entry.outputSchema
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
function getString(value, field) {
    if (typeof value !== 'string' || !value.trim()) {
        throw new ToolValidationError(`Tool ${field} must be a non-empty string`);
    }
    return value.trim();
}
function normalizeStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map(entry => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(Boolean);
}
//# sourceMappingURL=validateToolInput.js.map