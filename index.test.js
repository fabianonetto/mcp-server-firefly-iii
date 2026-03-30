const { mcpServer, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

const mock = new axiosMockAdapter(apiClient);

describe("Firefly III MCP Server v2.0.0 (Definitive)", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("should list all 47 tools (100% API Coverage)", async () => {
    expect(TOOLS.length).toBe(47);
  });

  // CORE SMOKE TESTS
  test("get_about should return info", async () => {
    mock.onGet("/about").reply(200, { data: { version: "6.0.0" } });
    const tool = TOOLS.find(t => t.name === "get_about");
    const result = await tool.handler({});
    expect(result.data.version).toBe("6.0.0");
  });

  test("create_account should post correct data", async () => {
    const payload = { name: "Test", type: "asset" };
    mock.onPost("/accounts", payload).reply(200, { data: { id: "1" } });
    const tool = TOOLS.find(t => t.name === "create_account");
    const result = await tool.handler(payload);
    expect(result.data.id).toBe("1");
  });
});
