const DEFAULT_REPOS_PATH = '.vscode/skills-repos';
export function getDefaultReposPath() {
    return DEFAULT_REPOS_PATH;
}
export function normalizeRepoConfig(raw) {
    if (!raw || typeof raw !== 'object') {
        throw new Error('Invalid repo config: must be an object');
    }
    const entry = raw;
    if (typeof entry.url !== 'string' || !entry.url.trim()) {
        throw new Error('Invalid repo config: url must be a non-empty string');
    }
    return {
        url: entry.url.trim(),
        branch: typeof entry.branch === 'string' ? entry.branch.trim() : 'main',
        path: typeof entry.path === 'string' ? entry.path.trim() : '',
        name: typeof entry.name === 'string' ? entry.name.trim() : extractRepoName(entry.url.trim()),
        enabled: entry.enabled !== false
    };
}
function extractRepoName(url) {
    const match = url.match(/\/([^/]+?)(?:\.git)?$/);
    return match ? match[1] : 'unknown';
}
//# sourceMappingURL=skillRepoConfig.js.map