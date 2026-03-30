const { mcpServer, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

const mock = new axiosMockAdapter(apiClient);

describe("Firefly III MCP Server v1.3", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("should list all 12 tools", async () => {
    expect(TOOLS.length).toBe(12);
    expect(TOOLS.map(t => t.name)).toContain("search_transactions");
  });

  test("search_transactions tool should return search results", async () => {
    const mockData = { data: [{ description: "Starbucks" }] };
    mock.onGet("/search/transactions", { params: { query: "Starbucks", limit: 10 } }).reply(200, mockData);
    
    const tool = TOOLS.find(t => t.name === "search_transactions");
    const result = await tool.handler({ query: "Starbucks" });
    expect(result).toEqual(mockData);
  });
});
