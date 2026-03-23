export function parseJsonBody(raw) {
    const normalized = raw.replace(/^\uFEFF/, '').trim();
    if (!normalized) {
        return {};
    }
    return JSON.parse(normalized);
}
//# sourceMappingURL=jsonBodyParser.js.map