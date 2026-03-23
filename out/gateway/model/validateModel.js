export function validateModel(model) {
    if (!model) {
        return false;
    }
    if (!model.id || typeof model.id !== 'string') {
        return false;
    }
    if (!model.provider || typeof model.provider !== 'string') {
        return false;
    }
    if (typeof model.context_length !== 'number' || Number.isNaN(model.context_length)) {
        model.context_length = 0;
        model.confidence = 'low';
    }
    return true;
}
//# sourceMappingURL=validateModel.js.map