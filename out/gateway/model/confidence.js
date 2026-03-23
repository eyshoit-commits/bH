export function calculateConfidence(input) {
    if (!input.id) {
        return 'low';
    }
    if (input.context_length > 0 && input.tool_support) {
        return 'high';
    }
    if (input.context_length > 0 || input.tool_support) {
        return 'medium';
    }
    return 'low';
}
//# sourceMappingURL=confidence.js.map