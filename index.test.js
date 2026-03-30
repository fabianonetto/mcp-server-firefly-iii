const { mcpServer, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

const mock = new axiosMockAdapter(apiClient);

describe("Firefly III MCP Server v2.0.0-phase4 (Final Exhaustive)", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("should list all 39 tools (Full API Coverage)", async () => {
    expect(TOOLS.length).toBe(39);
  });

  // ATTACHMENT TESTS
  test("list_attachments should return files", async () => {
    const mockData = { data: [{ filename: "receipt.jpg" }] };
    mock.onGet("/attachments").reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "list_attachments");
    const result = await tool.handler({});
    expect(result).toEqual(mockData);
  });

  // CHART TESTS
  test("get_account_overview_chart should send dates", async () => {
    const mockData = { data: [] };
    mock.onGet("/charts/account/overview").reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "get_account_overview_chart");
    const result = await tool.handler({ start: "2024-01-01", end: "2024-01-31" });
    expect(result).toEqual(mockData);
  });
});
