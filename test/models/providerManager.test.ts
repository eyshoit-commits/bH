import assert from 'node:assert/strict';
import test from 'node:test';

import { ProviderManager } from '../../src/models/providerManager.ts';

test('ProviderManager adds and retrieves providers', () => {
	const manager = new ProviderManager();

	manager.addProvider('test', 'vscode');

	const provider = manager.getProvider('test');
	assert.ok(provider);
	assert.equal(provider!.name, 'test');
	assert.equal(provider!.type, 'vscode');
	assert.equal(provider!.status, 'disconnected');
});

test('ProviderManager updates status', () => {
	const manager = new ProviderManager();
	manager.addProvider('test', 'vscode');

	manager.updateStatus('test', 'connected');
	const provider = manager.getProvider('test');
	assert.equal(provider!.status, 'connected');
});

test('ProviderManager updates model count', () => {
	const manager = new ProviderManager();
	manager.addProvider('test', 'vscode');

	manager.updateModelCount('test', 5);
	const provider = manager.getProvider('test');
	assert.equal(provider!.modelCount, 5);
});

test('ProviderManager gets connected providers', () => {
	const manager = new ProviderManager();
	manager.addProvider('a', 'vscode');
	manager.addProvider('b', 'custom');
	manager.updateStatus('a', 'connected');

	const connected = manager.getConnectedProviders();
	assert.equal(connected.length, 1);
	assert.equal(connected[0].name, 'a');
});

test('ProviderManager sorts providers by name', () => {
	const manager = new ProviderManager();
	manager.addProvider('z', 'vscode');
	manager.addProvider('a', 'custom');

	const providers = manager.getAllProviders();
	assert.equal(providers[0].name, 'a');
	assert.equal(providers[1].name, 'z');
});

test('ProviderManager removes providers', () => {
	const manager = new ProviderManager();
	manager.addProvider('test', 'vscode');

	assert.ok(manager.removeProvider('test'));
	assert.equal(manager.getProvider('test'), undefined);
	assert.ok(!manager.removeProvider('non-existent'));
});

test('ProviderManager clear removes all providers', () => {
	const manager = new ProviderManager();
	manager.addProvider('a', 'vscode');
	manager.addProvider('b', 'custom');

	manager.clear();

	assert.equal(manager.getAllProviders().length, 0);
});
