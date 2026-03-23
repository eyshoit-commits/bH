import assert from 'node:assert/strict';
import test from 'node:test';

import { mergeModels } from './mergeModels.js';
import { normalizeModel } from './normalizeModel.js';
import { validateModel } from './validateModel.js';

test('normalizeModel preserves identifiers and context length', () => {
	const raw = { id: 'gpt-test', maxInputTokens: 2048, name: 'Test Model' };
	const normalized = normalizeModel(raw, 'vscode');
	assert.ok(normalized, 'Expected normalization to succeed');
	if (!normalized) {
		return;
	}
	assert.equal(normalized.id, 'vscode:gpt-test');
	assert.equal(normalized.provider, 'vscode');
	assert.equal(normalized.context_length, 2048);
	assert.deepEqual(normalized.capability_tags.sort(), ['chat_completion', 'streaming', 'text_completion', 'token_counting'].sort());
	assert.equal(normalized.max_input_tokens, 2048);
});

test('validateModel rejects entries without identifiers and downgrades context if missing', () => {
	const invalid = normalizeModel({ name: 'nameless' }, 'vscode');
	assert.equal(invalid, null);
});

test('mergeModels deduplicates and orders models', () => {
	const autoOne = normalizeModel({ id: 'a', maxInputTokens: 100 }, 'vscode');
	const autoTwo = normalizeModel({ id: 'z', maxInputTokens: 200 }, 'vscode');
	const manual = normalizeModel({ id: 'a', maxInputTokens: 300 }, 'custom');
	if (!autoOne || !autoTwo || !manual) {
		throw new Error('Normalization should succeed for test data');
	}
	const merged = mergeModels([autoOne, autoTwo], [manual]);
	assert.equal(merged.length, 2);
	assert.equal(merged[0].id, 'custom:a');
	assert.equal(merged[0].max_input_tokens, 300);
	assert.equal(merged[0].confidence, 'high');
	assert.equal(merged[1].id, 'vscode:z');
});
