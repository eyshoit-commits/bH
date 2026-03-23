import type { CoreSkill } from './types';
import { resolveSkillPath } from './config';
import { SkillRegistry } from './registry/skillRegistry';
import type { SkillRegistrySnapshot, SkillRejection } from './registry/skillRegistry';

const registry = new SkillRegistry();

export async function loadSkillsFromDirectory(directoryPath: string): Promise<void> {
  await registry.loadFromDirectory(directoryPath);
}

export async function loadDefaultSkills(): Promise<void> {
  const path = resolveSkillPath();
  await registry.loadFromDirectory(path);
}

export function getSkills(): CoreSkill[] {
  return registry.getSkills();
}

export function getSkillSnapshot(): SkillRegistrySnapshot {
  return registry.getSnapshot();
}

export function getSkillRejections(): SkillRejection[] {
  return registry.getRejections();
}

export { SkillRegistry };
export type { SkillRegistrySnapshot, SkillRejection };
export type { CoreSkill };
