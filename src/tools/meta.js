const { apiClient } = require("../config.js");

const metaTools = [
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
  }
];

module.exports = metaTools;
