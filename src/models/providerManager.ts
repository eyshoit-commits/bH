import type { ProviderInfo, ProviderType } from './types';

export class ProviderManager {
	private providers = new Map<string, ProviderInfo>();

	addProvider(name: string, type: ProviderType, baseUrl?: string): void {
		this.providers.set(name, {
			name,
			type,
			baseUrl,
			status: 'disconnected',
			modelCount: 0
		});
	}

	updateStatus(name: string, status: ProviderInfo['status'], error?: string): void {
		const provider = this.providers.get(name);
		if (provider) {
			provider.status = status;
			if (error) {
				provider.error = error;
			}
		}
	}

	updateModelCount(name: string, count: number): void {
		const provider = this.providers.get(name);
		if (provider) {
			provider.modelCount = count;
		}
	}

	getProvider(name: string): ProviderInfo | undefined {
		return this.providers.get(name);
	}

	getAllProviders(): ProviderInfo[] {
		return [...this.providers.values()].sort((a, b) => a.name.localeCompare(b.name));
	}

	getConnectedProviders(): ProviderInfo[] {
		return this.getAllProviders().filter(p => p.status === 'connected');
	}

	removeProvider(name: string): boolean {
		return this.providers.delete(name);
	}

	clear(): void {
		this.providers.clear();
	}
}

const manager = new ProviderManager();

export function getProviderManager(): ProviderManager {
	return manager;
}
