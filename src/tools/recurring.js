const { apiClient } = require("../config.js");

const recurringTools = [
  {
    name: "list_recurring",
    description: "List all recurring transaction rules.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/recurring")).data
  },
  {
    name: "get_recurring",
    description: "Get a single recurring transaction by ID.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => (await apiClient.get(`/recurring/${args.id}`)).data
  },
  {
    name: "create_recurring",
    description: "Create a new recurring transaction rule.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        type: { type: "string", enum: ["withdrawal", "deposit", "transfer"] },
        amount: { type: "string" },
        repeat_freq: { type: "string", enum: ["daily", "weekly", "monthly", "yearly"] },
        source_name: { type: "string" },
        destination_name: { type: "string" }
      },
      required: ["name", "type", "amount", "repeat_freq", "source_name", "destination_name"]
    },
    handler: async (args) => (await apiClient.post("/recurring", args)).data
  },
  {
    name: "update_recurring",
    description: "Update an existing recurring transaction.",
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
      return (await apiClient.put(`/recurring/${id}`, data)).data;
    }
  },
  {
    name: "delete_recurring",
    description: "Delete a recurring transaction rule.",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    handler: async (args) => {
      await apiClient.delete(`/recurring/${args.id}`);
      return { message: "Recurring transaction deleted successfully." };
    }
  }
];

module.exports = recurringTools;
