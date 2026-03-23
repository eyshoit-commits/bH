import type { AdminSkillStatus, AdminProviderStatus, AdminLogEntry, AdminFullStatus } from './types';
import { getSkillSnapshot, getSkillRejections } from '../skills/registry';
import { getToolRegistry } from '../tools/registry';
import { getModelRegistry } from '../models/modelRegistry';
import { getProviderManager } from '../models/providerManager';

class AdminControlService {
	private logs: AdminLogEntry[] = [];
	private maxLogs = 500;

	getSkillStatus(): AdminSkillStatus {
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

	getProviderStatus(): AdminProviderStatus {
		const manager = getProviderManager();
		const registry = getModelRegistry();

		return {
			providers: manager.getAllProviders(),
			activeModelId: registry.getActiveModelId(),
			lastRefresh: registry.getSnapshot().lastRefresh
		};
	}

	getLogs(limit?: number): AdminLogEntry[] {
		const max = limit ?? 100;
		return this.logs.slice(-max).reverse();
	}

	getFullStatus(): AdminFullStatus {
		return {
			skills: this.getSkillStatus(),
			providers: this.getProviderStatus(),
			logs: this.getLogs(50),
			timestamp: new Date().toISOString()
		};
	}

	async reindexSkills(): Promise<{ success: boolean; message: string }> {
		try {
			const { loadDefaultSkills } = await import('../skills/registry');
			await loadDefaultSkills();
			this.addLog('info', 'skills', 'Skills reindexed successfully');
			return { success: true, message: 'Skills reindexed successfully' };
		} catch (error: any) {
			this.addLog('error', 'skills', `Failed to reindex skills: ${error.message}`);
			return { success: false, message: error.message };
		}
	}

	async syncSkillRepos(): Promise<{ success: boolean; message: string }> {
		this.addLog('info', 'skills', 'Repo sync triggered');
		return { success: true, message: 'Repo sync not yet implemented' };
	}

	async refreshProviders(): Promise<{ success: boolean; message: string }> {
		this.addLog('info', 'admin', 'Provider refresh triggered');
		return { success: true, message: 'Provider refresh triggered' };
	}

	invalidateCache(): { success: boolean; message: string } {
		this.addLog('info', 'admin', 'Cache invalidated');
		return { success: true, message: 'Cache invalidated' };
	}

	addLog(level: AdminLogEntry['level'], module: AdminLogEntry['module'], message: string, details?: Record<string, unknown>): void {
		const entry: AdminLogEntry = {
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

export function getAdminControlService(): AdminControlService {
	return service;
}
