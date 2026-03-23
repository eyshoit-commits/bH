import type { TeamRole, TeamDecision, TeamTrace, TraceStep } from './teamTypes';

class TeamOrchestrator {
	private traces = new Map<string, TeamTrace>();

	createTrace(route: string, model: string, tools: string[] = [], skills: string[] = []): TeamTrace {
		const traceId = `trace_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		const trace: TeamTrace = {
			id: traceId,
			decision: {
				traceId,
				route,
				model,
				tools,
				skills,
				roles: {
					supervisor: 'system',
					worker: model,
					reviewer: 'policy'
				},
				reviewerNotes: '',
				confidence: 0.8,
				risk: 'low',
				timestamp: new Date().toISOString()
			},
			steps: [],
			status: 'pending',
			startedAt: new Date().toISOString()
		};
		this.traces.set(traceId, trace);
		return trace;
	}

	addStep(traceId: string, role: TeamRole, action: string, result: string): void {
		const trace = this.traces.get(traceId);
		if (!trace) {
			return;
		}

		const step: TraceStep = {
			role,
			action,
			result,
			timestamp: new Date().toISOString()
		};
		trace.steps.push(step);
		trace.status = 'in_progress';
	}

	completeTrace(traceId: string, success: boolean): void {
		const trace = this.traces.get(traceId);
		if (!trace) {
			return;
		}

		trace.status = success ? 'completed' : 'failed';
		trace.completedAt = new Date().toISOString();
	}

	getTrace(traceId: string): TeamTrace | undefined {
		return this.traces.get(traceId);
	}

	getAllTraces(): TeamTrace[] {
		return [...this.traces.values()]
			.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
	}

	getRecentTraces(limit = 50): TeamTrace[] {
		return this.getAllTraces().slice(0, limit);
	}

	clear(): void {
		this.traces.clear();
	}
}

const orchestrator = new TeamOrchestrator();

export function getTeamOrchestrator(): TeamOrchestrator {
	return orchestrator;
}
