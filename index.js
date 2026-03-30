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
  { name: "mcp-server-firefly-iii", version: "2.0.0-phase3" },
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

  // RULES & AUTOMATION
  {
    name: "list_rules",
    description: "List all automation rules.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/rules")).data
  },
  {
    name: "get_rule",
    description: "Get a single rule by ID.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => (await apiClient.get(`/rules/${args.id}`)).data
  },
  {
    name: "create_rule",
    description: "Store a new automation rule.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        trigger: { type: "string", enum: ["store-journal", "update-journal"] },
        rule_group_id: { type: "string" },
        active: { type: "boolean", default: true }
      },
      required: ["title", "trigger", "rule_group_id"]
    },
    handler: async (args) => (await apiClient.post("/rules", args)).data
  },
  {
    name: "update_rule",
    description: "Update an existing automation rule.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        active: { type: "boolean" }
      },
      required: ["id"]
    },
    handler: async (args) => {
      const { id, ...data } = args;
      return (await apiClient.put(`/rules/${id}`, data)).data;
    }
  },
  {
    name: "delete_rule",
    description: "Delete an automation rule.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"]
    },
    handler: async (args) => {
      await apiClient.delete(`/rules/${args.id}`);
      return { message: "Rule deleted successfully." };
    }
  },
  {
    name: "list_rule_groups",
    description: "List all rule groups.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/rule-groups")).data
  },
  {
    name: "get_rule_group",
    description: "Get a single rule group by ID.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => (await apiClient.get(`/rule-groups/${args.id}`)).data
  },
  {
    name: "trigger_rule_group",
    description: "Manually trigger all rules in a group.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"]
    },
    handler: async (args) => {
      await apiClient.post(`/rule-groups/${args.id}/trigger`);
      return { message: "Rule group triggered successfully." };
    }
  },

  // WEBHOOKS
  {
    name: "list_webhooks",
    description: "List all external webhooks.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/webhooks")).data
  },
  {
    name: "create_webhook",
    description: "Create a new webhook.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        url: { type: "string" },
        trigger: { type: "string", enum: ["STORE_TRANSACTION", "UPDATE_TRANSACTION", "DESTROY_TRANSACTION"] }
      },
      required: ["title", "url", "trigger"]
    },
    handler: async (args) => (await apiClient.post("/webhooks", args)).data
  },
  {
    name: "delete_webhook",
    description: "Delete a webhook.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"]
    },
    handler: async (args) => {
      await apiClient.delete(`/webhooks/${args.id}`);
      return { message: "Webhook deleted successfully." };
    }
  },

  // CURRENCIES
  {
    name: "list_currencies",
    description: "List all currencies.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/currencies")).data
  },
  {
    name: "update_currency",
    description: "Update an existing currency.",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string" },
        enabled: { type: "boolean" }
      },
      required: ["code"]
    },
    handler: async (args) => {
      const { code, ...data } = args;
      return (await apiClient.put(`/currencies/${code}`, data)).data;
    }
  },

  // PREFERENCES
  {
    name: "list_preferences",
    description: "List all user preferences.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/preferences")).data
  },
  {
    name: "get_preference",
    description: "Get a specific preference.",
    inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
    handler: async (args) => (await apiClient.get(`/preferences/${args.name}`)).data
  },
  {
    name: "update_preference",
    description: "Update a specific preference.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        data: { type: "string" }
      },
      required: ["name", "data"]
    },
    handler: async (args) => (await apiClient.put(`/preferences/${args.name}`, { data: args.data })).data
  },

  // ACCOUNTS
  {
    name: "list_accounts",
    description: "List all asset accounts.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/accounts", { params: { type: "asset" } })).data
  },
  {
    name: "update_account",
    description: "Update an existing account.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, name: { type: "string" } },
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
      properties: { id: { type: "string" }, description: { type: "string" } },
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
    description: "Search for transactions.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "number", default: 10 }
      },
      required: ["query"]
    },
    handler: async (args) => (await apiClient.get("/search/transactions", { params: { query: args.query, limit: args.limit || 10 } })).data
  },

  // BUDGETS
  {
    name: "list_budgets",
    description: "List budgets.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/budgets")).data
  },
  {
    name: "update_budget",
    description: "Update a budget.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, name: { type: "string" } },
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
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => {
      await apiClient.delete(`/budgets/${args.id}`);
      return { message: "Budget deleted successfully." };
    }
  },

  // CATEGORIES & TAGS
  {
    name: "list_categories",
    description: "List all categories.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/categories")).data
  },
  {
    name: "create_category",
    description: "Create a new category.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"]
    },
    handler: async (args) => (await apiClient.post("/categories", args)).data
  },
  {
    name: "list_tags",
    description: "List all tags.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/tags")).data
  },

  // BILLS
  {
    name: "list_bills",
    description: "List all bills.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/bills")).data
  },

  // PIGGY BANKS
  {
    name: "list_piggy_banks",
    description: "List all piggy banks.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/piggy-banks")).data
  },
  {
    name: "update_piggy_bank",
    description: "Add/remove money from goal.",
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
        info: { title: "Firefly III AI Bridge", version: "2.0.0-phase3" },
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
