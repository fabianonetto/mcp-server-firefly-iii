const { mcpServer, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

const mock = new axiosMockAdapter(apiClient);

describe("Firefly III MCP Server v2.0.0-phase1 (CRUD)", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("should list all 22 tools (Exhaustive CRUD Phase 1)", async () => {
    expect(TOOLS.length).toBe(22);
  });

  // ACCOUNT CRUD TESTS
  test("update_account should send PUT request", async () => {
    mock.onPut("/accounts/1").reply(200, { data: { id: "1", name: "Updated" } });
    const tool = TOOLS.find(t => t.name === "update_account");
    const result = await tool.handler({ id: "1", name: "Updated" });
    expect(result.data.name).toBe("Updated");
  });

  test("delete_account should send DELETE request", async () => {
    mock.onDelete("/accounts/1").reply(204);
    const tool = TOOLS.find(t => t.name === "delete_account");
    const result = await tool.handler({ id: "1" });
    expect(result.message).toContain("successfully");
  });

  // TRANSACTION CRUD TESTS
  test("update_transaction should send PUT request", async () => {
    mock.onPut("/transactions/10").reply(200, { data: { id: "10" } });
    const tool = TOOLS.find(t => t.name === "update_transaction");
    const result = await tool.handler({ id: "10", description: "New Desc" });
    expect(result.data.id).toBe("10");
  });

  test("delete_transaction should send DELETE request", async () => {
    mock.onDelete("/transactions/10").reply(204);
    const tool = TOOLS.find(t => t.name === "delete_transaction");
    const result = await tool.handler({ id: "10" });
    expect(result.message).toContain("successfully");
  });

  // BUDGET CRUD TESTS
  test("update_budget should send PUT request", async () => {
    mock.onPut("/budgets/5").reply(200, { data: { id: "5" } });
    const tool = TOOLS.find(t => t.name === "update_budget");
    const result = await tool.handler({ id: "5", active: false });
    expect(result.data.id).toBe("5");
  });

  // BILL CRUD TESTS
  test("delete_bill should send DELETE request", async () => {
    mock.onDelete("/bills/2").reply(204);
    const tool = TOOLS.find(t => t.name === "delete_bill");
    const result = await tool.handler({ id: "2" });
    expect(result.message).toContain("successfully");
  });

  // PIGGY BANK CRUD TESTS
  test("delete_piggy_bank should send DELETE request", async () => {
    mock.onDelete("/piggy-banks/3").reply(204);
    const tool = TOOLS.find(t => t.name === "delete_piggy_bank");
    const result = await tool.handler({ id: "3" });
    expect(result.message).toContain("successfully");
  });
});
