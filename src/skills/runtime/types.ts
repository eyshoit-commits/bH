export type InstructionStepType = 'prompt' | 'script' | 'tool';

export interface InstructionStep {
	id: string;
	type: InstructionStepType;
	template?: string;
	script?: string;
	toolId?: string;
	description?: string;
}

export interface SkillInstructions {
	skillId: string;
	model?: string;
	tools: string[];
	resources: string[];
	steps: InstructionStep[];
	updatedAt: string;
}

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
