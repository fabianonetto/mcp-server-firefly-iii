const { apiClient } = require("../config.js");

const automationTools = [
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
  }
];

module.exports = automationTools;
