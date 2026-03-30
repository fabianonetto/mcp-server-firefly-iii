const { apiClient } = require("../config.js");

const systemTools = [
  {
    name: "list_currencies",
    description: "List all currencies.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/currencies")).data
  },
  {
    name: "get_currency",
    description: "Get a single currency by code.",
    inputSchema: { type: "object", properties: { code: { type: "string" } }, required: ["code"] },
    handler: async (args) => (await apiClient.get(`/currencies/${args.code}`)).data
  },
  {
    name: "create_currency",
    description: "Store a new currency.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        code: { type: "string" },
        symbol: { type: "string" },
        decimal_places: { type: "number" }
      },
      required: ["name", "code", "symbol"]
    },
    handler: async (args) => (await apiClient.post("/currencies", args)).data
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
  {
    name: "delete_currency",
    description: "Delete a currency.",
    inputSchema: { type: "object", properties: { code: { type: "string" } }, required: ["code"] },
    handler: async (args) => {
      await apiClient.delete(`/currencies/${args.code}`);
      return { message: "Currency deleted successfully." };
    }
  },
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
      properties: { name: { type: "string" }, data: { type: "string" } },
      required: ["name", "data"]
    },
    handler: async (args) => (await apiClient.put(`/preferences/${args.name}`, { data: args.data })).data
  }
];

module.exports = systemTools;
