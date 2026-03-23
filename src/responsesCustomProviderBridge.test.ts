import assert from 'node:assert/strict';
import test from 'node:test';

import {
	buildResponsesCustomProviderChatPayload,
	extractChatCompletionTextContent,
	mapChatCompletionToResponsesApiResponse,
} from './responsesCustomProviderBridge.js';

test('builds a chat-completions payload from Responses API input', () => {
	const payload = buildResponsesCustomProviderChatPayload(
		{
			model: 'custom/local-ollama-proxy/qwen2.5-coder-0.5b-instruct',
			instructions: 'Keep answers short.',
			input: [
				{ type: 'message', role: 'user', content: 'Hello' },
				{ type: 'message', role: 'assistant', content: 'Hi' },
				{ type: 'message', role: 'user', content: [{ type: 'input_text', text: 'Explain this.' }] }
			]
		},
		'qwen2.5-coder-0.5b-instruct'
	);

	assert.deepEqual(payload, {
		model: 'qwen2.5-coder-0.5b-instruct',
		messages: [
			{ role: 'system', content: 'Keep answers short.' },
			{ role: 'user', content: 'Hello' },
			{ role: 'assistant', content: 'Hi' },
			{ role: 'user', content: JSON.stringify([{ type: 'input_text', text: 'Explain this.' }]) }
		]
	});
});

test('injects the default system prompt when instructions are omitted', () => {
	const payload = buildResponsesCustomProviderChatPayload(
		{
			model: 'custom/local-ollama-proxy/qwen2.5-coder-0.5b-instruct',
			input: 'Hello'
		},
		'qwen2.5-coder-0.5b-instruct',
		'Use terse answers.'
	);

	assert.deepEqual(payload.messages, [
		{ role: 'system', content: 'Use terse answers.' },
		{ role: 'user', content: 'Hello' }
	]);
});

test('maps a custom-provider chat completion into a Responses API object', () => {
	const response = mapChatCompletionToResponsesApiResponse(
		{
			model: 'custom/local-ollama-proxy/qwen2.5-coder-0.5b-instruct',
			input: 'Hello',
			metadata: { source: 'test' }
		},
		'custom/local-ollama-proxy/qwen2.5-coder-0.5b-instruct',
		{
			choices: [
				{
					message: {
						content: 'Hi there'
					}
				}
			],
			usage: {
				prompt_tokens: 12,
				completion_tokens: 4,
				total_tokens: 16
			}
		},
		1_700_000_000
	);

	assert.equal(response.model, 'custom/local-ollama-proxy/qwen2.5-coder-0.5b-instruct');
	assert.equal(response.output[0]?.content[0]?.text, 'Hi there');
	assert.deepEqual(response.usage, {
		input_tokens: 12,
		input_tokens_details: { cached_tokens: 0 },
		output_tokens: 4,
		output_tokens_details: { reasoning_tokens: 0 },
		total_tokens: 16
	});
	assert.deepEqual(response.metadata, { source: 'test' });
	assert.equal(response.created_at, 1_700_000_000);
});

test('extracts text from structured chat-completion content arrays', () => {
	assert.equal(
		extractChatCompletionTextContent([
			{ type: 'output_text', text: 'Hello' },
			{ type: 'output_text', text: ' world' }
		]),
		'Hello world'
	);
});
