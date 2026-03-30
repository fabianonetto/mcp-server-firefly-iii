const { apiClient } = require("../config.js");

const groupsTools = [
  {
    name: "list_object_groups",
    description: "List all object groups (used for organizing accounts/piggy banks).",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/object-groups")).data
  },
  {
    name: "create_object_group",
    description: "Create a new object group.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        order: { type: "number" }
      },
      required: ["title"]
    },
    handler: async (args) => (await apiClient.post("/object-groups", args)).data
  }
];

module.exports = groupsTools;
