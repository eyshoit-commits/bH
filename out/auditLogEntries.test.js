import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeRecentAuditEntries } from './auditLogEntries.js';
test('includes queued audit entries before they are flushed to disk', () => {
    const result = mergeRecentAuditEntries([
        {
            timestamp: '2026-03-22T10:00:00.000Z',
            requestId: 'disk-1',
            method: 'GET',
            path: '/v1/models',
            status: 200,
            durationMs: 10
        }
    ], [
        {
            timestamp: '2026-03-22T10:00:02.000Z',
            requestId: 'queued-1',
            method: 'POST',
            path: '/v1/responses',
            status: 200,
            durationMs: 20
        }
    ], 1, 10);
    assert.equal(result.total, 2);
    assert.equal(result.entries[0]?.requestId, 'queued-1');
    assert.equal(result.entries[1]?.requestId, 'disk-1');
});
test('paginates after merging queued and flushed entries', () => {
    const result = mergeRecentAuditEntries([
        {
            timestamp: '2026-03-22T10:00:00.000Z',
            requestId: 'disk-1',
            method: 'GET',
            path: '/v1/models',
            status: 200,
            durationMs: 10
        }
    ], [
        {
            timestamp: '2026-03-22T10:00:03.000Z',
            requestId: 'queued-2',
            method: 'POST',
            path: '/v1/chat/completions',
            status: 200,
            durationMs: 15
        },
        {
            timestamp: '2026-03-22T10:00:02.000Z',
            requestId: 'queued-1',
            method: 'POST',
            path: '/v1/responses',
            status: 200,
            durationMs: 20
        }
    ], 2, 1);
    assert.equal(result.total, 3);
    assert.equal(result.entries.length, 1);
    assert.equal(result.entries[0]?.requestId, 'queued-1');
});
//# sourceMappingURL=auditLogEntries.test.js.map