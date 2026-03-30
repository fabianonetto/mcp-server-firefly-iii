#!/usr/bin/env node
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { SSEServerTransport } = require("@modelcontextprotocol/sdk/server/sse.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
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

// --- MCP Server Implementation ---
const mcpServer = new Server(
  { name: "mcp-server-firefly-iii", version: "3.0.0" },
  { capabilities: { tools: {} } }
);

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ handler, ...tool }) => tool)
}));

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = TOOLS.find(t => t.name === request.params.name);
  if (!tool) throw new Error(`Tool not found: ${request.params.name}`);
  
  try {
    const result = await tool.handler(request.params.arguments || {});
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { isError: true, content: [{ type: "text", text: error.response ? JSON.stringify(error.response.data) : error.message }] };
  }
});

// --- Universal Web API (Express) ---
async function runServer() {
  if (PORT) {
    const app = express();
    app.use(express.json());

    let transport;
    app.get("/sse", async (req, res) => {
      transport = new SSEServerTransport("/messages", res);
      await mcpServer.connect(transport);
    });
    app.post("/messages", async (req, res) => {
      if (transport) await transport.handlePostMessage(req, res);
    });

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

    app.listen(PORT, () => {
      console.error(`Universal AI Bridge running at http://localhost:${PORT}`);
    });
  } else {
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.error("Firefly III MCP Server running on stdio");
  }
}

if (require.main === module) {
  runServer().catch(console.error);
}

module.exports = { mcpServer, TOOLS, apiClient };
