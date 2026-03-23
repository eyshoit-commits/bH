export class ProviderManager {
    providers = new Map();
    addProvider(name, type, baseUrl) {
        this.providers.set(name, {
            name,
            type,
            baseUrl,
            status: 'disconnected',
            modelCount: 0
        });
    }
    updateStatus(name, status, error) {
        const provider = this.providers.get(name);
        if (provider) {
            provider.status = status;
            if (error) {
                provider.error = error;
            }
        }
    }
    updateModelCount(name, count) {
        const provider = this.providers.get(name);
        if (provider) {
            provider.modelCount = count;
        }
    }
    getProvider(name) {
        return this.providers.get(name);
    }
    getAllProviders() {
        return [...this.providers.values()].sort((a, b) => a.name.localeCompare(b.name));
    }
    getConnectedProviders() {
        return this.getAllProviders().filter(p => p.status === 'connected');
    }
    removeProvider(name) {
        return this.providers.delete(name);
    }
    clear() {
        this.providers.clear();
    }
}
const manager = new ProviderManager();
export function getProviderManager() {
    return manager;
}
//# sourceMappingURL=providerManager.js.map