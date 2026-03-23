export class ModelRegistry {
    models = new Map();
    providers = new Map();
    rejections = [];
    lastRefresh = null;
    activeModelId;
    replaceModels(newModels) {
        this.models.clear();
        for (const model of newModels) {
            this.models.set(model.id, model);
        }
        this.lastRefresh = new Date().toISOString();
    }
    setProvider(name, info) {
        this.providers.set(name, info);
    }
    getModels() {
        return [...this.models.values()].sort((a, b) => a.id.localeCompare(b.id));
    }
    getModel(modelId) {
        return this.models.get(modelId);
    }
    getProviders() {
        return [...this.providers.values()].sort((a, b) => a.name.localeCompare(b.name));
    }
    getActiveModelId() {
        return this.activeModelId;
    }
    setActiveModel(modelId) {
        if (this.models.has(modelId)) {
            this.activeModelId = modelId;
        }
    }
    getSnapshot() {
        return {
            models: this.getModels(),
            providers: this.getProviders(),
            lastRefresh: this.lastRefresh,
            activeModelId: this.activeModelId
        };
    }
    getRejections() {
        return [...this.rejections];
    }
    addRejection(entry) {
        this.rejections.push(entry);
    }
    clear() {
        this.models.clear();
        this.providers.clear();
        this.rejections = [];
        this.lastRefresh = null;
    }
}
const registry = new ModelRegistry();
export function getModelRegistry() {
    return registry;
}
//# sourceMappingURL=modelRegistry.js.map