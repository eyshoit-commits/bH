/**
 * Skill manifest surface contract.
 * This interface defines the minimal and future-proof shape
 * for skill descriptors used by the gateway/model registry.
 */
export interface SkillManifest {
  /**
   * Unique identifier for the skill.
   * Should be stable across versions.
   */
  id: string;
  /**
   * Display name of the skill.
   */
  name: string;
  /**
   * Semantic version string, e.g. "1.0.0".
   */
  version: string;
  /**
   * Human-readable description of the skill.
   */
  description: string;
  /**
   * Optional source category to help with discovery and routing.
   */
  source?: 'local' | 'git' | 'bundled' | 'provider';
  /**
   * Optional path to the manifest within a repository or filesystem.
   */
  path?: string;
}

// Minimal example export for quick sanity checks in TypeScript environments.
// Note: This is not a runtime value required by the system.
export const __SkillManifestExample__: SkillManifest = {
  id: "example.skill",
  name: "ExampleSkill",
  version: "0.1.0",
  description: "A minimal example manifest for tests"
};
