const { mcpServer, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

const mock = new axiosMockAdapter(apiClient);

describe("Firefly III MCP Server v3.0.0-phase1 (Power User)", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("should list all 55 tools (Advanced Logic Phase 1)", async () => {
    expect(TOOLS.length).toBe(55);
  });

  // LINKING TESTS
  test("list_link_types should return types", async () => {
    mock.onGet("/link-types").reply(200, { data: [{ name: "reimbursement" }] });
    const tool = TOOLS.find(t => t.name === "list_link_types");
    const result = await tool.handler({});
    expect(result.data[0].name).toBe("reimbursement");
  });

  test("link_transactions should post correctly", async () => {
    mock.onPost("/transaction-links").reply(200, { data: { id: "1" } });
    const tool = TOOLS.find(t => t.name === "link_transactions");
    const result = await tool.handler({ link_type_id: "1", inward_id: "2", outward_id: "3" });
    expect(result.data.id).toBe("1");
  });

  // BUDGET LIMIT TESTS
  test("create_budget_limit should post limit", async () => {
    mock.onPost("/budgets/1/limits").reply(200, { data: { id: "10" } });
    const tool = TOOLS.find(t => t.name === "create_budget_limit");
    const result = await tool.handler({ id: "1", amount: "500", start: "2024-01-01", end: "2024-01-31" });
    expect(result.data.id).toBe("10");
  });
});
