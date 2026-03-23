import type { AuditEntry } from './services/AuditService.js';

export function mergeRecentAuditEntries(
	flushedEntries: AuditEntry[],
	queuedEntries: AuditEntry[],
	page: number,
	pageSize: number
): { total: number; entries: AuditEntry[] } {
	const allEntries = [...queuedEntries, ...flushedEntries].sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	);

	const total = allEntries.length;
	const start = Math.max(0, (page - 1) * pageSize);
	const end = start + pageSize;

	return {
		total,
		entries: allEntries.slice(start, end)
	};
}
