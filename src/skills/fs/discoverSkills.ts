import * as fs from 'fs/promises';
import type { Dirent } from 'fs';
import * as path from 'path';
import type { CoreSkill } from '../types';
import { readSkillManifest } from './readSkillManifest';
import { resolveSkillPath } from '../config';

export type DiscoverSkillsErrorCode =
  | 'ERR_INVALID_DIRECTORY'
  | 'ERR_READ_DIRECTORY';

export interface DiscoverSkillsError extends Error {
  code: DiscoverSkillsErrorCode;
  directoryPath?: string;
}

function createError(message: string, code: DiscoverSkillsErrorCode, directoryPath?: string): DiscoverSkillsError {
  const error = new Error(message) as DiscoverSkillsError;
  error.code = code;
  error.directoryPath = directoryPath;
  return error;
}

type RejectionEntry = {
  manifestPath: string;
  reason: string;
};

const rejectionLog: RejectionEntry[] = [];

export function getDiscoveryRejections(): RejectionEntry[] {
  return [...rejectionLog];
}

export function clearDiscoveryRejections(): void {
  rejectionLog.length = 0;
}

function recordRejection(entry: RejectionEntry): void {
  rejectionLog.push(entry);
}

export async function discoverSkills(directoryPath?: string): Promise<CoreSkill[]> {
  const resolvedPath = directoryPath ?? resolveSkillPath();
  let entries: Dirent[];
  try {
    const stats = await fs.stat(resolvedPath);
    if (!stats.isDirectory()) {
      throw createError(`Path is not a directory: ${resolvedPath}`, 'ERR_INVALID_DIRECTORY', resolvedPath);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      throw createError(`Directory not found: ${resolvedPath}`, 'ERR_INVALID_DIRECTORY', resolvedPath);
    }
    throw createError(`Failed to access directory: ${resolvedPath}`, 'ERR_INVALID_DIRECTORY', resolvedPath);
  }

  try {
    entries = await fs.readdir(resolvedPath, { withFileTypes: true });
  } catch {
    throw createError(`Failed to read directory: ${resolvedPath}`, 'ERR_READ_DIRECTORY', resolvedPath);
  }

  const skillFiles = new Set<string>();
  const rootManifest = path.join(resolvedPath, 'SKILL.md');
  try {
    await fs.access(rootManifest);
    skillFiles.add(rootManifest);
  } catch {
    // ignore missing root manifest
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      skillFiles.add(path.join(resolvedPath, entry.name, 'SKILL.md'));
    } else if (entry.isFile() && entry.name.toLowerCase() === 'skill.md') {
      skillFiles.add(path.join(resolvedPath, entry.name));
    }
  }

  const skills: CoreSkill[] = [];
  for (const manifestPath of skillFiles) {
    try {
      const skill = await readSkillManifest(manifestPath);
      skills.push(skill);
    } catch (error) {
      recordRejection({
        manifestPath,
        reason: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return skills;
}
