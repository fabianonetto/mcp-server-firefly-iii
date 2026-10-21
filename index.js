#!/usr/bin/env node
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { SSEServerTransport } = require("@modelcontextprotocol/sdk/server/sse.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  isInitializeRequest,
} = require("@modelcontextprotocol/sdk/types.js");
const { randomUUID } = require("crypto");
const express = require("express");
const { FIREFLY_URL, FIREFLY_TOKEN, PORT, apiClient } = require("./src/config.js");

// Import modular tools
const coreTools = require("./src/tools/core.js");
const accountsTools = require("./src/tools/accounts.js");
const transactionsTools = require("./src/tools/transactions.js");
const budgetsTools = require("./src/tools/budgets.js");
const automationTools = require("./src/tools/automation.js");
const systemTools = require("./src/tools/system.js");
const insightsTools = require("./src/tools/insights.js");
const metaTools = require("./src/tools/meta.js");
const billsTools = require("./src/tools/bills.js");
const groupsTools = require("./src/tools/groups.js");
const recurringTools = require("./src/tools/recurring.js");
const adminTools = require("./src/tools/admin.js");

// Registry
const TOOLS = [
  ...coreTools,
  ...accountsTools,
  ...transactionsTools,
  ...budgetsTools,
  ...automationTools,
  ...systemTools,
  ...insightsTools,
  ...metaTools,
  ...billsTools,
  ...groupsTools,
  ...recurringTools,
  ...adminTools
];

// O(1) lookup map — avoids linear scan on every tool call
const TOOL_MAP = new Map(TOOLS.map(t => [t.name, t]));

// --- MCP Server Factory ---
// Creates a fresh Server instance per session/connection to avoid collisions
function createMcpServer() {
  const server = new Server(
    { name: "mcp-server-firefly-iii", version: "3.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map(({ handler, ...tool }) => tool)
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = TOOL_MAP.get(request.params.name);
    try {
      if (!tool) throw new Error(`Tool not found: ${request.params.name}`);
      const result = await tool.handler(request.params.arguments || {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error) {
      // Sanitize error: extract message/errors fields only — avoid leaking raw stack traces
      const errData = error.response?.data;
      const message = errData?.message || (errData?.errors ? JSON.stringify(errData.errors) : null) || error.message;
      return { isError: true, content: [{ type: "text", text: String(message) }] };
    }
  });

  return server;
}

// Default instance for backward compatibility and stdio mode
const mcpServer = createMcpServer();

// --- Universal Web API (Express) ---
function createApp() {
  const app = express();
  app.use(express.json());

  // Store active transports by session ID for multi-session SSE & Streamable HTTP
  const transports = {};

  // --- Streamable HTTP Transport (MCP specification) ---
  app.all("/mcp", async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id, last-event-id, authorization");
    res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    try {
      if (req.method === "POST") {
        const accept = req.headers["accept"];
        if (!accept || !accept.includes("text/event-stream") || !accept.includes("application/json")) {
          let found = false;
          if (req.rawHeaders) {
            for (let i = 0; i < req.rawHeaders.length; i += 2) {
              if (req.rawHeaders[i].toLowerCase() === "accept") {
                req.rawHeaders[i + 1] = "application/json, text/event-stream";
                found = true;
              }
            }
            if (!found) {
              req.rawHeaders.push("accept", "application/json, text/event-stream");
            }
          }
          req.headers["accept"] = "application/json, text/event-stream";
        }
      }

      const sessionId = req.headers["mcp-session-id"] || req.query.sessionId;
      let transport;

      if (sessionId && transports[sessionId]) {
        const existingTransport = transports[sessionId];
        if (existingTransport instanceof StreamableHTTPServerTransport) {
          transport = existingTransport;
        } else {
          res.status(400).json({
            jsonrpc: "2.0",
            error: {
              code: -32000,
              message: "Bad Request: Session exists but uses a different transport protocol"
            },
            id: null
          });
          return;
        }
      } else if (!sessionId && req.method === "POST" && isInitializeRequest(req.body)) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          enableJsonResponse: true,
          onsessioninitialized: (sid) => {
            transports[sid] = transport;
          }
        });

        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && transports[sid]) {
            delete transports[sid];
          }
        };

        const server = createMcpServer();
        await server.connect(transport);
      } else {
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Bad Request: No valid session ID provided"
          },
          id: null
        });
        return;
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling Streamable HTTP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error"
          },
          id: null
        });
      }
    }
  });

  // --- Legacy SSE Transport (protocol version 2024-11-05) ---
  app.get("/sse", async (req, res) => {
    try {
      const transport = new SSEServerTransport("/messages", res);
      transports[transport.sessionId] = transport;

      transport.onclose = () => {
        delete transports[transport.sessionId];
      };
      res.on("close", () => {
        delete transports[transport.sessionId];
      });

      const server = createMcpServer();
      await server.connect(transport);
    } catch (err) {
      console.error("Error in GET /sse:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to establish SSE connection" });
      }
    }
  });

  app.post("/messages", async (req, res) => {
    try {
      const sessionId = req.query.sessionId;
      let transport = sessionId ? transports[sessionId] : undefined;
      if (!transport && !sessionId) {
        const sseTransports = Object.values(transports).filter(t => t instanceof SSEServerTransport);
        if (sseTransports.length === 1) {
          transport = sseTransports[0];
        }
      }

      if (!transport) {
        res.status(400).send("No transport found for sessionId");
        return;
      }

      if (!(transport instanceof SSEServerTransport)) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Bad Request: Session exists but uses a different transport protocol"
          },
          id: null
        });
        return;
      }

      await transport.handlePostMessage(req, res, req.body);
    } catch (err) {
      console.error("Error in POST /messages:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to handle message" });
      }
    }
  });

  // Optional API key auth for /api/* routes (set SERVER_API_KEY env var to enable)
  if (process.env.SERVER_API_KEY) {
    app.use("/api", (req, res, next) => {
      if (req.headers["x-api-key"] !== process.env.SERVER_API_KEY) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      next();
    });
  }

  TOOLS.forEach(tool => {
    app.all(`/api/${tool.name}`, async (req, res) => {
      try {
        const result = await tool.handler(req.method === 'GET' ? req.query : req.body);
        res.json(result);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  });

  app.get("/openapi.json", (req, res) => {
    const host = req.get('host');
    const spec = {
      openapi: "3.0.0",
      info: { title: "Firefly III AI Bridge", version: "3.0.0" },
      servers: [{ url: `http://${host}/api` }],
      paths: {}
    };
    TOOLS.forEach(t => {
      spec.paths[`/${t.name}`] = {
        post: {
          operationId: t.name,
          summary: t.description,
          requestBody: { content: { "application/json": { schema: t.inputSchema } } },
          responses: { "200": { description: "Success" } }
        }
      };
    });
    res.json(spec);
  });

  return { app, transports };
}

async function runServer() {
  if (PORT) {
    const { app, transports } = createApp();

    const server = app.listen(PORT, () => {
      console.error(`Universal AI Bridge running at http://localhost:${PORT}`);
      console.error(`- Streamable HTTP: http://localhost:${PORT}/mcp`);
      console.error(`- Legacy SSE:      http://localhost:${PORT}/sse`);
    });

    const cleanup = async () => {
      for (const sid in transports) {
        try {
          await transports[sid].close();
        } catch (_) {}
      }
      server.close();
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  } else {
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.error("Firefly III MCP Server running on stdio");
  }
}

if (require.main === module) {
  runServer().catch(console.error);
}

module.exports = { mcpServer, createMcpServer, createApp, TOOLS, apiClient };