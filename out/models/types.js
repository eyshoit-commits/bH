export function isCoreModel(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const model = value;
    return typeof model.id === 'string'
        && typeof model.provider === 'string'
        && typeof model.name === 'string'
        && typeof model.family === 'string'
        && typeof model.version === 'string'
        && typeof model.maxInputTokens === 'number'
        && typeof model.contextLength === 'number'
        && typeof model.toolSupport === 'boolean'
        && typeof model.status === 'string'
        && typeof model.updatedAt === 'string';
}
//# sourceMappingURL=types.js.map