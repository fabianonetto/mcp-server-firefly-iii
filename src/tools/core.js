const { apiClient } = require("../config.js");

const coreTools = [
  {
    name: "get_about",
    description: "Get system information from Firefly III.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => (await apiClient.get("/about")).data
  }
];

module.exports = coreTools;
