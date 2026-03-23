export type ToolType = 'knowledge' | 'script' | 'pipeline';

export interface CoreTool {
	id: string;
	skillId: string;
	name: string;
	description: string;
	toolType: ToolType;
	inputSchema?: Record<string, unknown>;
	outputSchema?: Record<string, unknown>;
	dependencies?: string[];
	tags: string[];
	enabled: boolean;
	updatedAt: string;
}

export interface CoreToolPreview {
	id: string;
	skillId: string;
	name: string;
	description: string;
	toolType: ToolType;
	tags: string[];
	enabled: boolean;
	updatedAt: string;
	inputSchema?: Record<string, unknown>;
}

export interface ToolRejection {
	toolId: string;
	skillId?: string;
	reason: string;
	timestamp: string;
}

export interface ToolRegistrySnapshot {
	tools: CoreToolPreview[];
	rejections: ToolRejection[];
	lastRefresh: string | null;
}

export class ToolRegistryError extends Error {
	readonly code: 'duplicate_tool' | 'validation_failed';

	constructor(code: 'duplicate_tool' | 'validation_failed', message: string) {
		super(message);
		this.name = 'ToolRegistryError';
		this.code = code;
	}
}

export class ToolRegistry {
	private readonly toolsById = new Map<string, CoreTool>();
	private readonly toolsBySkill = new Map<string, Set<string>>();
	private rejections: ToolRejection[] = [];
	private lastRefresh: string | null = null;

	register(tool: CoreTool): void {
		if (this.toolsById.has(tool.id)) {
			const rejection: ToolRejection = {
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

	list(filter?: { skillId?: string; toolType?: ToolType; enabled?: boolean }): CoreToolPreview[] {
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

	getBySkill(skillId: string): CoreTool[] {
		const ids = this.toolsBySkill.get(skillId);
		if (!ids) {
			return [];
		}
		return Array.from(ids)
			.map(id => this.toolsById.get(id))
			.filter((tool): tool is CoreTool => Boolean(tool))
			.sort((a, b) => a.name.localeCompare(b.name));
	}

	getSnapshot(): ToolRegistrySnapshot {
		return {
			tools: this.list(),
			rejections: [...this.rejections],
			lastRefresh: this.lastRefresh
		};
	}

	getRejections(): ToolRejection[] {
		return [...this.rejections];
	}

	private indexSkill(skillId: string, toolId: string): void {
		let set = this.toolsBySkill.get(skillId);
		if (!set) {
			set = new Set();
			this.toolsBySkill.set(skillId, set);
		}
		set.add(toolId);
	}

	private toPreview(tool: CoreTool): CoreToolPreview {
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
