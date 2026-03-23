export type ConfidenceLevel = 'high' | 'medium' | 'low';

interface ConfidenceInput {
	id?: string;
	context_length: number;
	tool_support: boolean;
}

export function calculateConfidence(input: ConfidenceInput): ConfidenceLevel {
	if (!input.id) {
		return 'low';
	}
	if (input.context_length > 0 && input.tool_support) {
		return 'high';
	}
	if (input.context_length > 0 || input.tool_support) {
		return 'medium';
	}
	return 'low';
}
