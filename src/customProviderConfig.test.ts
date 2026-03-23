import assert from 'node:assert/strict';
import test from 'node:test';

import { parseCustomProviderConfig } from './customProviderConfig.js';

test('accepts auto-discovery-only custom providers without manual models', () => {
	const provider = parseCustomProviderConfig({
		name: 'Local Ollama',
		baseUrl: 'http://127.0.0.1:11434/v1',
		models: [],
		autoDiscoverModels: true
	});

	assert.deepEqual(provider, {
		name: 'Local Ollama',
		baseUrl: 'http://127.0.0.1:11434/v1',
		apiKey: '',
		models: [],
		headers: {},
		enabled: true,
		autoDiscoverModels: true
	});
});

test('rejects providers with no models when auto discovery is disabled', () => {
	assert.equal(
		parseCustomProviderConfig({
			name: 'Broken',
			baseUrl: 'http://127.0.0.1:11434/v1',
			models: [],
			autoDiscoverModels: false
		}),
		null
	);
});
