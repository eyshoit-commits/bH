/**
 * Read skill manifest from filesystem.
 * Parses a markdown file with YAML frontmatter into a SkillManifest.
 */
import * as fs from 'fs/promises';
/**
 * Read and parse a single skill manifest file.
 *
 * @param filePath - Absolute path to the manifest file (.md)
 * @returns Promise resolving to SkillManifest
 * @throws ReadSkillManifestError on failure
 */
export async function readSkillManifest(filePath) {
    // Validate file exists
    try {
        await fs.access(filePath);
    }
    catch {
        const error = new Error(`Manifest file not found: ${filePath}`);
        error.code = 'ERR_FILE_NOT_FOUND';
        error.manifestPath = filePath;
        throw error;
    }
    // Read file content
    let content;
    try {
        content = await fs.readFile(filePath, 'utf-8');
    }
    catch (err) {
        const error = new Error(`Failed to read manifest: ${filePath}`);
        error.code = 'ERR_READ_FILE';
        error.manifestPath = filePath;
        throw error;
    }
    // Parse YAML frontmatter (--- delimited)
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
        const error = new Error(`No valid YAML frontmatter found in: ${filePath}`);
        error.code = 'ERR_PARSE_FRONTMATTER';
        error.manifestPath = filePath;
        throw error;
    }
    // Parse frontmatter manually (simple key: value parser)
    const frontmatter = frontmatterMatch[1];
    const manifest = {};
    const requiredFields = ['id', 'name', 'version', 'description'];
    for (const field of requiredFields) {
        const regex = new RegExp(`^${field}:\\s*(.+)$`, 'm');
        const match = frontmatter.match(regex);
        if (!match) {
            const error = new Error(`Missing required field "${field}" in: ${filePath}`);
            error.code = 'ERR_INVALID_MANIFEST';
            error.manifestPath = filePath;
            throw error;
        }
        manifest[field] = match[1].trim();
    }
    // Parse optional fields
    const optionalFields = ['source', 'path'];
    for (const field of optionalFields) {
        const regex = new RegExp(`^${field}:\\s*(.+)$`, 'm');
        const match = frontmatter.match(regex);
        if (match) {
            manifest[field] = match[1].trim();
        }
    }
    // Validate and return
    if (!manifest.id || !manifest.name || !manifest.version || !manifest.description) {
        const error = new Error(`Invalid manifest: missing required fields in ${filePath}`);
        error.code = 'ERR_INVALID_MANIFEST';
        error.manifestPath = filePath;
        throw error;
    }
    return manifest;
}
//# sourceMappingURL=readSkillManifest.js.map