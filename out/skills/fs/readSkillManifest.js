import * as fs from 'fs/promises';
import { normalizeCoreSkill } from '../types';
function createError(message, code, manifestPath) {
    const error = new Error(message);
    error.code = code;
    if (manifestPath) {
        error.manifestPath = manifestPath;
    }
    return error;
}
function parseFrontmatter(frontmatter) {
    return frontmatter.split(/\r?\n/).reduce((acc, line) => {
        const match = line.match(/^([\w-]+):\s*(.*)$/);
        if (match) {
            acc[match[1]] = match[2].trim();
        }
        return acc;
    }, {});
}
export async function readSkillManifest(filePath) {
    try {
        await fs.access(filePath);
    }
    catch {
        throw createError(`Manifest file not found: ${filePath}`, 'ERR_FILE_NOT_FOUND', filePath);
    }
    let content;
    try {
        content = await fs.readFile(filePath, 'utf-8');
    }
    catch {
        throw createError(`Failed to read manifest: ${filePath}`, 'ERR_READ_FILE', filePath);
    }
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
        throw createError(`No valid YAML frontmatter found in: ${filePath}`, 'ERR_PARSE_FRONTMATTER', filePath);
    }
    const data = parseFrontmatter(frontmatterMatch[1]);
    const manifest = {
        ...data,
        path: data.path ?? filePath
    };
    try {
        return normalizeCoreSkill(manifest);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid manifest';
        throw createError(`Invalid manifest: ${message}`, 'ERR_INVALID_MANIFEST', filePath);
    }
}
//# sourceMappingURL=readSkillManifest.js.map