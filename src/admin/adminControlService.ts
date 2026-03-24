import type { AdminSkillStatus, AdminProviderStatus, AdminLogEntry, AdminFullStatus } from './types';
import { getSkillSnapshot, getSkillRejections } from '../skills/registry';
import { getToolRegistry } from '../tools/registry';
import { getModelRegistry } from '../models/modelRegistry';
import { getProviderManager } from '../models/providerManager';
import { getModelResolver } from '../models/modelResolver';
import { getMemoryStore } from '../brain/memoryStore';
import { getDecisionHistory } from '../brain/decisionHistory';
import { getTeamOrchestrator } from '../orchestration/teamOrchestrator';
import { getPolicyEngine } from '../policy/policyEngine';
import { getTraceStore } from '../observability/requestTrace';
import { syncAllRepos } from '../skills/repos/syncSkillRepo';


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

	getModelStatus(): Record<string, unknown> {
		const registry = getModelRegistry();
		const resolver = getModelResolver();
		return {
			models: registry.getModels(),
			activeModelId: registry.getActiveModelId(),
			fallbackChain: resolver.getFallbackChain().map(m => m.id),
			resolverState: resolver.getState()
		};
	}

	getBrainStatus(): Record<string, unknown> {
		const memory = getMemoryStore();
		const decisions = getDecisionHistory();
		return {
			memory: memory.getSnapshot(),
			decisions: decisions.getSnapshot()
		};
	}

	getTeamStatus(): Record<string, unknown> {
		const orchestrator = getTeamOrchestrator();
		return {
			traces: orchestrator.getRecentTraces(20)
		};
	}

	getPolicyStatus(): Record<string, unknown> {
		const engine = getPolicyEngine();
		return {
			decisions: engine.getRecentDecisions(50)
		};
	}

	getObservabilityStatus(): Record<string, unknown> {
		const store = getTraceStore();
		return {
			traces: store.getRecentTraces(20)
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
		try {
	
			const results = await syncAllRepos();
			for (const result of results) {
				if (result.success) {
					this.addLog('info', 'skills', `Repo ${result.repo} synced: ${result.message}`);
				} else {
					this.addLog('error', 'skills', `Repo ${result.repo} sync failed: ${result.message}`);
				}
			}
			// Simple duplicate detection based on repo names (could be extended to skill ID checks)
			const names = results.map(r => r.repo);
			const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
			if (duplicates.length > 0) {
				this.addLog('warn', 'skills', `Duplicate repo names detected after sync: ${duplicates.join(', ')}`);
			}
			const summary = `Synced ${results.length} repos` + (duplicates.length ? `; duplicates: ${duplicates.join(', ')}` : '');
			return { success: true, message: summary };
		} catch (error: any) {
			this.addLog('error', 'skills', `Sync failed: ${error.message}`);
			return { success: false, message: error.message };
		}
	}



	async refreshProviders(): Promise<{ success: boolean; message: string }> {
		this.addLog('info', 'admin', 'Provider refresh triggered');
		return { success: true, message: 'Provider refresh triggered' };
	}

	invalidateCache(): { success: boolean; message: string } {
		this.addLog('info', 'admin', 'Cache invalidated');
		getModelRegistry().clear();
		getModelResolver();
		getMemoryStore().clear();
		getDecisionHistory().clear();
		getTeamOrchestrator().clear();
		getPolicyEngine().clear();
		getTraceStore().clear();
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
