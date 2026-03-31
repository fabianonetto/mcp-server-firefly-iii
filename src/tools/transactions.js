const { apiClient } = require("../config.js");

const transactionsTools = [
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
    description: "Create a simple withdrawal, deposit, or transfer.",
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
    name: "create_split_transaction",
    description: "Create a single transaction divided into multiple splits (e.g., one receipt with different categories).",
    inputSchema: {
      type: "object",
      properties: {
        group_title: { type: "string", description: "Optional title for the transaction group." },
        splits: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["withdrawal", "deposit", "transfer"] },
              amount: { type: "string" },
              description: { type: "string" },
              source_name: { type: "string" },
              destination_name: { type: "string" },
              category_name: { type: "string" },
              tags: { type: "array", items: { type: "string" } }
            },
            required: ["type", "amount", "description", "source_name", "destination_name"]
          }
        }
      },
      required: ["splits"]
    },
    handler: async (args) => {
      const payload = {
        group_title: args.group_title,
        transactions: args.splits.map(s => ({ ...s, date: new Date().toISOString() }))
      };
      await apiClient.post("/transactions", payload);
      return { message: "Split transaction created successfully." };
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
  {
    name: "search_transactions",
    description: "Search for transactions.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" }, limit: { type: "number", default: 10 } },
      required: ["query"]
    },
    handler: async (args) => (await apiClient.get("/search/transactions", { params: { query: args.query, limit: args.limit || 10 } })).data
  }
];

module.exports = transactionsTools;
