const VALID_SOURCES = ['local', 'git', 'bundled', 'provider'];
export function parseSearchParams(search) {
    const params = {};
    const query = search.get('q');
    if (query && query.trim().length > 0) {
        params.query = query.trim();
    }
    const tags = collectCsv(search, 'tags');
    if (tags.length > 0) {
        params.tags = tags;
    }
    const categories = collectCsv(search, 'categories');
    if (categories.length > 0) {
        params.categories = categories;
    }
    const sourceValue = search.get('source');
    if (sourceValue) {
        const normalized = sourceValue.trim().toLowerCase();
        if (!VALID_SOURCES.includes(normalized)) {
            throw new Error(`Invalid source: ${sourceValue}`);
        }
        params.source = normalized;
    }
    const limit = parseIntegerParam(search.get('limit'), 'limit', true);
    if (limit !== undefined) {
        params.limit = limit;
    }
    const offset = parseIntegerParam(search.get('offset'), 'offset', false);
    if (offset !== undefined) {
        params.offset = offset;
    }
    const debugFlag = search.get('debug');
    if (debugFlag && parseBooleanFlag(debugFlag)) {
        params.includeDebug = true;
    }
    return params;
}
function collectCsv(search, key) {
    const values = search.getAll(key);
    const tokens = [];
    for (const value of values) {
        value
            .split(',')
            .map(entry => entry.trim())
            .filter(Boolean)
            .forEach(token => tokens.push(token));
    }
    return tokens.map(token => token.toLowerCase());
}
function parseIntegerParam(value, key, requirePositive) {
    if (!value) {
        return undefined;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
        throw new Error(`Invalid ${key}: ${value}`);
    }
    if (requirePositive ? parsed <= 0 : parsed < 0) {
        throw new Error(`Invalid ${key}: ${value}`);
    }
    return parsed;
}
function parseBooleanFlag(value) {
    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}
//# sourceMappingURL=parseSearchParams.js.map