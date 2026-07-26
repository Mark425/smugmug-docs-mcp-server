import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

export interface SmugMugConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  tokenSecret?: string;
  source: "file" | "env" | "none";
  /** The secrets file that was read, when `source` is `"file"`. */
  path?: string;
}

function parseSecrets(raw: string): {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  tokenSecret?: string;
} {
  return {
    apiKey: raw.match(/smug\s*mug\s*api\s*key\s*[:=]\s*([^\s]+)/i)?.[1],
    apiSecret: raw.match(/smug\s*mug\s*secret\s*[:=]\s*([^\s]+)/i)?.[1],
    accessToken: raw.match(/smug\s*mug\s*access\s*token\s*[:=]\s*([^\s]+)/i)?.[1],
    tokenSecret: raw.match(/smug\s*mug\s*token\s*secret\s*[:=]\s*([^\s]+)/i)?.[1]
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
function secretsFileCandidates(): string[] {
  const candidates: string[] = [];
  const explicitFile = process.env.SMUGMUG_SECRETS_FILE?.trim();
  const workspaceRoot = process.env.SMUGMUG_WORKSPACE_ROOT?.trim();

  if (explicitFile) {
    candidates.push(
      isAbsolute(explicitFile) ? explicitFile : resolve(process.cwd(), explicitFile)
    );
  }

  if (workspaceRoot) {
    candidates.push(resolve(workspaceRoot, "secrets.txt"));
  }

  candidates.push(resolve(process.cwd(), "secrets.txt"));

  return candidates;
}

export function loadSmugMugConfig(): SmugMugConfig {
  const envKey = process.env.SMUGMUG_API_KEY?.trim();
  const envSecret = process.env.SMUGMUG_API_SECRET?.trim();
  const envAccessToken = process.env.SMUGMUG_ACCESS_TOKEN?.trim();
  const envTokenSecret = process.env.SMUGMUG_TOKEN_SECRET?.trim();

  if (envKey || envSecret || envAccessToken || envTokenSecret) {
    return {
      apiKey: envKey || undefined,
      apiSecret: envSecret || undefined,
      accessToken: envAccessToken || undefined,
      tokenSecret: envTokenSecret || undefined,
      source: "env"
    };
  }

  for (const path of secretsFileCandidates()) {
    try {
      const { apiKey, apiSecret, accessToken, tokenSecret } = parseSecrets(
        readFileSync(path, "utf8")
      );

      if (apiKey || apiSecret || accessToken || tokenSecret) {
        return {
          apiKey,
          apiSecret,
          accessToken,
          tokenSecret,
          source: "file",
          path
        };
      }
    } catch {
      // ignore missing or unreadable file and try the next candidate
    }
  }

  return {
    source: "none"
  };
}
