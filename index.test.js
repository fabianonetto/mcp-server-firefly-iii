const { mcpServer, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

// Set test environment
process.env.NODE_ENV = "test";

const mock = new axiosMockAdapter(apiClient);

describe("Firefly III MCP Server v3.0.0-phase2 (Data Mastery)", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("should list all 62 tools (Data Mastery Phase 2)", async () => {
    expect(TOOLS.length).toBe(62);
  });

  // OBJECT GROUP TESTS
  test("list_object_groups should return groups", async () => {
    mock.onGet("/object-groups").reply(200, { data: [{ title: "Business" }] });
    const tool = TOOLS.find(t => t.name === "list_object_groups");
    const result = await tool.handler({});
    expect(result.data[0].title).toBe("Business");
  });

  // RECURRING TESTS
  test("create_recurring should post correctly", async () => {
    mock.onPost("/recurring").reply(200, { data: { id: "1" } });
    const tool = TOOLS.find(t => t.name === "create_recurring");
    const result = await tool.handler({
      name: "Rent",
      type: "withdrawal",
      amount: "1000",
      repeat_freq: "monthly",
      source_name: "Checking",
      destination_name: "Landlord"
    });
    expect(result.data.id).toBe("1");
  });
});
