export interface SkillRepoConfig {
	url: string;
	branch: string;
	path: string;
	name: string;
	enabled: boolean;
}

export interface SkillRepoConfigSnapshot {
	repos: SkillRepoConfig[];
	lastSync: string | null;
}

const DEFAULT_REPOS_PATH = '.vscode/skills-repos';

export function getDefaultReposPath(): string {
	return DEFAULT_REPOS_PATH;
}

export function normalizeRepoConfig(raw: unknown): SkillRepoConfig {
	if (!raw || typeof raw !== 'object') {
		throw new Error('Invalid repo config: must be an object');
	}

	const entry = raw as Record<string, unknown>;

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

function extractRepoName(url: string): string {
	const match = url.match(/\/([^/]+?)(?:\.git)?$/);
	return match ? match[1] : 'unknown';
}
