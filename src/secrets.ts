import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface SmugMugConfig {
  apiKey?: string;
  apiSecret?: string;
  source: "file" | "env" | "none";
}

export function loadSmugMugConfig(): SmugMugConfig {
  const filePath = resolve(process.cwd(), "secrets.txt");

  try {
    const raw = readFileSync(filePath, "utf8");
    const apiKey = raw.match(/smug\s*mug\s*api\s*key\s*[:=]\s*([^\s]+)/i)?.[1];
    const apiSecret = raw.match(/smug\s*mug\s*secret\s*[:=]\s*([^\s]+)/i)?.[1];

    if (apiKey || apiSecret) {
      return {
        apiKey,
        apiSecret,
        source: "file"
      };
    }
  } catch {
    // ignore missing file and fall back
  }

  return {
    source: "none"
  };
}
