import type { ConfidenceLevel } from '../gateway/model/confidence.js';

export interface ModelCapabilities {
	chat_completion: boolean;
	text_completion: boolean;
	streaming: boolean;
	token_counting: boolean;
}

export type ProviderType = 'vscode' | 'custom' | 'ollama' | 'nim';

export interface ProviderInfo {
	name: string;
	type: ProviderType;
	baseUrl?: string;
	status: 'connected' | 'disconnected' | 'error';
	modelCount: number;
	provider?: string;
	error?: string;
}

export interface CoreModel {
	id: string;
	provider: string;
	name: string;
	family: string;
	version: string;
	endpoint?: string;
	maxInputTokens: number;
	contextLength: number;
	toolSupport: boolean;
	confidence: ConfidenceLevel;
	capabilities: ModelCapabilities;
	capabilityTags: string[];
	status: 'available' | 'unavailable' | 'unknown';
	updatedAt: string;
}

export interface ModelRegistrySnapshot {
	models: CoreModel[];
	providers: ProviderInfo[];
	lastRefresh: string | null;
	activeModelId?: string;
}

export interface ModelRejectionEntry {
	modelId: string;
	reason: string;
	timestamp: string;
}

export function isCoreModel(value: unknown): value is CoreModel {
	if (!value || typeof value !== 'object') {
		return false;
	}
	const model = value as Record<string, unknown>;
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
