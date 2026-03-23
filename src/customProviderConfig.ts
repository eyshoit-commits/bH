export interface CustomProviderConfig {
	name: string
	baseUrl: string
	apiKey: string
	models: string[]
	headers: Record<string, string>
	enabled: boolean
	autoDiscoverModels?: boolean
}

export function parseCustomProviderConfig(raw: unknown): CustomProviderConfig | null {
	if (!raw || typeof raw !== 'object') {
		return null;
	}

	const entry = raw as Record<string, unknown>;
	const name = typeof entry.name === 'string' ? entry.name.trim() : '';
	const baseUrl = typeof entry.baseUrl === 'string' ? entry.baseUrl.trim().replace(/\/+$/, '') : '';
	const models = Array.isArray(entry.models)
		? entry.models
			.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
			.map(value => value.trim())
		: [];
	const autoDiscoverModels = entry.autoDiscoverModels !== false;

	if (!name || !baseUrl || (models.length === 0 && !autoDiscoverModels)) {
		return null;
	}

	const headers: Record<string, string> = {};
	if (entry.headers && typeof entry.headers === 'object' && !Array.isArray(entry.headers)) {
		for (const [key, value] of Object.entries(entry.headers as Record<string, unknown>)) {
			if (key.trim() && typeof value === 'string') {
				headers[key.trim()] = value;
			}
		}
	}

	return {
		name,
		baseUrl,
		apiKey: typeof entry.apiKey === 'string' ? entry.apiKey : '',
		models,
		headers,
		enabled: entry.enabled !== false,
		autoDiscoverModels
	};
}
