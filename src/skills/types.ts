export type CoreSkillSource = 'local' | 'git' | 'bundled' | 'provider';

export interface CoreSkill {
	id: string;
	slug: string;
	name: string;
	version: string;
	description: string;
	tags: string[];
	categories: string[];
	source: CoreSkillSource;
	path: string;
	repoUrl?: string;
	enabled: boolean;
	updatedAt: string;
	tools: string[];
	modelHints: string[];
	capabilityTags: string[];
}

export type CoreSkillManifest = CoreSkill;
export type SkillManifest = CoreSkill;

export function isCoreSkill(value: unknown): value is CoreSkill {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const skill = value as Record<string, unknown>;
	return typeof skill.id === 'string'
		&& typeof skill.slug === 'string'
		&& typeof skill.name === 'string'
		&& typeof skill.version === 'string'
		&& typeof skill.description === 'string'
		&& Array.isArray(skill.tags)
		&& Array.isArray(skill.categories)
		&& typeof skill.source === 'string'
		&& typeof skill.path === 'string'
		&& typeof skill.enabled === 'boolean'
		&& typeof skill.updatedAt === 'string'
		&& Array.isArray(skill.tools)
		&& Array.isArray(skill.modelHints)
		&& Array.isArray(skill.capabilityTags);
}

export function normalizeCoreSkill(raw: Partial<CoreSkill>): CoreSkill {
	const id = requireNonEmptyString(raw.id, 'id');
	return {
		id,
		slug: normalizeSlug(raw.slug, id),
		name: requireNonEmptyString(raw.name, 'name'),
		version: requireNonEmptyString(raw.version, 'version'),
		description: requireNonEmptyString(raw.description, 'description'),
		tags: normalizeStringList(raw.tags),
		categories: normalizeStringList(raw.categories),
		source: normalizeSource(raw.source),
		path: toStringValue(raw.path),
		repoUrl: toStringValue(raw.repoUrl),
		enabled: raw.enabled ?? true,
		updatedAt: normalizeUpdatedAt(raw.updatedAt),
		tools: normalizeStringList(raw.tools),
		modelHints: normalizeStringList(raw.modelHints),
		capabilityTags: normalizeStringList(raw.capabilityTags)
	};
}

function requireNonEmptyString(value: unknown, field: string): string {
	const normalized = toStringValue(value).trim();
	if (!normalized) {
		throw new Error(`Skill manifest is missing ${field}`);
	}
	return normalized;
}

function toStringValue(value: unknown): string {
	if (value === null || value === undefined) {
		return '';
	}
	return String(value);
}

function normalizeStringList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value
			.filter((entry): entry is string => typeof entry === 'string')
			.map(entry => entry.trim())
			.filter(Boolean);
	}
	if (!value) {
		return [];
	}
	const normalized = toStringValue(value);
	if (normalized.includes(',')) {
		return normalized
			.split(',')
			.map(part => part.trim())
			.filter(Boolean);
	}
	return [normalized.trim()].filter(Boolean);
}

function normalizeSource(value: unknown): CoreSkillSource {
	if (value === 'git' || value === 'bundled' || value === 'provider') {
		return value;
	}
	return 'local';
}

function normalizeSlug(value: unknown, fallback: string): string {
	const rawBase = typeof value === 'string' && value.trim() ? value : fallback;
	const base = toStringValue(rawBase);
	return base
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function normalizeUpdatedAt(value: unknown): string {
	const normalized = toStringValue(value).trim();
	return normalized || new Date().toISOString();
}
