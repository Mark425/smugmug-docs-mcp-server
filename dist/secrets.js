import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
function parseSecrets(raw) {
    return {
        apiKey: raw.match(/smug\s*mug\s*api\s*key\s*[:=]\s*([^\s]+)/i)?.[1],
        apiSecret: raw.match(/smug\s*mug\s*secret\s*[:=]\s*([^\s]+)/i)?.[1]
    };
}
/**
 * Candidate secrets file paths, in precedence order.
 *
 * Resolving against `process.cwd()` alone is unreliable: MCP clients start the
 * server with whatever working directory they happen to use, and some clients
 * (notably GitHub Copilot CLI) provide no way to set it. The environment
 * variables let a client point at the file explicitly.
 */
function secretsFileCandidates() {
    const candidates = [];
    const explicitFile = process.env.SMUGMUG_SECRETS_FILE?.trim();
    const workspaceRoot = process.env.SMUGMUG_WORKSPACE_ROOT?.trim();
    if (explicitFile) {
        candidates.push(isAbsolute(explicitFile) ? explicitFile : resolve(process.cwd(), explicitFile));
    }
    if (workspaceRoot) {
        candidates.push(resolve(workspaceRoot, "secrets.txt"));
    }
    candidates.push(resolve(process.cwd(), "secrets.txt"));
    return candidates;
}
export function loadSmugMugConfig() {
    const envKey = process.env.SMUGMUG_API_KEY?.trim();
    const envSecret = process.env.SMUGMUG_API_SECRET?.trim();
    if (envKey || envSecret) {
        return {
            apiKey: envKey || undefined,
            apiSecret: envSecret || undefined,
            source: "env"
        };
    }
    for (const path of secretsFileCandidates()) {
        try {
            const { apiKey, apiSecret } = parseSecrets(readFileSync(path, "utf8"));
            if (apiKey || apiSecret) {
                return {
                    apiKey,
                    apiSecret,
                    source: "file",
                    path
                };
            }
        }
        catch {
            // ignore missing or unreadable file and try the next candidate
        }
    }
    return {
        source: "none"
    };
}
