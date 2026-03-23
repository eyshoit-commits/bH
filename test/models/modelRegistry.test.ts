import assert from 'node:assert/strict';
import test from 'node:test';

import { ModelRegistry } from '../../src/models/modelRegistry.ts';
import type { CoreModel } from '../../src/models/types.ts';

function createTestModel(overrides: Partial<CoreModel> = {}): CoreModel {
	return {
		id: 'test-model',
		provider: 'vscode',
		name: 'Test Model',
		family: 'test',
		version: '1.0.0',
		maxInputTokens: 4096,
		contextLength: 4096,
		toolSupport: true,
		confidence: 'high',
		capabilities: {
			chat_completion: true,
			text_completion: true,
			streaming: true,
			token_counting: true
		},
		capabilityTags: ['chat_completion', 'streaming'],
		status: 'available',
		updatedAt: new Date().toISOString(),
		...overrides
	};
}

test('ModelRegistry stores and retrieves models', () => {
	const registry = new ModelRegistry();
	const model = createTestModel();

	registry.replaceModels([model]);

	const models = registry.getModels();
	assert.equal(models.length, 1);
	assert.equal(models[0].id, 'test-model');
	assert.equal(models[0].provider, 'vscode');
});

test('ModelRegistry gets model by id', () => {
	const registry = new ModelRegistry();
	const model = createTestModel();

	registry.replaceModels([model]);

	const found = registry.getModel('test-model');
	assert.ok(found);
	assert.equal(found!.id, 'test-model');

	const notFound = registry.getModel('non-existent');
	assert.equal(notFound, undefined);
});

test('ModelRegistry sorts models deterministically', () => {
	const registry = new ModelRegistry();

	registry.replaceModels([
		createTestModel({ id: 'z-model' }),
		createTestModel({ id: 'a-model' })
	]);

	const models = registry.getModels();
	assert.equal(models[0].id, 'a-model');
	assert.equal(models[1].id, 'z-model');
});

test('ModelRegistry tracks active model', () => {
	const registry = new ModelRegistry();
	registry.replaceModels([createTestModel()]);

	assert.equal(registry.getActiveModelId(), undefined);

	registry.setActiveModel('test-model');
	assert.equal(registry.getActiveModelId(), 'test-model');

	registry.setActiveModel('non-existent');
	assert.equal(registry.getActiveModelId(), 'test-model');
});

test('ModelRegistry replaces models on update', () => {
	const registry = new ModelRegistry();
	registry.replaceModels([createTestModel({ id: 'old-model' })]);

	registry.replaceModels([createTestModel({ id: 'new-model' })]);

	const models = registry.getModels();
	assert.equal(models.length, 1);
	assert.equal(models[0].id, 'new-model');
});

test('ModelRegistry tracks providers', () => {
	const registry = new ModelRegistry();

	registry.setProvider('test-provider', {
		name: 'test-provider',
		type: 'custom',
		status: 'connected',
		modelCount: 5
	});

	const providers = registry.getProviders();
	assert.equal(providers.length, 1);
	assert.equal(providers[0].name, 'test-provider');
	assert.equal(providers[0].status, 'connected');
});

test('ModelRegistry snapshot includes all data', () => {
	const registry = new ModelRegistry();
	registry.replaceModels([createTestModel()]);
	registry.setProvider('test-provider', {
		name: 'test-provider',
		type: 'vscode',
		status: 'connected',
		modelCount: 1
	});
	registry.setActiveModel('test-model');

	const snapshot = registry.getSnapshot();
	assert.equal(snapshot.models.length, 1);
	assert.equal(snapshot.providers.length, 1);
	assert.equal(snapshot.activeModelId, 'test-model');
	assert.ok(snapshot.lastRefresh);
});

test('ModelRegistry records rejections', () => {
	const registry = new ModelRegistry();

	registry.addRejection({
		modelId: 'bad-model',
		reason: 'Missing id field',
		timestamp: new Date().toISOString()
	});

	const rejections = registry.getRejections();
	assert.equal(rejections.length, 1);
	assert.equal(rejections[0].modelId, 'bad-model');
});

test('ModelRegistry clear removes all data', () => {
	const registry = new ModelRegistry();
	registry.replaceModels([createTestModel()]);
	registry.setProvider('test', {
		name: 'test',
		type: 'vscode',
		status: 'connected',
		modelCount: 1
	});
	registry.addRejection({
		modelId: 'test',
		reason: 'test',
		timestamp: new Date().toISOString()
	});

	registry.clear();

	assert.equal(registry.getModels().length, 0);
	assert.equal(registry.getProviders().length, 0);
	assert.equal(registry.getRejections().length, 0);
	assert.equal(registry.getActiveModelId(), undefined);
});
