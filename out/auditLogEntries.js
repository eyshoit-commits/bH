export function mergeRecentAuditEntries(flushedEntries, queuedEntries, page, pageSize) {
    const allEntries = [...queuedEntries, ...flushedEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const total = allEntries.length;
    const start = Math.max(0, (page - 1) * pageSize);
    const end = start + pageSize;
    return {
        total,
        entries: allEntries.slice(start, end)
    };
}
//# sourceMappingURL=auditLogEntries.js.map