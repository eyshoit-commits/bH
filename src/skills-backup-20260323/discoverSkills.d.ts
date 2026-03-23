import { SkillManifest } from "./types";

/**
 * Discovery surface for skills in a directory.
 * Scans the provided directory for skill manifests and returns a
 * list of SkillManifest descriptors.
 */
export declare function discoverSkills(directoryPath: string): Promise<SkillManifest[]>;

/**
 * Error surface for discoverSkills failures.
 * Distinguished error codes to aid callers in handling errors gracefully.
 */
export type DiscoverSkillsErrorCode =
  | "ERR_INVALID_DIRECTORY"
  | "ERR_READ_DIRECTORY"
  | "ERR_PARSE_MANIFEST"
  | "ERR_UNKNOWN";

export interface DiscoverSkillsError extends Error {
  code: DiscoverSkillsErrorCode;
  // The directory that caused the error, if known
  directoryPath?: string;
  // The manifest/file involved in the error, if applicable
  manifestPath?: string;
}
