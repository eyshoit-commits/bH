import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getDefaultReposPath } from './skillRepoConfig';
import { getSkillRepoRegistry } from './skillRepoRegistry';
const execAsync = promisify(exec);
export async function syncRepo(config, basePath) {
    const reposPath = basePath ?? getDefaultReposPath();
    const localPath = path.join(reposPath, config.name);
    try {
        await fs.mkdir(reposPath, { recursive: true });
        let exists = false;
        try {
            await fs.access(path.join(localPath, '.git'));
            exists = true;
        }
        catch {
            exists = false;
        }
        if (exists) {
            await execAsync(`git -C "${localPath}" fetch origin ${config.branch}`);
            await execAsync(`git -C "${localPath}" checkout ${config.branch}`);
            await execAsync(`git -C "${localPath}" pull origin ${config.branch}`);
        }
        else {
            await execAsync(`git clone --branch ${config.branch} "${config.url}" "${localPath}"`);
        }
        const { stdout: hash } = await execAsync(`git -C "${localPath}" rev-parse --short HEAD`);
        return {
            repo: config.name,
            success: true,
            message: exists ? 'Repository updated' : 'Repository cloned',
            commitHash: hash.trim()
        };
    }
    catch (error) {
        return {
            repo: config.name,
            success: false,
            message: error.message
        };
    }
}
export async function syncAllRepos(basePath) {
    const registry = getSkillRepoRegistry();
    const enabledRepos = registry.getEnabledRepos();
    const results = [];
    for (const repo of enabledRepos) {
        const result = await syncRepo(repo, basePath);
        results.push(result);
    }
    registry.setLastSync(new Date().toISOString());
    return results;
}
//# sourceMappingURL=syncSkillRepo.js.map