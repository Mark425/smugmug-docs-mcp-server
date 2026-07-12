# SmugMug Docs MCP Server

This project creates a lightweight TypeScript MCP server that wraps the SmugMug API reference docs over stdio and can also call the live SmugMug API using credentials from the local secrets file.

## What it provides

The server exposes three tools:

- `search_smugmug_docs(query)` to search a bundled catalog of SmugMug docs topics
- `fetch_smugmug_doc(input)` to fetch content for a docs page or docs path
- `smugmug_api_call(path, method, params)` to call the live SmugMug API using the credentials in `secrets.txt`

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

If you want the live API tool to work, place your SmugMug API key and secret in `secrets.txt` using this format:

```text
smug mug api key: YOUR_API_KEY
smug mug secret: YOUR_API_SECRET
```

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
