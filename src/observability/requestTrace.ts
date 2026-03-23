export interface RequestTrace {
	id: string;
	route: string;
	method: string;
	model?: string;
	tools?: string[];
	skills?: string[];
	policyDecision?: string;
	teamTraceId?: string;
	timing: TraceTiming;
	status: 'pending' | 'in_progress' | 'completed' | 'failed';
	error?: string;
	createdAt: string;
	completedAt?: string;
}

export interface TraceTiming {
	startMs: number;
	endMs?: number;
	durationMs?: number;
	breakdown: Record<string, number>;
}

class TraceStore {
	private traces = new Map<string, RequestTrace>();

	create(route: string, method: string): RequestTrace {
		const id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		const trace: RequestTrace = {
			id,
			route,
			method,
			timing: {
				startMs: Date.now(),
				breakdown: {}
			},
			status: 'pending',
			createdAt: new Date().toISOString()
		};
		this.traces.set(id, trace);
		return trace;
	}

	update(id: string, updates: Partial<RequestTrace>): void {
		const trace = this.traces.get(id);
		if (trace) {
			Object.assign(trace, updates);
		}
	}

	complete(id: string, success: boolean, error?: string): void {
		const trace = this.traces.get(id);
		if (trace) {
			trace.status = success ? 'completed' : 'failed';
			trace.error = error;
			trace.timing.endMs = Date.now();
			trace.timing.durationMs = trace.timing.endMs - trace.timing.startMs;
			trace.completedAt = new Date().toISOString();
		}
	}

	getTrace(id: string): RequestTrace | undefined {
		return this.traces.get(id);
	}

	getAllTraces(): RequestTrace[] {
		return [...this.traces.values()]
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	}

	getRecentTraces(limit = 50): RequestTrace[] {
		return this.getAllTraces().slice(0, limit);
	}

	clear(): void {
		this.traces.clear();
	}
}

const store = new TraceStore();

export function getTraceStore(): TraceStore {
	return store;
}
