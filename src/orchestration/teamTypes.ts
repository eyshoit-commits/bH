export type TeamRole = 'supervisor' | 'worker' | 'reviewer';

export interface TeamDecision {
	traceId: string;
	route: string;
	model: string;
	tools: string[];
	skills: string[];
	roles: Record<TeamRole, string>;
	reviewerNotes: string;
	confidence: number;
	risk: 'low' | 'medium' | 'high';
	timestamp: string;
}

export interface TeamTrace {
	id: string;
	decision: TeamDecision;
	steps: TraceStep[];
	status: 'pending' | 'in_progress' | 'completed' | 'failed';
	startedAt: string;
	completedAt?: string;
}

export interface TraceStep {
	role: TeamRole;
	action: string;
	result: string;
	timestamp: string;
}
