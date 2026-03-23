export function detectCapabilities(raw) {
    const tags = new Set();
    if (raw?.capabilities && typeof raw.capabilities === 'object') {
        for (const [key, value] of Object.entries(raw.capabilities)) {
            if (value) {
                tags.add(key);
            }
        }
    }
    if (raw?.tools || raw?.functions || raw?.tool_support) {
        tags.add('execution');
    }
    if (raw?.search || raw?.capabilities?.search || raw?.supports_search) {
        tags.add('search');
    }
    if (raw?.stream || raw?.capabilities?.streaming || raw?.supports_streaming) {
        tags.add('streaming');
    }
    if (raw?.stateful) {
        tags.add('stateful');
    }
    return Array.from(tags);
}
export function detectToolSupport(raw) {
    if (raw?.tool_support) {
        return true;
    }
    if (Array.isArray(raw?.tools) && raw.tools.length > 0) {
        return true;
    }
    if (Array.isArray(raw?.functions) && raw.functions.length > 0) {
        return true;
    }
    return false;
}
//# sourceMappingURL=capability.js.map