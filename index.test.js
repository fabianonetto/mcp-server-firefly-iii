const { mcpServer, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

const mock = new axiosMockAdapter(apiClient);

describe("Firefly III MCP Server v1.4", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("should list all 14 tools", async () => {
    expect(TOOLS.length).toBe(14);
    const names = TOOLS.map(t => t.name);
    expect(names).toContain("list_piggy_banks");
    expect(names).toContain("update_piggy_bank");
  });

  test("list_piggy_banks tool should return goals", async () => {
    const mockData = { data: [{ name: "New Car" }] };
    mock.onGet("/piggy-banks").reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "list_piggy_banks");
    const result = await tool.handler({});
    expect(result).toEqual(mockData);
  });

  test("update_piggy_bank tool should post event", async () => {
    mock.onPost("/piggy-banks/1/events", { amount: "50.00" }).reply(200, {});
    const tool = TOOLS.find(t => t.name === "update_piggy_bank");
    const result = await tool.handler({ id: "1", amount: "50.00" });
    expect(result.message).toBe("Piggy bank updated successfully.");
  });
});
