import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeOpenAICompatiblePath } from './openAiRouteAliases.js';

test('maps root codex responses route to the gateway responses handler', () => {
	assert.equal(normalizeOpenAICompatiblePath('/responses'), '/v1/responses');
});

test('maps root OpenAI catalog routes to the gateway /v1 equivalents', () => {
	assert.equal(normalizeOpenAICompatiblePath('/models'), '/v1/models');
	assert.equal(normalizeOpenAICompatiblePath('/models/gpt-5'), '/v1/models/gpt-5');
	assert.equal(normalizeOpenAICompatiblePath('/chat/completions'), '/v1/chat/completions');
});

test('maps other OpenAI-compatible root routes used by clients to /v1 aliases', () => {
	assert.equal(normalizeOpenAICompatiblePath('/realtime'), '/v1/realtime');
	assert.equal(normalizeOpenAICompatiblePath('/tools'), '/v1/tools');
	assert.equal(normalizeOpenAICompatiblePath('/tools/call'), '/v1/tools/call');
	assert.equal(normalizeOpenAICompatiblePath('/images/generations'), '/v1/images/generations');
	assert.equal(normalizeOpenAICompatiblePath('/audio/speech'), '/v1/audio/speech');
});

test('leaves already-versioned and non-OpenAI routes unchanged', () => {
	assert.equal(normalizeOpenAICompatiblePath('/v1/responses'), '/v1/responses');
	assert.equal(normalizeOpenAICompatiblePath('/health'), '/health');
	assert.equal(normalizeOpenAICompatiblePath('/llama/v1/chat/completions'), '/llama/v1/chat/completions');
});
