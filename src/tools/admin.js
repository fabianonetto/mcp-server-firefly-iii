const { apiClient } = require("../config.js");

const adminTools = [
  {
    name: "trigger_export",
    description: "Trigger a data export from Firefly III.",
    inputSchema: {
      type: "object",
      properties: {
        start: { type: "string" },
        end: { type: "string" },
        type: { type: "string", enum: ["csv", "json"], default: "csv" }
      },
      required: ["start", "end"]
    },
    handler: async (args) => {
      // Endpoint for export is usually custom or requires specific setup
      // We map this to the most common Firefly III export pattern
      await apiClient.post("/export/transactions", args);
      return { message: "Data export initiated successfully." };
    }
  }
];

module.exports = adminTools;
