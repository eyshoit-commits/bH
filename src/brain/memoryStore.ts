export interface MemoryEntry {
	id: string;
	decisionId: string;
	content: string;
	metadata: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
}

export interface MemorySnapshot {
	entries: MemoryEntry[];
	totalCount: number;
	lastEntryAt: string | null;
}

class MemoryStore {
	private entries = new Map<string, MemoryEntry>();

	store(decisionId: string, content: string, metadata: Record<string, unknown> = {}): MemoryEntry {
		const id = `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		const entry: MemoryEntry = {
			id,
			decisionId,
			content,
			metadata,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		this.entries.set(id, entry);
		return entry;
	}

	get(id: string): MemoryEntry | undefined {
		return this.entries.get(id);
	}

	getByDecision(decisionId: string): MemoryEntry[] {
		return [...this.entries.values()]
			.filter(e => e.decisionId === decisionId)
			.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	}

	getAll(): MemoryEntry[] {
		return [...this.entries.values()]
			.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	}

	getSnapshot(): MemorySnapshot {
		const entries = this.getAll();
		return {
			entries,
			totalCount: entries.length,
			lastEntryAt: entries.length > 0 ? entries[entries.length - 1].createdAt : null
		};
	}

	clear(): void {
		this.entries.clear();
	}
}

const store = new MemoryStore();

export function getMemoryStore(): MemoryStore {
	return store;
}
