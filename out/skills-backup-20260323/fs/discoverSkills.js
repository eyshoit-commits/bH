import * as fs from 'fs/promises';
import * as path from 'path';
import { readSkillManifest } from './readSkillManifest';
async function isDirectory(filePath) {
    try {
        const stat = await fs.stat(filePath);
        return stat.isDirectory();
    }
    catch {
        return false;
    }
}
export async function discoverSkills(directoryPath) {
    const isDir = await isDirectory(directoryPath);
    if (!isDir) {
        const error = new Error(`Invalid directory: ${directoryPath}`);
        error.code = 'ERR_INVALID_DIRECTORY';
        error.directoryPath = directoryPath;
        throw error;
    }
    let entries;
    try {
        entries = await fs.readdir(directoryPath);
    }
    catch (err) {
        const error = new Error(`Failed to read directory: ${directoryPath}`);
        error.code = 'ERR_READ_DIRECTORY';
        error.directoryPath = directoryPath;
        throw error;
    }
    const manifests = [];
    for (const entry of entries) {
        if (!entry.endsWith('.md')) {
            continue;
        }
        const manifestPath = path.join(directoryPath, entry);
        try {
            const manifest = await readSkillManifest(manifestPath);
            manifests.push(manifest);
        }
        catch (err) {
            continue;
        }
    }
    return manifests;
}
//# sourceMappingURL=discoverSkills.js.map