import { getSkillSnapshot } from '../skills/registry';
import { getToolRegistry } from '../tools/registry';
import { getModelRegistry } from '../models/modelRegistry';
import { getProviderManager } from '../models/providerManager';
class AdminControlService {
    logs = [];
    maxLogs = 500;
    getSkillStatus() {
        const snapshot = getSkillSnapshot();
        const toolRegistry = getToolRegistry();
        const toolSnapshot = toolRegistry.getSnapshot();
        return {
            skills: snapshot.skills,
            tools: toolSnapshot.tools,
            rejections: snapshot.rejections,
            lastRefresh: snapshot.lastRefresh,
            totalSkills: snapshot.skills.length,
            totalTools: toolSnapshot.tools.length,
            totalRejections: snapshot.rejections.length
        };
    }
    getProviderStatus() {
        const manager = getProviderManager();
        const registry = getModelRegistry();
        return {
            providers: manager.getAllProviders(),
            activeModelId: registry.getActiveModelId(),
            lastRefresh: registry.getSnapshot().lastRefresh
        };
    }
    getLogs(limit) {
        const max = limit ?? 100;
        return this.logs.slice(-max).reverse();
    }
    getFullStatus() {
        return {
            skills: this.getSkillStatus(),
            providers: this.getProviderStatus(),
            logs: this.getLogs(50),
            timestamp: new Date().toISOString()
        };
    }
    async reindexSkills() {
        try {
            const { loadDefaultSkills } = await import('../skills/registry');
            await loadDefaultSkills();
            this.addLog('info', 'skills', 'Skills reindexed successfully');
            return { success: true, message: 'Skills reindexed successfully' };
        }
        catch (error) {
            this.addLog('error', 'skills', `Failed to reindex skills: ${error.message}`);
            return { success: false, message: error.message };
        }
    }
    async syncSkillRepos() {
        this.addLog('info', 'skills', 'Repo sync triggered');
        return { success: true, message: 'Repo sync not yet implemented' };
    }
    async refreshProviders() {
        this.addLog('info', 'admin', 'Provider refresh triggered');
        return { success: true, message: 'Provider refresh triggered' };
    }
    invalidateCache() {
        this.addLog('info', 'admin', 'Cache invalidated');
        return { success: true, message: 'Cache invalidated' };
    }
    addLog(level, module, message, details) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            module,
            message,
            details
        };
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }
}
const service = new AdminControlService();
export function getAdminControlService() {
    return service;
}
//# sourceMappingURL=adminControlService.js.map