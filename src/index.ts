#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { fetchSmugMugDocPage, searchSmugMugDocs } from "./docs.js";
import { loadSmugMugConfig } from "./secrets.js";

const server = new Server(
  {
    name: "smugmug-docs-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_smugmug_docs",
      description: "Search the bundled SmugMug API documentation catalog.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query such as album, image, auth, or user."
          }
        },
        required: ["query"]
      }
    },
    {
      name: "fetch_smugmug_doc",
      description: "Fetch content from a SmugMug docs page or a known docs path.",
      inputSchema: {
        type: "object",
        properties: {
          input: {
            type: "string",
            description: "A full URL or a docs path such as tutorial/api-key.html."
          }
        },
        required: ["input"]
      }
    },
    {
      name: "smugmug_api_call",
      description: "Call the live SmugMug API using credentials from secrets.txt when available.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "The API path such as /api/v2!authschema or /api/v2/user"
          },
          method: {
            type: "string",
            description: "HTTP method to use (GET by default)."
          },
          params: {
            type: "object",
            description: "Optional query parameters to include."
          }
        },
        required: ["path"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments ?? {};

  if (toolName === "search_smugmug_docs") {
    const query = typeof args.query === "string" ? args.query : "";
    const results = searchSmugMugDocs(query);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }

  if (toolName === "fetch_smugmug_doc") {
    const input = typeof args.input === "string" ? args.input : "";
    try {
      const result = await fetchSmugMugDocPage(input);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching docs: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  if (toolName === "smugmug_api_call") {
    const config = loadSmugMugConfig();
    const path = typeof args.path === "string" ? args.path : "";
    const method = typeof args.method === "string" ? args.method.toUpperCase() : "GET";
    const params = typeof args.params === "object" && args.params ? args.params : {};

    if (!config.apiKey || !config.apiSecret) {
      return {
        content: [
          {
            type: "text",
            text: "SmugMug credentials were not found. Add the API key and secret to secrets.txt in the working directory, or set SMUGMUG_SECRETS_FILE / SMUGMUG_WORKSPACE_ROOT to locate the file, or set SMUGMUG_API_KEY and SMUGMUG_API_SECRET directly."
          }
        ],
        isError: true
      };
    }

    try {
      const url = new URL(`https://api.smugmug.com${path.startsWith("/") ? path : `/${path}`}`);
      Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });

      const response = await fetch(url, {
        method,
        headers: {
          "Accept": "application/json",
          "X-SmugMug-API-Key": config.apiKey,
          "X-SmugMug-API-Secret": config.apiSecret
        }
      });

      const text = await response.text();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: response.status,
              url: url.toString(),
              body: text
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error calling SmugMug API: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  throw new Error(`Unknown tool: ${toolName}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SmugMug docs MCP server running");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
