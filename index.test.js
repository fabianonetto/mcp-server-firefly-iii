const { mcpServer, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

const mock = new axiosMockAdapter(apiClient);

describe("Firefly III MCP Server v2.0.0-phase3 (Automation)", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("should list all 34 tools (Exhaustive Automation Phase 3)", async () => {
    expect(TOOLS.length).toBe(34);
  });

  // RULE TESTS
  test("list_rules should return all rules", async () => {
    const mockData = { data: [{ title: "Auto Tag" }] };
    mock.onGet("/rules").reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "list_rules");
    const result = await tool.handler({});
    expect(result).toEqual(mockData);
  });

  test("trigger_rule_group should send POST", async () => {
    mock.onPost("/rule-groups/1/trigger").reply(200, {});
    const tool = TOOLS.find(t => t.name === "trigger_rule_group");
    const result = await tool.handler({ id: "1" });
    expect(result.message).toContain("successfully");
  });

  // WEBHOOK TESTS
  test("create_webhook should post new webhook", async () => {
    const mockData = { data: { id: "1", title: "Slack" } };
    mock.onPost("/webhooks").reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "create_webhook");
    const result = await tool.handler({ title: "Slack", url: "http://slack.com", trigger: "STORE_TRANSACTION" });
    expect(result.data.title).toBe("Slack");
  });
});
