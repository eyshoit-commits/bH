import type { CoreModel, ProviderInfo } from '../models/types';
import type { CoreSkill } from '../skills/types';
import type { CoreTool } from '../tools/toolRegistry';
import type { SkillRejection } from '../skills/registry/skillRegistry';
import type { ToolRejection } from '../tools/toolRegistry';

export interface AdminSkillStatus {
	skills: CoreSkill[];
	tools: CoreTool[];
	rejections: SkillRejection[];
	lastRefresh: string | null;
	totalSkills: number;
	totalTools: number;
	totalRejections: number;
}

export interface AdminProviderStatus {
	providers: ProviderInfo[];
	activeModelId?: string;
	lastRefresh: string | null;
}

export interface AdminLogEntry {
	timestamp: string;
	level: 'info' | 'warn' | 'error';
	module: 'skills' | 'tools' | 'models' | 'admin';
	message: string;
	details?: Record<string, unknown>;
}

export interface AdminFullStatus {
	skills: AdminSkillStatus;
	providers: AdminProviderStatus;
	logs: AdminLogEntry[];
	timestamp: string;
}
