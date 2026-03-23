export function parseCustomProviderConfig(raw) {
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const entry = raw;
    const name = typeof entry.name === 'string' ? entry.name.trim() : '';
    const baseUrl = typeof entry.baseUrl === 'string' ? entry.baseUrl.trim().replace(/\/+$/, '') : '';
    const models = Array.isArray(entry.models)
        ? entry.models
            .filter((value) => typeof value === 'string' && value.trim().length > 0)
            .map(value => value.trim())
        : [];
    const autoDiscoverModels = entry.autoDiscoverModels !== false;
    if (!name || !baseUrl || (models.length === 0 && !autoDiscoverModels)) {
        return null;
    }
    const headers = {};
    if (entry.headers && typeof entry.headers === 'object' && !Array.isArray(entry.headers)) {
        for (const [key, value] of Object.entries(entry.headers)) {
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
//# sourceMappingURL=customProviderConfig.js.map