class SkillRepoRegistry {
    repos = new Map();
    lastSync = null;
    addRepo(config) {
        this.repos.set(config.url, config);
    }
    removeRepo(url) {
        return this.repos.delete(url);
    }
    getRepo(url) {
        return this.repos.get(url);
    }
    getAllRepos() {
        return [...this.repos.values()].sort((a, b) => a.name.localeCompare(b.name));
    }
    getEnabledRepos() {
        return this.getAllRepos().filter(r => r.enabled);
    }
    getSnapshot() {
        return {
            repos: this.getAllRepos(),
            lastSync: this.lastSync
        };
    }
    setLastSync(timestamp) {
        this.lastSync = timestamp;
    }
    clear() {
        this.repos.clear();
        this.lastSync = null;
    }
}
const registry = new SkillRepoRegistry();
export function getSkillRepoRegistry() {
    return registry;
}
//# sourceMappingURL=skillRepoRegistry.js.map