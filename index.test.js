const { mcpServer, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

const mock = new axiosMockAdapter(apiClient);

describe("Firefly III MCP Server v2.0.0-phase2 (Metadata)", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("should list all 30 tools (Exhaustive Metadata Phase 2)", async () => {
    expect(TOOLS.length).toBe(30);
  });

  // CURRENCY TESTS
  test("list_currencies should return all currencies", async () => {
    const mockData = { data: [{ code: "USD" }] };
    mock.onGet("/currencies").reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "list_currencies");
    const result = await tool.handler({});
    expect(result).toEqual(mockData);
  });

  test("create_currency should post new currency", async () => {
    const mockData = { data: { code: "EUR" } };
    mock.onPost("/currencies").reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "create_currency");
    const result = await tool.handler({ name: "Euro", code: "EUR", symbol: "€" });
    expect(result.data.code).toBe("EUR");
  });

  test("delete_currency should send DELETE", async () => {
    mock.onDelete("/currencies/EUR").reply(204);
    const tool = TOOLS.find(t => t.name === "delete_currency");
    const result = await tool.handler({ code: "EUR" });
    expect(result.message).toContain("successfully");
  });

  // PREFERENCE TESTS
  test("update_preference should send PUT", async () => {
    mock.onPut("/preferences/view.index").reply(200, { data: { name: "view.index" } });
    const tool = TOOLS.find(t => t.name === "update_preference");
    const result = await tool.handler({ name: "view.index", data: "dashboard" });
    expect(result.data.name).toBe("view.index");
  });
});
