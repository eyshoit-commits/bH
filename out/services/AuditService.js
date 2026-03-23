import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { mergeRecentAuditEntries } from '../auditLogEntries.js';
export class AuditService {
    storageDir;
    writeQueue = [];
    flushInterval;
    FLUSH_MS = 2000; // Flush every 2 seconds
    context;
    // Cached lifetime stats to avoid reading 365 files on startup
    cachedLifetimeStats = null;
    // Cached daily stats with TTL to avoid re-reading files on each sidebar render
    dailyStatsCache = null;
    DAILY_STATS_CACHE_TTL_MS = 30000; // 30 seconds
    constructor(context) {
        this.context = context;
        // Store logs in globalStorage/audit_logs
        this.storageDir = path.join(context.globalStorageUri.fsPath, 'audit_logs');
        // Initialize asynchronously to not block startup
        this.initAsync();
    }
    async initAsync() {
        await this.ensureStorageDir();
        this.startPeriodicFlush();
        // Run cleanup in background
        this.cleanupOldLogs().catch(err => console.error('Failed to cleanup old logs:', err));
    }
    async cleanupOldLogs() {
        const config = vscode.workspace.getConfiguration('githubCopilotApi.audit');
        const retentionDays = config.get('retentionDays', 30);
        if (retentionDays <= 0) {
            return; // Retention disabled
        }
        try {
            const files = await fs.promises.readdir(this.storageDir);
            const now = Date.now();
            const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;
            for (const file of files) {
                if (!file.startsWith('audit-') || !file.endsWith('.jsonl')) {
                    continue;
                }
                // Parse date from filename: audit-YYYY-MM-DD.jsonl
                const datePart = file.slice(6, -6); // Remove 'audit-' and '.jsonl'
                const fileDate = new Date(datePart).getTime();
                if (isNaN(fileDate)) {
                    continue;
                }
                if (now - fileDate > maxAgeMs) {
                    const filePath = path.join(this.storageDir, file);
                    await fs.promises.unlink(filePath);
                }
            }
        }
        catch (error) {
            console.error('Error cleaning up old audit logs:', error);
        }
    }
    async ensureStorageDir() {
        try {
            await fs.promises.mkdir(this.storageDir, { recursive: true });
        }
        catch (err) {
            // Ignore EEXIST - directory already exists
            if (err.code !== 'EEXIST') {
                console.error('Failed to create audit storage dir:', err);
            }
        }
    }
    async logRequest(entry) {
        this.writeQueue.push(entry);
        // Update cached stats incrementally
        if (this.cachedLifetimeStats) {
            this.cachedLifetimeStats.totalRequests++;
            this.cachedLifetimeStats.totalTokensIn += entry.tokensIn || 0;
            this.cachedLifetimeStats.totalTokensOut += entry.tokensOut || 0;
            // Persist to globalState periodically (every 10 requests)
            if (this.cachedLifetimeStats.totalRequests % 10 === 0) {
                void this.context.globalState.update('lifetimeStats', this.cachedLifetimeStats);
            }
        }
    }
    startPeriodicFlush() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        this.flushInterval = setInterval(() => this.flush(), this.FLUSH_MS);
    }
    async flush() {
        if (this.writeQueue.length === 0) {
            return;
        }
        const entries = [...this.writeQueue];
        this.writeQueue = [];
        // Group by date to write to correct files
        const entriesByDate = new Map();
        for (const entry of entries) {
            // ISO string is YYYY-MM-DDTHH:mm:ss.sssZ, split at T gives YYYY-MM-DD
            const dateStr = entry.timestamp.split('T')[0];
            if (!entriesByDate.has(dateStr)) {
                entriesByDate.set(dateStr, []);
            }
            entriesByDate.get(dateStr).push(entry);
        }
        for (const [date, daysEntries] of entriesByDate) {
            const filePath = path.join(this.storageDir, `audit-${date}.jsonl`);
            const content = daysEntries.map(e => JSON.stringify(e)).join('\n') + '\n';
            try {
                await fs.promises.appendFile(filePath, content, 'utf8');
            }
            catch (err) {
                console.error(`Failed to write audit logs for ${date}:`, err);
                // Re-queue failed entries? Or just log error to avoid infinite loop
            }
        }
    }
    async getDailyStats(lastDays = 30) {
        // Check cache first
        if (this.dailyStatsCache &&
            this.dailyStatsCache.days === lastDays &&
            Date.now() - this.dailyStatsCache.timestamp < this.DAILY_STATS_CACHE_TTL_MS) {
            return this.dailyStatsCache.data;
        }
        const stats = [];
        const today = new Date();
        for (let i = 0; i < lastDays; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const filePath = path.join(this.storageDir, `audit-${dateStr}.jsonl`);
            // Use async file check instead of sync
            let fileExists = false;
            try {
                await fs.promises.access(filePath);
                fileExists = true;
            }
            catch {
                fileExists = false;
            }
            if (fileExists) {
                try {
                    const content = await fs.promises.readFile(filePath, 'utf8');
                    const lines = content.trim().split('\n');
                    let totalReq = 0;
                    let totalLat = 0;
                    let tokensIn = 0;
                    let tokensOut = 0;
                    let errors = 0;
                    const ips = new Set();
                    for (const line of lines) {
                        if (!line) {
                            continue;
                        }
                        try {
                            const entry = JSON.parse(line);
                            totalReq++;
                            totalLat += entry.durationMs;
                            if (entry.tokensIn) {
                                tokensIn += entry.tokensIn;
                            }
                            if (entry.tokensOut) {
                                tokensOut += entry.tokensOut;
                            }
                            if (entry.status >= 400) {
                                errors++;
                            }
                            if (entry.ip) {
                                ips.add(entry.ip);
                            }
                        }
                        catch {
                            // ignore corrupt lines
                        }
                    }
                    stats.push({
                        date: dateStr,
                        totalRequests: totalReq,
                        avgLatency: totalReq > 0 ? Math.round(totalLat / totalReq) : 0,
                        tokensIn,
                        tokensOut,
                        totalTokens: tokensIn + tokensOut,
                        errorCount: errors,
                        uniqueIps: ips.size
                    });
                }
                catch (e) {
                    console.error(`Error reading log ${filePath}`, e);
                }
            }
            else {
                stats.push({
                    date: dateStr,
                    totalRequests: 0,
                    avgLatency: 0,
                    tokensIn: 0,
                    tokensOut: 0,
                    totalTokens: 0,
                    errorCount: 0,
                    uniqueIps: 0
                });
            }
        }
        // Cache result and return sorted by date ascending
        const result = stats.sort((a, b) => a.date.localeCompare(b.date));
        this.dailyStatsCache = { data: result, timestamp: Date.now(), days: lastDays };
        return result;
    }
    async getTodayStats() {
        const stats = await this.getDailyStats(1);
        if (stats.length > 0) {
            // Check if the returned stat is actually for today
            const todayStr = new Date().toISOString().split('T')[0];
            if (stats[stats.length - 1].date === todayStr) {
                return stats[stats.length - 1];
            }
        }
        return {
            date: new Date().toISOString().split('T')[0],
            totalRequests: 0,
            avgLatency: 0,
            tokensIn: 0,
            tokensOut: 0,
            totalTokens: 0,
            errorCount: 0,
            uniqueIps: 0
        };
    }
    async getLogEntries(page = 1, pageSize = 10) {
        try {
            if (!fs.existsSync(this.storageDir)) {
                return mergeRecentAuditEntries([], this.writeQueue, page, pageSize);
            }
            const files = await fs.promises.readdir(this.storageDir);
            const validFiles = files.filter(f => f.startsWith('audit-') && f.endsWith('.jsonl')).sort().reverse();
            let flushedEntries = [];
            // Read last 14 files (2 weeks) to be safe
            for (const file of validFiles.slice(0, 14)) {
                try {
                    const content = await fs.promises.readFile(path.join(this.storageDir, file), 'utf8');
                    const fileEntries = [];
                    content.split('\n').forEach(line => {
                        if (line.trim()) {
                            try {
                                const e = JSON.parse(line);
                                if (e && e.timestamp) {
                                    fileEntries.push(e);
                                }
                            }
                            catch { /* ignore */ }
                        }
                    });
                    flushedEntries = flushedEntries.concat(fileEntries);
                }
                catch (e) {
                    console.error(`[AuditService] Error reading ${file}`, e);
                }
            }
            return mergeRecentAuditEntries(flushedEntries, this.writeQueue, page, pageSize);
        }
        catch (error) {
            console.error('[AuditService] Failed to get logs:', error);
            return mergeRecentAuditEntries([], this.writeQueue, page, pageSize);
        }
    }
    getLogFolderPath() {
        return this.storageDir;
    }
    async getLifetimeStats() {
        // Return cached stats if available (set from globalState on first call)
        if (this.cachedLifetimeStats) {
            return this.cachedLifetimeStats;
        }
        // Try to load from globalState first (fast path)
        const cached = this.context.globalState.get('lifetimeStats');
        if (cached) {
            this.cachedLifetimeStats = cached;
            return cached;
        }
        // Fallback: calculate from files (only happens once ever, or after reset)
        const dailyStats = await this.getDailyStats(365);
        this.cachedLifetimeStats = dailyStats.reduce((acc, day) => ({
            totalRequests: acc.totalRequests + day.totalRequests,
            totalTokensIn: acc.totalTokensIn + day.tokensIn,
            totalTokensOut: acc.totalTokensOut + day.tokensOut
        }), { totalRequests: 0, totalTokensIn: 0, totalTokensOut: 0 });
        // Cache in globalState for next startup
        await this.context.globalState.update('lifetimeStats', this.cachedLifetimeStats);
        return this.cachedLifetimeStats;
    }
    dispose() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flush(); // final flush
        }
    }
}
//# sourceMappingURL=AuditService.js.map