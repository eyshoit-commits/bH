export function parseJsonBody(raw: string): unknown {
	const normalized = raw.replace(/^\uFEFF/, '').trim();
	if (!normalized) {
		return {};
	}

	return JSON.parse(normalized);
}
