import { getAdminControlService } from './adminControlService';
export function registerAdminEndpoints(gateway, req, res, url) {
    const method = req.method;
    const path = url.pathname;
    // GET /v1/admin/status
    if (method === 'GET' && path === '/v1/admin/status') {
        const service = getAdminControlService();
        const status = service.getFullStatus();
        gateway.sendJson(res, 200, status);
        return true;
    }
    // GET /v1/admin/skills/status
    if (method === 'GET' && path === '/v1/admin/skills/status') {
        const service = getAdminControlService();
        const status = service.getSkillStatus();
        gateway.sendJson(res, 200, status);
        return true;
    }
    // GET /v1/admin/providers/status
    if (method === 'GET' && path === '/v1/admin/providers/status') {
        const service = getAdminControlService();
        const status = service.getProviderStatus();
        gateway.sendJson(res, 200, status);
        return true;
    }
    // GET /v1/admin/logs
    if (method === 'GET' && path === '/v1/admin/logs') {
        const service = getAdminControlService();
        const limit = parseInt(url.searchParams.get('limit') || '100', 10);
        const logs = service.getLogs(limit);
        gateway.sendJson(res, 200, { logs });
        return true;
    }
    // POST /v1/admin/skills/reindex
    if (method === 'POST' && path === '/v1/admin/skills/reindex') {
        const service = getAdminControlService();
        service.reindexSkills().then(result => {
            gateway.sendJson(res, result.success ? 200 : 500, result);
        }).catch(error => {
            gateway.sendJson(res, 500, { success: false, message: error.message });
        });
        return true;
    }
    // POST /v1/admin/cache/invalidate
    if (method === 'POST' && path === '/v1/admin/cache/invalidate') {
        const service = getAdminControlService();
        const result = service.invalidateCache();
        gateway.sendJson(res, 200, result);
        return true;
    }
    return false;
}
//# sourceMappingURL=adminEndpoints.js.map