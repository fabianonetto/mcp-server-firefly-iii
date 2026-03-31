const { mcpServer, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

// Set test environment
process.env.NODE_ENV = "test";

const mock = new axiosMockAdapter(apiClient);

describe("Firefly III MCP Server v3.0.0-phase3 (Insights)", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("should list all 65 tools (Exhaustive v3.0)", async () => {
    expect(TOOLS.length).toBe(65);
  });

  // INSIGHT TESTS
  test("get_net_worth_summary should return data", async () => {
    mock.onGet("/summary/basic").reply(200, { data: [] });
    const tool = TOOLS.find(t => t.name === "get_net_worth_summary");
    const result = await tool.handler({});
    expect(result.data).toEqual([]);
  });

  test("get_net_worth_summary should pass start and end parameters", async () => {
    mock.onGet("/summary/basic").reply(200, { data: [] });
    const tool = TOOLS.find(t => t.name === "get_net_worth_summary");
    await tool.handler({ start: "2023-01-01", end: "2023-12-31" });
    
    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].params).toEqual({ start: "2023-01-01", end: "2023-12-31" });
    expect(mock.history.get[0].url).toBe("/summary/basic");
  });

  // ADMIN TESTS
  test("trigger_export should post correctly", async () => {
    mock.onPost("/export/transactions").reply(200, {});
    const tool = TOOLS.find(t => t.name === "trigger_export");
    const result = await tool.handler({ start: "2024-01-01", end: "2024-12-31" });
    expect(result.message).toContain("successfully");
  });
});
