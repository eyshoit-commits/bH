import type { SkillRepoConfig, SkillRepoConfigSnapshot } from './skillRepoConfig';

class SkillRepoRegistry {
	private repos = new Map<string, SkillRepoConfig>();
	private lastSync: string | null = null;

	addRepo(config: SkillRepoConfig): void {
		this.repos.set(config.url, config);
	}

	removeRepo(url: string): boolean {
		return this.repos.delete(url);
	}

	getRepo(url: string): SkillRepoConfig | undefined {
		return this.repos.get(url);
	}

	getAllRepos(): SkillRepoConfig[] {
		return [...this.repos.values()].sort((a, b) => a.name.localeCompare(b.name));
	}

	getEnabledRepos(): SkillRepoConfig[] {
		return this.getAllRepos().filter(r => r.enabled);
	}

	getSnapshot(): SkillRepoConfigSnapshot {
		return {
			repos: this.getAllRepos(),
			lastSync: this.lastSync
		};
	}

	setLastSync(timestamp: string): void {
		this.lastSync = timestamp;
	}

	clear(): void {
		this.repos.clear();
		this.lastSync = null;
	}
}

const registry = new SkillRepoRegistry();

export function getSkillRepoRegistry(): SkillRepoRegistry {
	return registry;
}
