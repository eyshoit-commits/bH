import type { CoreModel, ModelRegistrySnapshot, ModelRejectionEntry, ProviderInfo } from './types';

export class ModelRegistry {
	private models = new Map<string, CoreModel>();
	private providers = new Map<string, ProviderInfo>();
	private rejections: ModelRejectionEntry[] = [];
	private lastRefresh: string | null = null;
	private activeModelId: string | undefined;

	replaceModels(newModels: CoreModel[]): void {
		this.models.clear();
		for (const model of newModels) {
			this.models.set(model.id, model);
		}
		this.lastRefresh = new Date().toISOString();
	}

	setProvider(name: string, info: ProviderInfo): void {
		this.providers.set(name, info);
	}

	getModels(): CoreModel[] {
		return [...this.models.values()].sort((a, b) => a.id.localeCompare(b.id));
	}

	getModel(modelId: string): CoreModel | undefined {
		return this.models.get(modelId);
	}

	getProviders(): ProviderInfo[] {
		return [...this.providers.values()].sort((a, b) => a.name.localeCompare(b.name));
	}

	getActiveModelId(): string | undefined {
		return this.activeModelId;
	}

	setActiveModel(modelId: string): void {
		if (this.models.has(modelId)) {
			this.activeModelId = modelId;
		}
	}

	getSnapshot(): ModelRegistrySnapshot {
		return {
			models: this.getModels(),
			providers: this.getProviders(),
			lastRefresh: this.lastRefresh,
			activeModelId: this.activeModelId
		};
	}

	getRejections(): ModelRejectionEntry[] {
		return [...this.rejections];
	}

	addRejection(entry: ModelRejectionEntry): void {
		this.rejections.push(entry);
	}

	clear(): void {
		this.models.clear();
		this.providers.clear();
		this.rejections = [];
		this.lastRefresh = null;
	}
}

const registry = new ModelRegistry();

export function getModelRegistry(): ModelRegistry {
	return registry;
}
