import assert from 'node:assert/strict';
import test from 'node:test';

import { getAdminControlService } from '../../src/admin/adminControlService.ts';

test('AdminControlService returns skill status', () => {
	const service = getAdminControlService();
	const status = service.getSkillStatus();

	assert.ok(status);
	assert.ok(Array.isArray(status.skills));
	assert.ok(Array.isArray(status.tools));
	assert.ok(Array.isArray(status.rejections));
	assert.equal(typeof status.totalSkills, 'number');
	assert.equal(typeof status.totalTools, 'number');
	assert.equal(typeof status.totalRejections, 'number');
});

test('AdminControlService returns provider status', () => {
	const service = getAdminControlService();
	const status = service.getProviderStatus();

	assert.ok(status);
	assert.ok(Array.isArray(status.providers));
});

test('AdminControlService returns full status', () => {
	const service = getAdminControlService();
	const status = service.getFullStatus();

	assert.ok(status);
	assert.ok(status.skills);
	assert.ok(status.providers);
	assert.ok(Array.isArray(status.logs));
	assert.ok(status.timestamp);
});

test('AdminControlService logs actions', () => {
	const service = getAdminControlService();
	service.addLog('info', 'skills', 'Test log entry');

	const logs = service.getLogs();
	assert.ok(logs.length > 0);
	assert.equal(logs[0].message, 'Test log entry');
	assert.equal(logs[0].level, 'info');
	assert.equal(logs[0].module, 'skills');
});

test('AdminControlService invalidates cache', () => {
	const service = getAdminControlService();
	const result = service.invalidateCache();

	assert.ok(result.success);
	assert.ok(result.message);
});

test('AdminControlService limits logs', () => {
	const service = getAdminControlService();
	for (let i = 0; i < 150; i++) {
		service.addLog('info', 'admin', `Log ${i}`);
	}

	const logs = service.getLogs();
	assert.ok(logs.length <= 100);
});
