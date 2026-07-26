# SmugMug Docs MCP Server

This project creates a lightweight TypeScript MCP server that wraps the SmugMug API reference docs over stdio and can also call the live SmugMug API using credentials from the local secrets file.

## What it provides

The server exposes three tools:

- `search_smugmug_docs(query)` to search a bundled catalog of SmugMug docs topics
- `fetch_smugmug_doc(input)` to fetch content for a docs page or docs path
- `smugmug_api_call(path, method, params)` to call the live SmugMug API using the credentials in `secrets.txt`

> **Known limitation:** `smugmug_api_call` sends credentials as `X-SmugMug-API-Key` and
> `X-SmugMug-API-Secret` headers, but SmugMug API v2 expects OAuth 1.0a request signing. Live calls
> may return `401` even when credentials are loaded correctly.

## Setup

1. Install Node.js 20+.
2. Install dependencies:

```bash
npm install
```

3. Build the server:

```bash
npm run build
```

4. Start it locally:

```bash
npm start
```

## Running it from another project

The package exposes a `smugmug-docs-mcp-server` binary and ships prebuilt output, so any MCP
client can launch it straight from GitHub without cloning:

```bash
npx --yes --package=git+https://github.com/Mark425/smugmug-docs-mcp-server.git#REVISION smugmug-docs-mcp-server
```

Pin `REVISION` to a specific commit so clients get a reproducible server.

`npx` re-clones and rebuilds the package on every launch, which takes roughly a minute and will
exceed the startup timeout of some MCP clients. For anything you start regularly, install it once
instead and point the client at the resulting `smugmug-docs-mcp-server` binary:

```bash
npm install -g git+https://github.com/Mark425/smugmug-docs-mcp-server.git#REVISION
```

`typescript` and `@types/node` stay in `devDependencies`, and `dist/` is committed to the repository
rather than built on install. npm does not install a package's dependencies before running its
`prepare` script during `npm install -g <git-url>`, so an install-time build cannot work for this
distribution method. **Run `npm run build` and commit the result whenever you change `src/`.**

## Credentials

`smugmug_api_call` looks for credentials in the following order:

1. `SMUGMUG_API_KEY` and `SMUGMUG_API_SECRET` environment variables.
2. The file named by `SMUGMUG_SECRETS_FILE`.
3. `secrets.txt` inside the directory named by `SMUGMUG_WORKSPACE_ROOT`.
4. `secrets.txt` in the current working directory.

The secrets file uses this format:

```text
smug mug api key: YOUR_API_KEY
smug mug secret: YOUR_API_SECRET
```

Prefer `SMUGMUG_SECRETS_FILE` over the `SMUGMUG_API_KEY` variables when configuring an MCP client:
MCP configuration files are typically committed to a repository or stored in a shared user config,
so keeping the credentials in an ignored secrets file avoids checking them in.

Option 4 exists for backwards compatibility, but relying on it is fragile — MCP clients start the
server with whatever working directory they choose, and some (such as GitHub Copilot CLI) provide no
way to set it. Set `SMUGMUG_SECRETS_FILE` explicitly instead.

## How to use it in VS Code

This repository includes a VS Code MCP configuration in `.vscode/mcp.json`, so the server can be launched directly from the workspace.

### 1. Make sure the server is built

Run:

```bash
npm run build
```

### 2. Open the workspace in VS Code

The server should be discoverable through the MCP configuration in `.vscode/mcp.json`.

### 3. Connect the MCP server

In VS Code, use the MCP or chat tool integration to connect to the server defined in `.vscode/mcp.json`.

Once connected, you can ask the agent to use tools such as:

- "Search the SmugMug docs for albums"
- "Fetch the SmugMug API overview page"
- "Call the live SmugMug API at /api/v2/user"

### 4. Optional: use your credentials

If you want the live API tool to work, place your SmugMug API key and secret in `secrets.txt` using
this format:

```text
smug mug api key: YOUR_API_KEY
smug mug secret: YOUR_API_SECRET
```

See [Credentials](#credentials) for the other supported locations.

## Example tool calls

### Search docs

```json
{
  "query": "albums"
}
```

### Fetch a docs page

```json
{
  "input": "tutorial/api-key.html"
}
```

### Call the live API

```json
{
  "path": "/api/v2/user",
  "method": "GET"
}
```
