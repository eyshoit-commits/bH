const EXACT_OPENAI_ROUTE_ALIASES = {
    '/chat/completions': '/v1/chat/completions',
    '/completions': '/v1/completions',
    '/count_tokens': '/v1/count_tokens',
    '/embeddings': '/v1/embeddings',
    '/mcp/servers': '/v1/mcp/servers',
    '/mcp/servers/refresh': '/v1/mcp/servers/refresh',
    '/models': '/v1/models',
    '/realtime': '/v1/realtime',
    '/responses': '/v1/responses',
    '/tokenize': '/v1/tokenize',
    '/tools': '/v1/tools',
    '/tools/call': '/v1/tools/call',
};
export function normalizeOpenAICompatiblePath(pathname) {
    if (!pathname || pathname === '/' || pathname === '/v1' || pathname.startsWith('/v1/')) {
        return pathname || '/';
    }
    // Special case for /global/event - should not be normalized
    if (pathname === '/global/event') {
        return pathname;
    }
    const exactAlias = EXACT_OPENAI_ROUTE_ALIASES[pathname];
    if (exactAlias) {
        return exactAlias;
    }
    if (pathname.startsWith('/models/')) {
        return `/v1${pathname}`;
    }
    if (pathname === '/audio' || pathname.startsWith('/audio/')) {
        return `/v1${pathname}`;
    }
    if (pathname === '/images' || pathname.startsWith('/images/')) {
        return `/v1${pathname}`;
    }
    return pathname;
}
//# sourceMappingURL=openAiRouteAliases.js.map