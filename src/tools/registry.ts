import { ToolRegistry } from './toolRegistry.ts';

const registry = new ToolRegistry();

export function getToolRegistry(): ToolRegistry {
	return registry;
}

export function resetToolRegistry(): void {
	registry.clear();
}
