import * as fs from 'fs/promises';
import * as path from 'path';
import { readSkillManifest } from './readSkillManifest';
import { resolveSkillPath } from '../config';
function createError(message, code, directoryPath) {
    const error = new Error(message);
    error.code = code;
    error.directoryPath = directoryPath;
    return error;
}
const rejectionLog = [];
export function getDiscoveryRejections() {
    return [...rejectionLog];
}
export function clearDiscoveryRejections() {
    rejectionLog.length = 0;
}
function recordRejection(entry) {
    rejectionLog.push(entry);
}
export async function discoverSkills(directoryPath) {
    const resolvedPath = directoryPath ?? resolveSkillPath();
    let entries;
    try {
        const stats = await fs.stat(resolvedPath);
        if (!stats.isDirectory()) {
            throw createError(`Path is not a directory: ${resolvedPath}`, 'ERR_INVALID_DIRECTORY', resolvedPath);
        }
    }
    catch (error) {
        if (error?.code === 'ENOENT') {
            throw createError(`Directory not found: ${resolvedPath}`, 'ERR_INVALID_DIRECTORY', resolvedPath);
        }
        throw createError(`Failed to access directory: ${resolvedPath}`, 'ERR_INVALID_DIRECTORY', resolvedPath);
    }
    try {
        entries = await fs.readdir(resolvedPath, { withFileTypes: true });
    }
    catch {
        throw createError(`Failed to read directory: ${resolvedPath}`, 'ERR_READ_DIRECTORY', resolvedPath);
    }
    const skillFiles = new Set();
    const rootManifest = path.join(resolvedPath, 'SKILL.md');
    try {
        await fs.access(rootManifest);
        skillFiles.add(rootManifest);
    }
    catch {
        // ignore missing root manifest
    }
    for (const entry of entries) {
        if (entry.isDirectory()) {
            skillFiles.add(path.join(resolvedPath, entry.name, 'SKILL.md'));
        }
        else if (entry.isFile() && entry.name.toLowerCase() === 'skill.md') {
            skillFiles.add(path.join(resolvedPath, entry.name));
        }
    }
    const skills = [];
    for (const manifestPath of skillFiles) {
        try {
            const skill = await readSkillManifest(manifestPath);
            skills.push(skill);
        }
        catch (error) {
            recordRejection({
                manifestPath,
                reason: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    return skills;
}
//# sourceMappingURL=discoverSkills.js.map