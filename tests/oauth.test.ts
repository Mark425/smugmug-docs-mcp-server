import { strict as assert } from "node:assert";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { createOAuthAuthorizationHeader } from "../src/oauth.js";
import { loadSmugMugConfig } from "../src/secrets.js";

const credentials = {
  consumerKey: "consumer-key",
  consumerSecret: "consumer-secret",
  accessToken: "access-token",
  tokenSecret: "token-secret"
};

test("creates a deterministic OAuth header for fixed request metadata", () => {
  const url = new URL("https://api.smugmug.com/api/v2/user?query=hello%20world&sort=recent");
  const options = { nonce: "fixed-nonce", timestamp: 1700000000 };
  const first = createOAuthAuthorizationHeader(url, "get", credentials, options);
  const second = createOAuthAuthorizationHeader(url, "GET", credentials, options);

  assert.equal(first, second);
  assert.match(first, /^OAuth /);
  assert.match(first, /oauth_consumer_key="consumer-key"/);
  assert.match(first, /oauth_token="access-token"/);
  assert.match(first, /oauth_nonce="fixed-nonce"/);
  assert.match(first, /oauth_timestamp="1700000000"/);
  assert.doesNotMatch(first, /consumer-secret|token-secret/);
});

test("includes query parameters in the signature", () => {
  const options = { nonce: "fixed-nonce", timestamp: 1700000000 };
  const first = createOAuthAuthorizationHeader(
    new URL("https://api.smugmug.com/api/v2/user?query=one"),
    "GET",
    credentials,
    options
  );
  const second = createOAuthAuthorizationHeader(
    new URL("https://api.smugmug.com/api/v2/user?query=two"),
    "GET",
    credentials,
    options
  );

  assert.notEqual(first, second);
});

test("loads all OAuth credentials from the configured secrets file", async () => {
  const directory = await mkdtemp(join(tmpdir(), "smugmug-oauth-"));
  const file = join(directory, "secrets.txt");
  await writeFile(
    file,
    [
      "smug mug api key: consumer-key",
      "smug mug secret: consumer-secret",
      "smug mug access token: access-token",
      "smug mug token secret: token-secret"
    ].join("\n")
  );

  const environment = {
    SMUGMUG_SECRETS_FILE: process.env.SMUGMUG_SECRETS_FILE,
    SMUGMUG_API_KEY: process.env.SMUGMUG_API_KEY,
    SMUGMUG_API_SECRET: process.env.SMUGMUG_API_SECRET,
    SMUGMUG_ACCESS_TOKEN: process.env.SMUGMUG_ACCESS_TOKEN,
    SMUGMUG_TOKEN_SECRET: process.env.SMUGMUG_TOKEN_SECRET
  };

  try {
    delete process.env.SMUGMUG_API_KEY;
    delete process.env.SMUGMUG_API_SECRET;
    delete process.env.SMUGMUG_ACCESS_TOKEN;
    delete process.env.SMUGMUG_TOKEN_SECRET;
    process.env.SMUGMUG_SECRETS_FILE = file;

    assert.deepEqual(loadSmugMugConfig(), {
      apiKey: "consumer-key",
      apiSecret: "consumer-secret",
      accessToken: "access-token",
      tokenSecret: "token-secret",
      source: "file",
      path: file
    });
  } finally {
    for (const [key, value] of Object.entries(environment)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});
