import { detectCapabilities, detectToolSupport } from './capability.js';
import type { ConfidenceLevel } from './confidence.js';
import { calculateConfidence } from './confidence.js';

export interface ModelCapabilities {
	chat_completion: boolean;
	text_completion: boolean;
	streaming: boolean;
	token_counting: boolean;
}

export interface NormalizedModel extends Record<string, unknown> {
	id: string;
	raw_id: string;
	provider: string;
	object: 'model';
	created: number;
	owned_by: string;
	name: string;
	family: string;
	version: string;
	endpoint?: string;
	max_input_tokens: number;
	context_length: number;
	tool_support: boolean;
	confidence: ConfidenceLevel;
	capabilities: ModelCapabilities;
	capability_tags: string[];
	raw: any;
}

export interface NormalizeModelOptions {
	created?: number;
	ownedBy?: string;
	name?: string;
	family?: string;
	version?: string;
	endpoint?: string;
}

export function normalizeModel(raw: any, provider: string, options: NormalizeModelOptions = {}): NormalizedModel | null {
	if (!raw?.id || typeof raw.id !== 'string') {
		return null;
	}
	const rawId = raw.id.trim();
	if (!rawId) {
		return null;
	}
	const now = options.created ?? Math.floor(Date.now() / 1000);
	const name = typeof raw?.name === 'string'
		? raw.name
		: options.name ?? rawId;
	const family = typeof raw?.family === 'string'
		? raw.family
		: options.family ?? name;
	const version = typeof raw?.version === 'string'
		? raw.version
		: options.version ?? '1.0.0';
	const ownedBy = typeof raw?.owned_by === 'string'
		? raw.owned_by
		: options.ownedBy ?? provider;
	const endpoint = typeof raw?.endpoint === 'string'
		? raw.endpoint
		: options.endpoint;
	const maxTokens = extractMaxTokens(raw);
	const contextLength = normalizeContext(raw, maxTokens);
	const toolSupport = detectToolSupport(raw);
	const capabilityTags = detectCapabilities(raw);
	const capabilities = buildCapabilityFlags(capabilityTags, toolSupport);
	const confidence = calculateConfidence({
		id: rawId,
		context_length: contextLength,
		tool_support: toolSupport
	});

	return {
		id: rawId,
		raw_id: rawId,
		provider,
		object: 'model',
		created: now,
		owned_by: ownedBy,
		name: name || rawId,
		family: family || name || rawId,
		version,
		endpoint,
		max_input_tokens: maxTokens,
		context_length: contextLength,
		tool_support: toolSupport,
		confidence,
		capabilities,
		capability_tags: capabilityTags,
		raw
	};
}

function normalizeContext(raw: any, fallback: number): number {
	if (typeof raw?.context_length === 'number' && !Number.isNaN(raw.context_length)) {
		return raw.context_length;
	}
	if (typeof raw?.max_context_tokens === 'number' && !Number.isNaN(raw.max_context_tokens)) {
		return raw.max_context_tokens;
	}
	if (typeof raw?.max_tokens === 'number' && !Number.isNaN(raw.max_tokens)) {
		return raw.max_tokens;
	}
	if (typeof raw?.maxInputTokens === 'number' && !Number.isNaN(raw.maxInputTokens)) {
		return raw.maxInputTokens;
	}
	return fallback;
}

function extractMaxTokens(raw: any): number {
	if (typeof raw?.max_input_tokens === 'number' && !Number.isNaN(raw.max_input_tokens)) {
		return raw.max_input_tokens;
	}
	if (typeof raw?.maxInputTokens === 'number' && !Number.isNaN(raw.maxInputTokens)) {
		return raw.maxInputTokens;
	}
	if (typeof raw?.context_length === 'number' && !Number.isNaN(raw.context_length)) {
		return raw.context_length;
	}
	return 0;
}

function buildCapabilityFlags(capabilityTags: string[], toolSupport: boolean): ModelCapabilities {
	const hasTag = (tag: string) => capabilityTags.includes(tag);
	return {
		chat_completion: hasTag('chat_completion') || hasTag('completion') || hasTag('chat'),
		text_completion: hasTag('text_completion') || hasTag('completion'),
		streaming: hasTag('streaming'),
		token_counting: hasTag('token_counting') || hasTag('text_completion') || toolSupport
	};
}
