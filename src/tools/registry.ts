import { ToolRegistry } from './toolRegistry';

const registry = new ToolRegistry();

export function getToolRegistry(): ToolRegistry {
	return registry;
}

export function resetToolRegistry(): void {
	registry.clear();
}
