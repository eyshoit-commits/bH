import { getToolRegistry, resetToolRegistry } from '../../tools/registry';
import type { CoreTool } from '../../tools/toolRegistry';

export interface ToolExecutionOptions {
	input: Record<string, unknown>;
	context?: Record<string, unknown>;
}

export interface ExecutionLog {
	timestamp: string;
	event: string;
	detail?: string;
}

export interface ToolExecutionResult {
	object: 'tool_execution';
	toolId: string;
	response: unknown;
	logs: ExecutionLog[];
	tookMs: number;
}

export class ToolExecutionError extends Error {
	readonly toolId: string;

	constructor(toolId: string, message: string) {
		super(message);
		this.name = 'ToolExecutionError';
		this.toolId = toolId;
	}
}

export async function invokeSkillTool(toolId: string, options: ToolExecutionOptions): Promise<ToolExecutionResult> {
	const registry = getToolRegistry();
	const tool = registry.get(toolId);
	if (!tool) {
		throw new ToolExecutionError(toolId, `Tool ${toolId} not found`);
	}

	const start = Date.now();
	const logs: ExecutionLog[] = [{
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

async function executeTool(tool: CoreTool, input: Record<string, unknown>, context?: Record<string, unknown>): Promise<unknown> {
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
