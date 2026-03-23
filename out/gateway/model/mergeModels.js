export function mergeModels(autoModels, manualModels) {
    const mergedMap = new Map();
    for (const model of autoModels) {
        mergedMap.set(model.id, model);
    }
    for (const override of manualModels) {
        const existing = mergedMap.get(override.id);
        if (existing) {
            mergedMap.set(override.id, {
                ...existing,
                ...override,
                tool_support: override.tool_support ?? existing.tool_support,
                context_length: override.context_length ?? existing.context_length,
                capability_tags: mergeTags(existing.capability_tags, override.capability_tags),
                capabilities: mergeCapabilities(existing.capabilities, override.capabilities),
                confidence: 'high'
            });
        }
        else {
            mergedMap.set(override.id, { ...override, confidence: 'high' });
        }
    }
    const merged = Array.from(mergedMap.values());
    merged.sort((a, b) => a.id.localeCompare(b.id));
    return merged;
}
function mergeTags(a, b) {
    return Array.from(new Set([...(a || []), ...(b || [])]));
}
function mergeCapabilities(a, b) {
    return {
        chat_completion: Boolean(a?.chat_completion || b?.chat_completion),
        text_completion: Boolean(a?.text_completion || b?.text_completion),
        streaming: Boolean(a?.streaming || b?.streaming),
        token_counting: Boolean(a?.token_counting || b?.token_counting)
    };
}
//# sourceMappingURL=mergeModels.js.map