export class ToolRegistryError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.name = 'ToolRegistryError';
        this.code = code;
    }
}
export class ToolRegistry {
    toolsById = new Map();
    toolsBySkill = new Map();
    rejections = [];
    lastRefresh = null;
    register(tool) {
        if (this.toolsById.has(tool.id)) {
            const rejection = {
                toolId: tool.id,
                skillId: tool.skillId,
                reason: 'duplicate_tool_id',
                timestamp: new Date().toISOString()
            };
            this.rejections.push(rejection);
            throw new ToolRegistryError('duplicate_tool', `Tool id ${tool.id} already exists`);
        }
        this.toolsById.set(tool.id, tool);
        this.indexSkill(tool.skillId, tool.id);
        this.lastRefresh = new Date().toISOString();
    }
    list(filter) {
        let tools = Array.from(this.toolsById.values());
        if (filter?.skillId) {
            tools = tools.filter(tool => tool.skillId === filter.skillId);
        }
        if (filter?.toolType) {
            tools = tools.filter(tool => tool.toolType === filter.toolType);
        }
        if (filter?.enabled !== undefined) {
            tools = tools.filter(tool => tool.enabled === filter.enabled);
        }
        return tools
            .sort((a, b) => {
            if (a.skillId !== b.skillId) {
                return a.skillId.localeCompare(b.skillId);
            }
            return a.name.localeCompare(b.name);
        })
            .map(tool => this.toPreview(tool));
    }
    getBySkill(skillId) {
        const ids = this.toolsBySkill.get(skillId);
        if (!ids) {
            return [];
        }
        return Array.from(ids)
            .map(id => this.toolsById.get(id))
            .filter((tool) => Boolean(tool))
            .sort((a, b) => a.name.localeCompare(b.name));
    }
    getSnapshot() {
        return {
            tools: this.list(),
            rejections: [...this.rejections],
            lastRefresh: this.lastRefresh
        };
    }
    getRejections() {
        return [...this.rejections];
    }
    get(toolId) {
        return this.toolsById.get(toolId);
    }
    recordRejection(entry) {
        this.rejections.push(entry);
    }
    clear() {
        this.toolsById.clear();
        this.toolsBySkill.clear();
        this.rejections = [];
        this.lastRefresh = null;
    }
    indexSkill(skillId, toolId) {
        let set = this.toolsBySkill.get(skillId);
        if (!set) {
            set = new Set();
            this.toolsBySkill.set(skillId, set);
        }
        set.add(toolId);
    }
    toPreview(tool) {
        return {
            id: tool.id,
            skillId: tool.skillId,
            name: tool.name,
            description: tool.description,
            toolType: tool.toolType,
            tags: tool.tags,
            enabled: tool.enabled,
            updatedAt: tool.updatedAt,
            inputSchema: tool.inputSchema
        };
    }
}
//# sourceMappingURL=toolRegistry.js.map