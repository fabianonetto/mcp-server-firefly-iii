#!/usr/bin/env node
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { SSEServerTransport } = require("@modelcontextprotocol/sdk/server/sse.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const axios = require("axios");
const express = require("express");
require("dotenv").config();

// Configuration
const FIREFLY_URL = process.env.FIREFLY_URL;
const FIREFLY_TOKEN = process.env.FIREFLY_TOKEN;
const PORT = process.env.PORT; 

const baseUrl = (FIREFLY_URL || "").replace(/\/+$/, "");
const apiClient = axios.create({
  baseURL: `${baseUrl}/api/v1`,
  headers: {
    Authorization: `Bearer ${FIREFLY_TOKEN}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// --- MCP Server Implementation ---
const mcpServer = new Server(
  { name: "mcp-server-firefly-iii", version: "2.0.0-phase1" },
  { capabilities: { tools: {} } }
);

const TOOLS = [
  // SYSTEM
  {
    name: "get_about",
    description: "Get system information from Firefly III.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/about")).data
  },

  // ACCOUNTS
  {
    name: "list_accounts",
    description: "List all asset accounts and balances.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/accounts", { params: { type: "asset" } })).data
  },
  {
    name: "update_account",
    description: "Update an existing account's details.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The unique ID of the account." },
        name: { type: "string" },
        active: { type: "boolean" },
        notes: { type: "string" }
      },
      required: ["id"]
    },
    handler: async (args) => {
      const { id, ...data } = args;
      return (await apiClient.put(`/accounts/${id}`, data)).data;
    }
  },
  {
    name: "delete_account",
    description: "Permanently delete an account.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"]
    },
    handler: async (args) => {
      await apiClient.delete(`/accounts/${args.id}`);
      return { message: "Account deleted successfully." };
    }
  },

  // TRANSACTIONS
  {
    name: "list_transactions",
    description: "List recent transactions.",
    inputSchema: {
      type: "object",
      properties: { limit: { type: "number", default: 10 } }
    },
    handler: async (args) => (await apiClient.get("/transactions", { params: { limit: args.limit || 10 } })).data
  },
  {
    name: "create_transaction",
    description: "Create a withdrawal, deposit, or transfer.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["withdrawal", "deposit", "transfer"] },
        amount: { type: "string" },
        description: { type: "string" },
        source_name: { type: "string" },
        destination_name: { type: "string" },
        category_name: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        date: { type: "string" }
      },
      required: ["type", "amount", "description", "source_name", "destination_name"]
    },
    handler: async (args) => {
      const payload = {
        error_if_duplicate_hash: false,
        transactions: [{ ...args, date: args.date || new Date().toISOString() }]
      };
      await apiClient.post("/transactions", payload);
      return { message: "Transaction created successfully." };
    }
  },
  {
    name: "update_transaction",
    description: "Update an existing transaction group.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The ID of the transaction group." },
        description: { type: "string" },
        category_name: { type: "string" }
      },
      required: ["id"]
    },
    handler: async (args) => {
      const { id, ...data } = args;
      return (await apiClient.put(`/transactions/${id}`, data)).data;
    }
  },
  {
    name: "delete_transaction",
    description: "Permanently delete a transaction group.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"]
    },
    handler: async (args) => {
      await apiClient.delete(`/transactions/${args.id}`);
      return { message: "Transaction deleted successfully." };
    }
  },

  // SEARCH
  {
    name: "search_transactions",
    description: "Search for transactions using a query string.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query (e.g., 'Starbucks')." },
        limit: { type: "number", default: 10 }
      },
      required: ["query"]
    },
    handler: async (args) => (await apiClient.get("/search/transactions", { params: { query: args.query, limit: args.limit || 10 } })).data
  },

  // BUDGETS
  {
    name: "list_budgets",
    description: "List budgets and their status.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/budgets")).data
  },
  {
    name: "update_budget",
    description: "Update a budget's details.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        active: { type: "boolean" }
      },
      required: ["id"]
    },
    handler: async (args) => {
      const { id, ...data } = args;
      return (await apiClient.put(`/budgets/${id}`, data)).data;
    }
  },
  {
    name: "delete_budget",
    description: "Delete a budget.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"]
    },
    handler: async (args) => {
      await apiClient.delete(`/budgets/${args.id}`);
      return { message: "Budget deleted successfully." };
    }
  },

  // CATEGORIES & TAGS
  {
    name: "list_categories",
    description: "List all transaction categories.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/categories")).data
  },
  {
    name: "create_category",
    description: "Create a new transaction category.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"]
    },
    handler: async (args) => (await apiClient.post("/categories", args)).data
  },
  {
    name: "list_tags",
    description: "List all transaction tags.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/tags")).data
  },
  {
    name: "create_tag",
    description: "Create a new transaction tag.",
    inputSchema: {
      type: "object",
      properties: { tag: { type: "string" } },
      required: ["tag"]
    },
    handler: async (args) => (await apiClient.post("/tags", args)).data
  },

  // BILLS & RECURRING
  {
    name: "list_bills",
    description: "List all defined bills.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/bills")).data
  },
  {
    name: "delete_bill",
    description: "Delete a bill.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"]
    },
    handler: async (args) => {
      await apiClient.delete(`/bills/${args.id}`);
      return { message: "Bill deleted successfully." };
    }
  },
  {
    name: "list_recurring",
    description: "List all recurring transaction rules.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/recurring")).data
  },

  // PIGGY BANKS
  {
    name: "list_piggy_banks",
    description: "List all piggy banks (savings goals).",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/piggy-banks")).data
  },
  {
    name: "update_piggy_bank",
    description: "Add or remove money from a piggy bank.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        amount: { type: "string" }
      },
      required: ["id", "amount"]
    },
    handler: async (args) => {
      await apiClient.post(`/piggy-banks/${args.id}/events`, { amount: args.amount });
      return { message: "Piggy bank updated successfully." };
    }
  },
  {
    name: "delete_piggy_bank",
    description: "Delete a piggy bank.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"]
    },
    handler: async (args) => {
      await apiClient.delete(`/piggy-banks/${args.id}`);
      return { message: "Piggy bank deleted successfully." };
    }
  }
];

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
  if (!FIREFLY_URL || !FIREFLY_TOKEN) {
    console.error("Error: FIREFLY_URL and FIREFLY_TOKEN are required.");
    process.exit(1);
  }

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
        info: { title: "Firefly III AI Bridge", version: "2.0.0-phase1" },
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
