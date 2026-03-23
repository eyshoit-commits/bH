import type { CoreModel, ProviderInfo } from './types';
import { getModelRegistry } from './modelRegistry';
import { getProviderManager } from './providerManager';

export type ResolverStrategy = 'priority' | 'round-robin' | 'least-failures';

export interface ResolverConfig {
	strategy: ResolverStrategy;
	maxFailures: number;
	retryAfterMs: number;
}

export interface ResolverState {
	lastModelId: string | undefined;
	lastSuccessId: string | undefined;
	consecutiveFailures: Map<string, number>;
	lastFailureTime: Map<string, number>;
}

const DEFAULT_CONFIG: ResolverConfig = {
	strategy: 'priority',
	maxFailures: 3,
	retryAfterMs: 30000
};

export class ModelResolver {
	private config: ResolverConfig;
	private state: ResolverState;

	constructor(config: Partial<ResolverConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.state = {
			lastModelId: undefined,
			lastSuccessId: undefined,
			consecutiveFailures: new Map(),
			lastFailureTime: new Map()
		};
	}

	resolve(preferredModelId?: string): CoreModel | undefined {
		const registry = getModelRegistry();
		const models = registry.getModels().filter(m => m.status === 'available');

		if (models.length === 0) {
			return undefined;
		}

		if (preferredModelId) {
			const preferred = models.find(m => m.id === preferredModelId);
			if (preferred && this.isHealthy(preferred.id)) {
				this.state.lastModelId = preferred.id;
				return preferred;
			}
		}

		const healthyModels = models.filter(m => this.isHealthy(m.id));
		if (healthyModels.length === 0) {
			return models[0];
		}

		const resolved = this.selectByStrategy(healthyModels);
		this.state.lastModelId = resolved.id;
		return resolved;
	}

	markFailure(modelId: string): void {
		const failures = this.state.consecutiveFailures.get(modelId) ?? 0;
		this.state.consecutiveFailures.set(modelId, failures + 1);
		this.state.lastFailureTime.set(modelId, Date.now());
	}

	markSuccess(modelId: string): void {
		this.state.consecutiveFailures.set(modelId, 0);
		this.state.lastSuccessId = modelId;
		this.state.lastModelId = modelId;
	}

	isHealthy(modelId: string): boolean {
		const failures = this.state.consecutiveFailures.get(modelId) ?? 0;
		if (failures < this.config.maxFailures) {
			return true;
		}
		const lastFailure = this.state.lastFailureTime.get(modelId) ?? 0;
		return Date.now() - lastFailure > this.config.retryAfterMs;
	}

	getState(): ResolverState {
		return { ...this.state };
	}

	getFallbackChain(): CoreModel[] {
		const registry = getModelRegistry();
		const models = registry.getModels();
		return models
			.filter(m => m.status === 'available')
			.sort((a, b) => {
				if (this.isHealthy(a.id) && !this.isHealthy(b.id)) {
					return -1;
				}
				if (!this.isHealthy(a.id) && this.isHealthy(b.id)) {
					return 1;
				}
				return a.id.localeCompare(b.id);
			});
	}

	private selectByStrategy(models: CoreModel[]): CoreModel {
		if (this.config.strategy === 'round-robin') {
			const lastIdx = models.findIndex(m => m.id === this.state.lastModelId);
			const nextIdx = (lastIdx + 1) % models.length;
			return models[nextIdx];
		}

		if (this.config.strategy === 'least-failures') {
			return models.reduce((best, current) => {
				const bestFailures = this.state.consecutiveFailures.get(best.id) ?? 0;
				const currentFailures = this.state.consecutiveFailures.get(current.id) ?? 0;
				return currentFailures < bestFailures ? current : best;
			});
		}

		return models[0];
	}
}

const resolver = new ModelResolver();

export function getModelResolver(): ModelResolver {
	return resolver;
}
