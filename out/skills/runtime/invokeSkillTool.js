import { getToolRegistry } from '../../tools/registry';
export class ToolExecutionError extends Error {
    toolId;
    constructor(toolId, message) {
        super(message);
        this.name = 'ToolExecutionError';
        this.toolId = toolId;
    }
}
export async function invokeSkillTool(toolId, options) {
    const registry = getToolRegistry();
    const tool = registry.get(toolId);
    if (!tool) {
        throw new ToolExecutionError(toolId, `Tool ${toolId} not found`);
    }
    const start = Date.now();
    const logs = [{
            timestamp: new Date().toISOString(),
            event: 'invocation_started',
            detail: `type=${tool.toolType}`
        }];
    const response = await executeTool(tool, options.input, options.context);
    logs.push({
        timestamp: new Date().toISOString(),
        event: 'invocation_completed',
        detail: 'success'
    });
    return {
        object: 'tool_execution',
        toolId,
        response,
        logs,
        tookMs: Date.now() - start
    };
}
async function executeTool(tool, input, context) {
    switch (tool.toolType) {
        case 'knowledge':
            return {
                message: `Knowledge tool ${tool.name} ran`,
                input,
                context
            };
        case 'script':
            return {
                message: `Script tool ${tool.name} simulated`,
                details: {
                    input,
                    script: tool.inputSchema?.['script'] ?? 'inline'
                }
            };
        case 'pipeline':
            return {
                message: `Pipeline tool ${tool.name} executed`,
                stages: [input, context]
            };
        default:
            throw new ToolExecutionError(tool.id, `Unsupported tool type ${tool.toolType}`);
    }
}
//# sourceMappingURL=invokeSkillTool.js.map