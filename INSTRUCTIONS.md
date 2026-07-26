# SmugMug Docs MCP Server

## Install
1. Install Node.js 20+.
2. Run:
   - npm install
   - npm run build

## Run
- npm start

## VS Code MCP
The workspace includes a VS Code MCP configuration in .vscode/mcp.json. After building the server, VS Code should be able to start it from the workspace.

## Use from another project
The compiled `dist/` is committed, so the package needs no build step on install and exposes a
`smugmug-docs-mcp-server` binary.

    npx --yes --package=git+https://github.com/Mark425/smugmug-docs-mcp-server.git#REVISION smugmug-docs-mcp-server

npx re-clones on every launch (about a minute), which can exceed MCP client startup
timeouts. For regular use install it once and run the binary directly:

    npm install -g git+https://github.com/Mark425/smugmug-docs-mcp-server.git#REVISION
    smugmug-docs-mcp-server

Run `npm run build` and commit `dist/` whenever you change `src/`.

## Credentials
Resolved in this order:
1. SMUGMUG_API_KEY, SMUGMUG_API_SECRET, SMUGMUG_ACCESS_TOKEN, and SMUGMUG_TOKEN_SECRET
2. the file named by SMUGMUG_SECRETS_FILE
3. secrets.txt inside SMUGMUG_WORKSPACE_ROOT
4. secrets.txt in the current working directory

Prefer SMUGMUG_SECRETS_FILE in MCP client configs so credentials stay out of committed JSON.

The secrets file must contain:

    smug mug api key: YOUR_API_KEY
    smug mug secret: YOUR_API_SECRET
    smug mug access token: YOUR_ACCESS_TOKEN
    smug mug token secret: YOUR_TOKEN_SECRET

The access token and token secret are obtained through SmugMug's one-time OAuth 1.0a non-web
authorization flow. The MCP server signs API requests with those credentials and does not open a
browser or perform authorization interactively.

## Tools
The server exposes three tools:
- search_smugmug_docs(query)
- fetch_smugmug_doc(input)
- smugmug_api_call(path, method, params)
