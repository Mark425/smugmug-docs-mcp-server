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
No clone required — the package builds itself on install and exposes a binary:

    npx --yes --package=git+https://github.com/Mark425/smugmug-docs-mcp-server.git#REVISION smugmug-docs-mcp-server

npx re-clones and rebuilds on every launch (~1 minute), which can exceed MCP client startup
timeouts. For regular use install it once and run the binary directly:

    npm install -g git+https://github.com/Mark425/smugmug-docs-mcp-server.git#REVISION
    smugmug-docs-mcp-server

## Credentials
Resolved in this order:
1. SMUGMUG_API_KEY and SMUGMUG_API_SECRET
2. the file named by SMUGMUG_SECRETS_FILE
3. secrets.txt inside SMUGMUG_WORKSPACE_ROOT
4. secrets.txt in the current working directory

Prefer SMUGMUG_SECRETS_FILE in MCP client configs so credentials stay out of committed JSON.

## Tools
The server exposes three tools:
- search_smugmug_docs(query)
- fetch_smugmug_doc(input)
- smugmug_api_call(path, method, params)
