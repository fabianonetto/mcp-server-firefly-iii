const { apiClient } = require("../config.js");

const insightsTools = [
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

module.exports = insightsTools;
