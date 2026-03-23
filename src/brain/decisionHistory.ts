export interface Decision {
	id: string;
	action: string;
	route: string;
	model: string;
	tools: string[];
	skills: string[];
	confidence: number;
	risk: string;
	reason: string;
	result: string;
	timestamp: string;
}

export interface DecisionSnapshot {
	decisions: Decision[];
	totalCount: number;
	lastDecisionAt: string | null;
}

class DecisionHistory {
	private decisions = new Map<string, Decision>();

	add(decision: Omit<Decision, 'id' | 'timestamp'>): Decision {
		const id = `dec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		const entry: Decision = {
			...decision,
			id,
			timestamp: new Date().toISOString()
		};
		this.decisions.set(id, entry);
		return entry;
	}

	get(id: string): Decision | undefined {
		return this.decisions.get(id);
	}

	getAll(): Decision[] {
		return [...this.decisions.values()]
			.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
	}

	getByRoute(route: string): Decision[] {
		return this.getAll().filter(d => d.route === route);
	}

	getByModel(model: string): Decision[] {
		return this.getAll().filter(d => d.model === model);
	}

	getSnapshot(): DecisionSnapshot {
		const decisions = this.getAll();
		return {
			decisions: decisions.slice(0, 100),
			totalCount: decisions.length,
			lastDecisionAt: decisions.length > 0 ? decisions[0].timestamp : null
		};
	}

	clear(): void {
		this.decisions.clear();
	}
}

const history = new DecisionHistory();

export function getDecisionHistory(): DecisionHistory {
	return history;
}
