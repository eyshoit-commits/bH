/**
 * SkillRegistry - In-memory surface for discovered skills.
 * 
 * This module provides a minimal in-memory registry that loads skill manifests
 * at startup via discoverSkills() and surfaces them via getSkills().
 * 
 * DESIGN PRINCIPLES:
 * - In-memory only: no persistence, no writes
 * - Startup-time load: manifests discovered once on startup
 * - Read-only surface: API consumers get a snapshot of discovered skills
 */

import { SkillManifest } from "./types";
import { discoverSkills } from "./fs/discoverSkills";

/**
 * In-memory registry state.
 * Kept module-private to enforce controlled access via getSkills().
 */
let _registry: SkillManifest[] = [];

/**
 * Check whether the registry has been populated.
 */
export function isLoaded(): boolean {
  return _registry.length > 0;
}

/**
 * Load skill manifests from a directory into the in-memory surface.
 * This should be called once at startup.
 * 
 * @param directoryPath - Absolute path to scan for skill manifests
 * @returns Promise that resolves when loading completes
 * @throws DiscoverSkillsError on failure
 */
export async function loadSkillsFromDirectory(directoryPath: string): Promise<void> {
  _registry = await discoverSkills(directoryPath);
}

/**
 * Return the current set of discovered skill manifests.
 * Returns an empty array if loadSkillsFromDirectory has not been called.
 */
export function getSkills(): SkillManifest[] {
  // Return a shallow copy to preserve internal immutability
  return [..._registry];
}

export { SkillManifest } from "./types";
