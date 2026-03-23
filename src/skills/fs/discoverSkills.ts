import * as fs from 'fs/promises';
import * as path from 'path';
import { SkillManifest } from '../types';
import { readSkillManifest } from './readSkillManifest';

export type DiscoverSkillsErrorCode =
	| 'ERR_INVALID_DIRECTORY'
	| 'ERR_READ_DIRECTORY'
	| 'ERR_PARSE_MANIFEST'
	| 'ERR_UNKNOWN';

export interface DiscoverSkillsError extends Error {
	code: DiscoverSkillsErrorCode;
	directoryPath?: string;
	manifestPath?: string;
}

async function isDirectory(filePath: string): Promise<boolean> {
	try {
		const stat = await fs.stat(filePath);
		return stat.isDirectory();
	} catch {
		return false;
	}
}

export async function discoverSkills(directoryPath: string): Promise<SkillManifest[]> {
	const isDir = await isDirectory(directoryPath);
	if (!isDir) {
		const error = new Error(`Invalid directory: ${directoryPath}`) as DiscoverSkillsError;
		error.code = 'ERR_INVALID_DIRECTORY';
		error.directoryPath = directoryPath;
		throw error;
	}

	let entries: string[];
	try {
		entries = await fs.readdir(directoryPath);
	} catch (err) {
		const error = new Error(`Failed to read directory: ${directoryPath}`) as DiscoverSkillsError;
		error.code = 'ERR_READ_DIRECTORY';
		error.directoryPath = directoryPath;
		throw error;
	}

	const manifests: SkillManifest[] = [];
	for (const entry of entries) {
		if (!entry.endsWith('.md')) {
			continue;
		}
		const manifestPath = path.join(directoryPath, entry);
		try {
			const manifest = await readSkillManifest(manifestPath);
			manifests.push(manifest);
		} catch (err) {
			continue;
		}
	}

	return manifests;
}
