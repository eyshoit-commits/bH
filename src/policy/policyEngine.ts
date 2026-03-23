export type PolicyDecision = 'allow' | 'block' | 'modify';

export interface PolicyResult {
	decision: PolicyDecision;
	reason: string;
	modifications?: Record<string, unknown>;
	timestamp: string;
}

export interface PolicyRule {
	id: string;
	name: string;
	evaluate: (context: PolicyContext) => PolicyResult | null;
}

export interface PolicyContext {
	route: string;
	method: string;
	model?: string;
	tools?: string[];
	skills?: string[];
	payload?: Record<string, unknown>;
}

const BLOCKED_TOOLS = ['eval', 'exec', 'spawn'];
const BLOCKED_ROUTES = ['/internal/debug', '/internal/admin/unsafe'];

const defaultRules: PolicyRule[] = [
	{
		id: 'block_unsafe_tools',
		name: 'Block unsafe tool execution',
		evaluate: (ctx) => {
			if (ctx.tools && ctx.tools.some(t => BLOCKED_TOOLS.includes(t))) {
				return {
					decision: 'block',
					reason: 'Unsafe tool detected in request',
					timestamp: new Date().toISOString()
				};
			}
			return null;
		}
	},
	{
		id: 'block_internal_routes',
		name: 'Block internal routes',
		evaluate: (ctx) => {
			if (BLOCKED_ROUTES.some(r => ctx.route.startsWith(r))) {
				return {
					decision: 'block',
					reason: 'Internal route access denied',
					timestamp: new Date().toISOString()
				};
			}
			return null;
		}
	},
	{
		id: 'require_model',
		name: 'Require model for chat requests',
		evaluate: (ctx) => {
			if (ctx.route.includes('/chat/completions') && !ctx.model) {
				return {
					decision: 'block',
					reason: 'Model required for chat completion requests',
					timestamp: new Date().toISOString()
				};
			}
			return null;
		}
	}
];

class PolicyEngine {
	private rules = [...defaultRules];
	private decisions: PolicyResult[] = [];

	evaluate(context: PolicyContext): PolicyResult {
		for (const rule of this.rules) {
			const result = rule.evaluate(context);
			if (result) {
				this.decisions.push(result);
				return result;
			}
		}

		const allowResult: PolicyResult = {
			decision: 'allow',
			reason: 'No policy rules matched',
			timestamp: new Date().toISOString()
		};
		this.decisions.push(allowResult);
		return allowResult;
	}

	addRule(rule: PolicyRule): void {
		this.rules.push(rule);
	}

	getRecentDecisions(limit = 100): PolicyResult[] {
		return this.decisions.slice(-limit).reverse();
	}

	clear(): void {
		this.decisions = [];
	}
}

const engine = new PolicyEngine();

export function getPolicyEngine(): PolicyEngine {
	return engine;
}
