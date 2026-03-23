import type { McpTool } from '../McpService';
import type { CoreTool, ToolRegistry } from './toolRegistry';

export function importMcpTools(mcpTools: McpTool[], registry: ToolRegistry): CoreTool[] {
	const imported: CoreTool[] = [];

	for (const tool of mcpTools) {
		const id = `mcp_${tool.serverName}_${tool.name}`;
		const existing = registry.get(id);
		if (existing) {
			continue;
		}

		const coreTool: CoreTool = {
			id,
			skillId: `mcp:${tool.serverName}`,
			name: tool.name,
			description: tool.description || `Tool from MCP server ${tool.serverName}`,
			toolType: 'knowledge',
			inputSchema: tool.inputSchema,
			outputSchema: undefined,
			dependencies: [],
			tags: ['mcp', tool.serverName],
			enabled: true,
			updatedAt: new Date().toISOString()
		};

		try {
			registry.register(coreTool);
			imported.push(coreTool);
		} catch {
			const rejection = {
				toolId: id,
				skillId: `mcp:${tool.serverName}`,
				reason: `Duplicate MCP tool: ${tool.name}`,
				timestamp: new Date().toISOString()
			};
			registry.recordRejection(rejection);
		}
	}

	return imported;
}
