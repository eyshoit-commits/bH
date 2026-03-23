import * as fs from 'fs/promises';
import type { CoreSkill, CoreSkillManifest } from '../types';
import { normalizeCoreSkill } from '../types';

export type ReadSkillManifestErrorCode =
  | 'ERR_FILE_NOT_FOUND'
  | 'ERR_READ_FILE'
  | 'ERR_PARSE_FRONTMATTER'
  | 'ERR_INVALID_MANIFEST';

export interface ReadSkillManifestError extends Error {
  code: ReadSkillManifestErrorCode;
  manifestPath?: string;
}

function createError(message: string, code: ReadSkillManifestErrorCode, manifestPath?: string): ReadSkillManifestError {
  const error = new Error(message) as ReadSkillManifestError;
  error.code = code;
  if (manifestPath) {
    error.manifestPath = manifestPath;
  }
  return error;
}

function parseFrontmatter(frontmatter: string): Record<string, string> {
  return frontmatter.split(/\r?\n/).reduce<Record<string, string>>((acc, line) => {
    const match = line.match(/^([\w-]+):\s*(.*)$/);
    if (match) {
      acc[match[1]] = match[2].trim();
    }
    return acc;
  }, {});
}

export async function readSkillManifest(filePath: string): Promise<CoreSkill> {
  try {
    await fs.access(filePath);
  } catch {
    throw createError(`Manifest file not found: ${filePath}`, 'ERR_FILE_NOT_FOUND', filePath);
  }

  let content: string;
  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch {
    throw createError(`Failed to read manifest: ${filePath}`, 'ERR_READ_FILE', filePath);
  }

  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw createError(`No valid YAML frontmatter found in: ${filePath}`, 'ERR_PARSE_FRONTMATTER', filePath);
  }

  const data = parseFrontmatter(frontmatterMatch[1]);
  const manifest: Partial<CoreSkillManifest> & { path?: string } = {
    ...data,
    path: data.path ?? filePath
  };

  try {
    return normalizeCoreSkill(manifest as CoreSkillManifest & Partial<CoreSkill>);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid manifest';
    throw createError(`Invalid manifest: ${message}`, 'ERR_INVALID_MANIFEST', filePath);
  }
}
