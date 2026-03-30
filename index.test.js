const { mcpServer, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

const mock = new axiosMockAdapter(apiClient);

describe("Firefly III MCP Server v1.2", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("should list all 11 tools (v1.1 + Bills/Recurring)", async () => {
    expect(TOOLS.length).toBe(11);
    const names = TOOLS.map(t => t.name);
    expect(names).toContain("list_bills");
    expect(names).toContain("list_recurring");
  });

  test("list_bills tool should return bills", async () => {
    const mockData = { data: [{ name: "Rent" }] };
    mock.onGet("/bills").reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "list_bills");
    const result = await tool.handler({});
    expect(result).toEqual(mockData);
  });

  test("list_recurring tool should return recurring rules", async () => {
    const mockData = { data: [{ name: "Salary" }] };
    mock.onGet("/recurring").reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "list_recurring");
    const result = await tool.handler({});
    expect(result).toEqual(mockData);
  });
});
