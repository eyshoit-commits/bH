import type { CoreTool } from '../../tools/toolRegistry';
import type { ToolExecutionOptions, ToolExecutionResult, ExecutionLog } from './types';

export class ToolExecutionError extends Error {
	readonly toolId: string;
	readonly code: string;

	constructor(toolId: string, message: string, code?: string) {
		super(message);
		this.name = 'ToolExecutionError';
		this.toolId = toolId;
		this.code = code ?? 'EXECUTION_FAILED';
	}
}

export async function executeSkillTool(
	tool: CoreTool,
	options: ToolExecutionOptions
): Promise<ToolExecutionResult> {
	const start = Date.now();
	const logs: ExecutionLog[] = [{
		timestamp: new Date().toISOString(),
		event: 'invocation_started',
		detail: `tool=${tool.id} type=${tool.toolType}`
	}];

	let response: unknown;
	let error: string | undefined;

	try {
		switch (tool.toolType) {
			case 'knowledge':
				response = executeKnowledgeTool(tool, options);
				break;
			case 'script':
				throw new ToolExecutionError(
					tool.id,
					'Script execution is disabled for security reasons. Knowledge and pipeline tools only.',
					'SCRIPT_DISABLED'
				);
			case 'pipeline':
				response = executePipelineTool(tool, options);
				break;
			default:
				throw new ToolExecutionError(
					tool.id,
					`Unknown tool type: ${tool.toolType}`,
					'UNKNOWN_TYPE'
				);
		}

		logs.push({
			timestamp: new Date().toISOString(),
			event: 'invocation_completed',
			detail: 'success'
		});
	} catch (e) {
		error = e instanceof Error ? e.message : String(e);
		logs.push({
			timestamp: new Date().toISOString(),
			event: 'invocation_failed',
			detail: error
		});
		throw e;
	}

	return {
		object: 'tool_execution',
		toolId: tool.id,
		response,
		logs,
		tookMs: Date.now() - start
	};
}

function executeKnowledgeTool(tool: CoreTool, options: ToolExecutionOptions): unknown {
	return {
		toolId: tool.id,
		toolName: tool.name,
		toolType: 'knowledge',
		description: tool.description,
		input: options.input,
		result: {
			type: 'knowledge_response',
			message: `Knowledge tool ${tool.name} executed successfully`,
			capabilities: tool.tags || [],
			inputSchema: tool.inputSchema,
			outputSchema: tool.outputSchema
		},
		timestamp: new Date().toISOString()
	};
}

function executePipelineTool(tool: CoreTool, options: ToolExecutionOptions): unknown {
	return {
		toolId: tool.id,
		toolName: tool.name,
		toolType: 'pipeline',
		description: tool.description,
		input: options.input,
		result: {
			type: 'pipeline_response',
			message: `Pipeline tool ${tool.name} executed with basic orchestration`,
			stages: ['input_validation', 'execution', 'output_formatting'],
			output: options.input
		},
		timestamp: new Date().toISOString()
	};
}
