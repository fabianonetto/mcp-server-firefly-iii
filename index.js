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
  { name: "mcp-server-firefly-iii", version: "3.0.0-phase1" },
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

  // TRANSACTION LINKING (v3.0)
  {
    name: "list_link_types",
    description: "List all available transaction link types (e.g., reimbursement).",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/link-types")).data
  },
  {
    name: "link_transactions",
    description: "Create a link between two transactions.",
    inputSchema: {
      type: "object",
      properties: {
        link_type_id: { type: "string" },
        inward_id: { type: "string" },
        outward_id: { type: "string" },
        notes: { type: "string" }
      },
      required: ["link_type_id", "inward_id", "outward_id"]
    },
    handler: async (args) => (await apiClient.post("/transaction-links", args)).data
  },
  {
    name: "list_transaction_links",
    description: "List links for a specific transaction.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => (await apiClient.get(`/transactions/${args.id}/links`)).data
  },

  // BUDGET LIMITS (v3.0)
  {
    name: "list_budget_limits",
    description: "List monetary limits for a budget.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => (await apiClient.get(`/budgets/${args.id}/limits`)).data
  },
  {
    name: "create_budget_limit",
    description: "Set a monetary limit for a budget period.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Budget ID" },
        amount: { type: "string" },
        start: { type: "string", description: "YYYY-MM-DD" },
        end: { type: "string", description: "YYYY-MM-DD" },
        currency_code: { type: "string" }
      },
      required: ["id", "amount", "start", "end"]
    },
    handler: async (args) => {
      const { id, ...data } = args;
      return (await apiClient.post(`/budgets/${id}/limits`, data)).data;
    }
  },
  {
    name: "delete_budget_limit",
    description: "Delete a budget limit.",
    inputSchema: { type: "object", properties: { budget_id: { type: "string" }, limit_id: { type: "string" } }, required: ["budget_id", "limit_id"] },
    handler: async (args) => {
      await apiClient.delete(`/budgets/${args.budget_id}/limits/${args.limit_id}`);
      return { message: "Budget limit deleted successfully." };
    }
  },

  // ACCOUNTS
  {
    name: "list_accounts",
    description: "List all accounts.",
    inputSchema: { type: "object", properties: { type: { type: "string", enum: ["asset", "expense", "revenue", "liabilities"] } } },
    handler: async (args) => (await apiClient.get("/accounts", { params: { type: args.type || "asset" } })).data
  },
  {
    name: "get_account",
    description: "Get a single account by ID.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => (await apiClient.get(`/accounts/${args.id}`)).data
  },
  {
    name: "create_account",
    description: "Create a new account.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        type: { type: "string", enum: ["asset", "expense", "revenue", "liabilities"] },
        currency_code: { type: "string" },
        opening_balance: { type: "string" }
      },
      required: ["name", "type"]
    },
    handler: async (args) => (await apiClient.post("/accounts", args)).data
  },
  {
    name: "update_account",
    description: "Update an existing account.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, name: { type: "string" }, active: { type: "boolean" } },
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
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => {
      await apiClient.delete(`/accounts/${args.id}`);
      return { message: "Account deleted successfully." };
    }
  },

  // TRANSACTIONS
  {
    name: "list_transactions",
    description: "List recent transactions.",
    inputSchema: { type: "object", properties: { limit: { type: "number", default: 10 } } },
    handler: async (args) => (await apiClient.get("/transactions", { params: { limit: args.limit || 10 } })).data
  },
  {
    name: "get_transaction",
    description: "Get a single transaction by ID.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => (await apiClient.get(`/transactions/${args.id}`)).data
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
    description: "Permanently delete a transaction.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
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
      properties: { query: { type: "string" }, limit: { type: "number", default: 10 } },
      required: ["query"]
    },
    handler: async (args) => (await apiClient.get("/search/transactions", { params: { query: args.query, limit: args.limit || 10 } })).data
  },

  // BUDGETS
  {
    name: "list_budgets",
    description: "List all budgets.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/budgets")).data
  },
  {
    name: "get_budget",
    description: "Get a single budget by ID.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => (await apiClient.get(`/budgets/${args.id}`)).data
  },
  {
    name: "create_budget",
    description: "Create a new budget.",
    inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
    handler: async (args) => (await apiClient.post("/budgets", args)).data
  },
  {
    name: "update_budget",
    description: "Update a budget.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, name: { type: "string" }, active: { type: "boolean" } },
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
    inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
    handler: async (args) => (await apiClient.post("/categories", args)).data
  },
  {
    name: "list_tags",
    description: "List all tags.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/tags")).data
  },
  {
    name: "create_tag",
    description: "Create a new tag.",
    inputSchema: { type: "object", properties: { tag: { type: "string" } }, required: ["tag"] },
    handler: async (args) => (await apiClient.post("/tags", args)).data
  },

  // BILLS
  {
    name: "list_bills",
    description: "List all bills.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/bills")).data
  },
  {
    name: "create_bill",
    description: "Create a new bill.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        amount_min: { type: "string" },
        amount_max: { type: "string" },
        date: { type: "string" },
        repeat_freq: { type: "string" }
      },
      required: ["name", "amount_min", "amount_max", "date", "repeat_freq"]
    },
    handler: async (args) => (await apiClient.post("/bills", args)).data
  },
  {
    name: "delete_bill",
    description: "Delete a bill.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => {
      await apiClient.delete(`/bills/${args.id}`);
      return { message: "Bill deleted successfully." };
    }
  },

  // PIGGY BANKS
  {
    name: "list_piggy_banks",
    description: "List all piggy banks.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/piggy-banks")).data
  },
  {
    name: "create_piggy_bank",
    description: "Create a new piggy bank.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        target_amount: { type: "string" },
        account_id: { type: "string" }
      },
      required: ["name", "target_amount", "account_id"]
    },
    handler: async (args) => (await apiClient.post("/piggy-banks", args)).data
  },
  {
    name: "update_piggy_bank",
    description: "Add/remove money from goal.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, amount: { type: "string" } },
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
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => {
      await apiClient.delete(`/piggy-banks/${args.id}`);
      return { message: "Piggy bank deleted successfully." };
    }
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
    description: "Get a single rule.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => (await apiClient.get(`/rules/${args.id}`)).data
  },
  {
    name: "create_rule",
    description: "Store a new rule.",
    inputSchema: {
      type: "object",
      properties: { title: { type: "string" }, trigger: { type: "string" }, rule_group_id: { type: "string" } },
      required: ["title", "trigger", "rule_group_id"]
    },
    handler: async (args) => (await apiClient.post("/rules", args)).data
  },
  {
    name: "update_rule",
    description: "Update a rule.",
    inputSchema: { type: "object", properties: { id: { type: "string" }, title: { type: "string" } }, required: ["id"] },
    handler: async (args) => {
      const { id, ...data } = args;
      return (await apiClient.put(`/rules/${id}`, data)).data;
    }
  },
  {
    name: "delete_rule",
    description: "Delete a rule.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
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
    description: "Get a single rule group.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => (await apiClient.get(`/rule-groups/${args.id}`)).data
  },
  {
    name: "trigger_rule_group",
    description: "Manually run rule group.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => {
      await apiClient.post(`/rule-groups/${args.id}/trigger`);
      return { message: "Rule group triggered successfully." };
    }
  },

  // WEBHOOKS
  {
    name: "list_webhooks",
    description: "List webhooks.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/webhooks")).data
  },
  {
    name: "create_webhook",
    description: "Create a webhook.",
    inputSchema: {
      type: "object",
      properties: { title: { type: "string" }, url: { type: "string" }, trigger: { type: "string" } },
      required: ["title", "url", "trigger"]
    },
    handler: async (args) => (await apiClient.post("/webhooks", args)).data
  },
  {
    name: "delete_webhook",
    description: "Delete a webhook.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => {
      await apiClient.delete(`/webhooks/${args.id}`);
      return { message: "Webhook deleted successfully." };
    }
  },

  // CURRENCIES & PREFERENCES
  {
    name: "list_currencies",
    description: "List currencies.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/currencies")).data
  },
  {
    name: "update_currency",
    description: "Update currency.",
    inputSchema: { type: "object", properties: { code: { type: "string" }, enabled: { type: "boolean" } }, required: ["code"] },
    handler: async (args) => {
      const { code, ...data } = args;
      return (await apiClient.put(`/currencies/${code}`, data)).data;
    }
  },
  {
    name: "list_preferences",
    description: "List preferences.",
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
    description: "Update preference.",
    inputSchema: { type: "object", properties: { name: { type: "string" }, data: { type: "string" } }, required: ["name", "data"] },
    handler: async (args) => (await apiClient.put(`/preferences/${args.name}`, { data: args.data })).data
  },

  // ATTACHMENTS & CHARTS
  {
    name: "list_attachments",
    description: "List all files.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/attachments")).data
  },
  {
    name: "get_attachment",
    description: "Get attachment metadata.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => (await apiClient.get(`/attachments/${args.id}`)).data
  },
  {
    name: "upload_attachment",
    description: "Upload a file.",
    inputSchema: {
      type: "object",
      properties: { filename: { type: "string" }, attachable_type: { type: "string" }, attachable_id: { type: "string" }, content: { type: "string" } },
      required: ["filename", "attachable_type", "attachable_id", "content"]
    },
    handler: async (args) => (await apiClient.post("/attachments", args)).data
  },
  {
    name: "delete_attachment",
    description: "Delete an attachment.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => {
      await apiClient.delete(`/attachments/${args.id}`);
      return { message: "Attachment deleted successfully." };
    }
  },
  {
    name: "get_account_overview_chart",
    description: "Get balance trend charts.",
    inputSchema: { type: "object", properties: { start: { type: "string" }, end: { type: "string" } }, required: ["start", "end"] },
    handler: async (args) => (await apiClient.get("/charts/account/overview", { params: args })).data
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
