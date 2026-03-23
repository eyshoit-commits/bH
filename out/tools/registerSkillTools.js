import * as fs from 'fs/promises';
import * as path from 'path';
import { ToolRegistryError } from './toolRegistry';
import { validateToolDefinition } from './validateToolInput';
export async function registerSkillTools(skill, registry) {
    const skillDir = path.dirname(skill.path);
    const toolsPath = path.join(skillDir, 'tools.json');
    let content;
    try {
        content = await fs.readFile(toolsPath, 'utf-8');
    }
    catch (error) {
        if (error?.code === 'ENOENT') {
            return { registered: [], rejections: [] };
        }
        throw error;
    }
    let definitions;
    try {
        definitions = JSON.parse(content);
    }
    catch (error) {
        const rejection = createRejection(skill.id, 'Invalid JSON in tools.json');
        registry.recordRejection(rejection);
        return { registered: [], rejections: [rejection] };
    }
    if (!Array.isArray(definitions)) {
        const rejection = createRejection(skill.id, 'tools.json must be an array');
        registry.recordRejection(rejection);
        return { registered: [], rejections: [rejection] };
    }
    const registered = [];
    const rejections = [];
    for (const entry of definitions) {
        let normalized = null;
        try {
            normalized = validateToolDefinition(entry);
            const tool = buildTool(skill, normalized);
            registry.register(tool);
            registered.push(tool);
        }
        catch (error) {
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
function buildTool(skill, definition) {
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
function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function createRejection(skillId, reason, toolId) {
    return {
        toolId: toolId ?? `${skillId}:unknown`,
        skillId,
        reason,
        timestamp: new Date().toISOString()
    };
}
function definitionId(entry, skillId) {
    if (entry && typeof entry === 'object') {
        const id = entry.id;
        if (typeof id === 'string' && id.trim()) {
            return id.trim();
        }
    }
    return `${skillId}:unknown`;
}
//# sourceMappingURL=registerSkillTools.js.map