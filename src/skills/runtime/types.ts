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
