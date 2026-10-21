process.env.NODE_ENV = "test";

const http = require("http");
const { mcpServer, createApp, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

const mock = new axiosMockAdapter(apiClient);

// Helper: find a tool by name
const t = (name) => TOOLS.find(tool => tool.name === name);

beforeEach(() => mock.reset());

// ---------------------------------------------------------------------------
// 1. TOOL REGISTRY
// ---------------------------------------------------------------------------
describe("Tool Registry", () => {
  test("registers exactly 66 tools", () => {
    expect(TOOLS.length).toBe(66);
  });

  test("all tool names are unique", () => {
    const names = TOOLS.map(tool => tool.name);
    expect(new Set(names).size).toBe(66);
  });

  test("every tool has name, description, inputSchema, and handler", () => {
    for (const tool of TOOLS) {
      expect(typeof tool.name).toBe("string");
      expect(typeof tool.description).toBe("string");
      expect(tool.inputSchema).toBeDefined();
      expect(typeof tool.handler).toBe("function");
    }
  });
});

// ---------------------------------------------------------------------------
// 2. MCP SERVER
// ---------------------------------------------------------------------------
describe("MCP Server", () => {
  test("CallToolRequestSchema handler throws on unknown tool", async () => {
    const handler = mcpServer._requestHandlers.get("tools/call");
    const response = await handler({ method: "tools/call", params: { name: "nonexistent_tool", arguments: {} } });
    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("nonexistent_tool");
  });

  test("CallToolRequestSchema handler returns JSON text on success", async () => {
    mock.onGet("/about").reply(200, { version: "6.0.0" });
    const handler = mcpServer._requestHandlers.get("tools/call");
    const response = await handler({ method: "tools/call", params: { name: "get_about", arguments: {} } });
    expect(response.isError).toBeUndefined();
    expect(response.content[0].type).toBe("text");
    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.version).toBe("6.0.0");
  });

  test("ListToolsRequestSchema handler omits handler functions", async () => {
    const handler = mcpServer._requestHandlers.get("tools/list");
    const response = await handler({ method: "tools/list" });
    expect(response.tools.length).toBe(66);
    expect(response.tools[0].handler).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 3. CORE
// ---------------------------------------------------------------------------
describe("Core", () => {
  test("get_about: GET /about", async () => {
    const data = { version: "6.0.0", api_version: "2.0.0" };
    mock.onGet("/about").reply(200, { data });
    const result = await t("get_about").handler();
    expect(result).toEqual({ data });
  });
});

// ---------------------------------------------------------------------------
// 4. ACCOUNTS
// ---------------------------------------------------------------------------
describe("Accounts", () => {
  test("list_accounts: GET /accounts with default type=asset", async () => {
    mock.onGet("/accounts").reply(200, { data: [] });
    await t("list_accounts").handler({});
    expect(mock.history.get[0].url).toBe("/accounts");
    expect(mock.history.get[0].params).toEqual({ type: "asset" });
  });

  test("list_accounts: passes explicit type filter", async () => {
    mock.onGet("/accounts").reply(200, { data: [] });
    await t("list_accounts").handler({ type: "expense" });
    expect(mock.history.get[0].params).toEqual({ type: "expense" });
  });

  test("get_account: GET /accounts/:id", async () => {
    mock.onGet("/accounts/42").reply(200, { data: { id: "42" } });
    const result = await t("get_account").handler({ id: "42" });
    expect(mock.history.get[0].url).toBe("/accounts/42");
    expect(result.data.id).toBe("42");
  });

  test("create_account: POST /accounts with payload", async () => {
    mock.onPost("/accounts").reply(200, { data: { id: "1" } });
    await t("create_account").handler({ name: "Checking", type: "asset", currency_code: "USD" });
    expect(mock.history.post[0].url).toBe("/accounts");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ name: "Checking", type: "asset", currency_code: "USD" });
  });

  test("update_account: PUT /accounts/:id", async () => {
    mock.onPut("/accounts/5").reply(200, { data: { id: "5" } });
    await t("update_account").handler({ id: "5", name: "Savings" });
    expect(mock.history.put[0].url).toBe("/accounts/5");
    expect(JSON.parse(mock.history.put[0].data)).toEqual({ name: "Savings" });
  });

  test("delete_account: DELETE /accounts/:id", async () => {
    mock.onDelete("/accounts/5").reply(204);
    const result = await t("delete_account").handler({ id: "5" });
    expect(mock.history.delete[0].url).toBe("/accounts/5");
    expect(result.message).toMatch(/deleted/i);
  });
});

// ---------------------------------------------------------------------------
// 5. TRANSACTIONS
// ---------------------------------------------------------------------------
describe("Transactions", () => {
  test("list_transactions: GET /transactions with default limit", async () => {
    mock.onGet("/transactions").reply(200, { data: [] });
    await t("list_transactions").handler({});
    expect(mock.history.get[0].url).toBe("/transactions");
    expect(mock.history.get[0].params).toEqual({ limit: 10 });
  });

  test("list_transactions: respects custom limit", async () => {
    mock.onGet("/transactions").reply(200, { data: [] });
    await t("list_transactions").handler({ limit: 25 });
    expect(mock.history.get[0].params).toEqual({ limit: 25 });
  });

  test("get_transaction: GET /transactions/:id", async () => {
    mock.onGet("/transactions/99").reply(200, { data: { id: "99" } });
    const result = await t("get_transaction").handler({ id: "99" });
    expect(mock.history.get[0].url).toBe("/transactions/99");
    expect(result.data.id).toBe("99");
  });

  test("create_transaction: POST /transactions with correct envelope", async () => {
    mock.onPost("/transactions").reply(200, { data: { id: "1" } });
    await t("create_transaction").handler({
      description: "Groceries",
      amount: "45.50",
      source_name: "Checking",
      destination_name: "Supermarket"
    });
    expect(mock.history.post[0].url).toBe("/transactions");
    const body = JSON.parse(mock.history.post[0].data);
    expect(body.transactions[0].description).toBe("Groceries");
    expect(body.transactions[0].amount).toBe("45.50");
    expect(body.transactions[0].source_name).toBe("Checking");
    expect(body.transactions[0].destination_name).toBe("Supermarket");
    expect(body.transactions[0].type).toBe("withdrawal");
    expect(body.transactions[0].date).toBeDefined();
  });

  test("create_transaction: uses provided date", async () => {
    mock.onPost("/transactions").reply(200, { data: { id: "1" } });
    await t("create_transaction").handler({
      description: "Coffee",
      amount: "4.50",
      source_name: "Checking",
      destination_name: "Cafe",
      date: "2024-01-15"
    });
    const body = JSON.parse(mock.history.post[0].data);
    expect(body.transactions[0].date).toBe("2024-01-15");
  });

  test("create_split_transaction: POST /transactions with splits array", async () => {
    mock.onPost("/transactions").reply(200, { data: { id: "2" } });
    const splits = [
      { description: "Food", amount: "30.00", source_name: "Checking", destination_name: "Market" },
      { description: "Supplies", amount: "15.00", source_name: "Checking", destination_name: "Market" }
    ];
    await t("create_split_transaction").handler({ splits });
    const body = JSON.parse(mock.history.post[0].data);
    expect(body.transactions.length).toBe(2);
    expect(body.transactions[0].description).toBe("Food");
    expect(body.transactions[1].description).toBe("Supplies");
  });

  test("update_transaction: PUT /transactions/:id, strips id from body", async () => {
    mock.onPut("/transactions/7").reply(200, { data: { id: "7" } });
    await t("update_transaction").handler({ id: "7", description: "Updated" });
    expect(mock.history.put[0].url).toBe("/transactions/7");
    const body = JSON.parse(mock.history.put[0].data);
    expect(body.id).toBeUndefined();
    expect(body.description).toBe("Updated");
  });

  test("delete_transaction: DELETE /transactions/:id", async () => {
    mock.onDelete("/transactions/7").reply(204);
    const result = await t("delete_transaction").handler({ id: "7" });
    expect(mock.history.delete[0].url).toBe("/transactions/7");
    expect(result.message).toMatch(/deleted/i);
  });

  test("search_transactions: GET /search/transactions with query and limit", async () => {
    mock.onGet("/search/transactions").reply(200, { data: [] });
    await t("search_transactions").handler({ query: "Coffee", limit: 5 });
    expect(mock.history.get[0].url).toBe("/search/transactions");
    expect(mock.history.get[0].params).toEqual({ query: "Coffee", limit: 5 });
  });

  test("search_transactions: defaults to limit 10", async () => {
    mock.onGet("/search/transactions").reply(200, { data: [] });
    await t("search_transactions").handler({ query: "Coffee" });
    expect(mock.history.get[0].params).toEqual({ query: "Coffee", limit: 10 });
  });
});

// ---------------------------------------------------------------------------
// 6. BUDGETS
// ---------------------------------------------------------------------------
describe("Budgets", () => {
  test("list_budgets: GET /budgets", async () => {
    mock.onGet("/budgets").reply(200, { data: [] });
    await t("list_budgets").handler({});
    expect(mock.history.get[0].url).toBe("/budgets");
  });

  test("get_budget: GET /budgets/:id", async () => {
    mock.onGet("/budgets/3").reply(200, { data: { id: "3" } });
    const result = await t("get_budget").handler({ id: "3" });
    expect(mock.history.get[0].url).toBe("/budgets/3");
    expect(result.data.id).toBe("3");
  });

  test("create_budget: POST /budgets", async () => {
    mock.onPost("/budgets").reply(200, { data: { id: "1" } });
    await t("create_budget").handler({ name: "Groceries" });
    expect(mock.history.post[0].url).toBe("/budgets");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ name: "Groceries" });
  });

  test("update_budget: PUT /budgets/:id, strips id", async () => {
    mock.onPut("/budgets/3").reply(200, { data: { id: "3" } });
    await t("update_budget").handler({ id: "3", name: "Food & Dining" });
    expect(mock.history.put[0].url).toBe("/budgets/3");
    expect(JSON.parse(mock.history.put[0].data)).toEqual({ name: "Food & Dining" });
  });

  test("delete_budget: DELETE /budgets/:id", async () => {
    mock.onDelete("/budgets/3").reply(204);
    const result = await t("delete_budget").handler({ id: "3" });
    expect(mock.history.delete[0].url).toBe("/budgets/3");
    expect(result.message).toMatch(/deleted/i);
  });

  test("list_budget_limits: GET /budgets/:id/limits", async () => {
    mock.onGet("/budgets/3/limits").reply(200, { data: [] });
    await t("list_budget_limits").handler({ id: "3" });
    expect(mock.history.get[0].url).toBe("/budgets/3/limits");
  });

  test("create_budget_limit: POST /budgets/:id/limits, strips id", async () => {
    mock.onPost("/budgets/3/limits").reply(200, { data: { id: "1" } });
    await t("create_budget_limit").handler({ id: "3", amount: "500", start: "2024-01-01", end: "2024-01-31" });
    expect(mock.history.post[0].url).toBe("/budgets/3/limits");
    const body = JSON.parse(mock.history.post[0].data);
    expect(body.id).toBeUndefined();
    expect(body.amount).toBe("500");
  });

  test("delete_budget_limit: DELETE /budgets/:budget_id/limits/:limit_id", async () => {
    mock.onDelete("/budgets/3/limits/9").reply(204);
    const result = await t("delete_budget_limit").handler({ budget_id: "3", limit_id: "9" });
    expect(mock.history.delete[0].url).toBe("/budgets/3/limits/9");
    expect(result.message).toMatch(/deleted/i);
  });
});

// ---------------------------------------------------------------------------
// 7. AUTOMATION (Rules, Rule Groups, Webhooks)
// ---------------------------------------------------------------------------
describe("Automation", () => {
  test("list_rules: GET /rules", async () => {
    mock.onGet("/rules").reply(200, { data: [] });
    await t("list_rules").handler({});
    expect(mock.history.get[0].url).toBe("/rules");
  });

  test("get_rule: GET /rules/:id", async () => {
    mock.onGet("/rules/1").reply(200, { data: { id: "1" } });
    const result = await t("get_rule").handler({ id: "1" });
    expect(mock.history.get[0].url).toBe("/rules/1");
    expect(result.data.id).toBe("1");
  });

  test("create_rule: POST /rules with required fields", async () => {
    mock.onPost("/rules").reply(200, { data: { id: "1" } });
    const payload = {
      title: "Auto-categorize Coffee",
      trigger: "store-journal",
      action: "user-action",
      rule_group_id: "1",
      triggers: [{ type: "description_contains", value: "Starbucks" }],
      actions: [{ type: "set_category", value: "Coffee" }]
    };
    await t("create_rule").handler(payload);
    expect(mock.history.post[0].url).toBe("/rules");
    expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
  });

  test("update_rule: PUT /rules/:id, strips id", async () => {
    mock.onPut("/rules/2").reply(200, { data: { id: "2" } });
    await t("update_rule").handler({ id: "2", title: "Updated Title" });
    expect(mock.history.put[0].url).toBe("/rules/2");
    expect(JSON.parse(mock.history.put[0].data)).toEqual({ title: "Updated Title" });
  });

  test("delete_rule: DELETE /rules/:id", async () => {
    mock.onDelete("/rules/2").reply(204);
    const result = await t("delete_rule").handler({ id: "2" });
    expect(mock.history.delete[0].url).toBe("/rules/2");
    expect(result.message).toMatch(/deleted/i);
  });

  test("list_rule_groups: GET /rule-groups", async () => {
    mock.onGet("/rule-groups").reply(200, { data: [] });
    await t("list_rule_groups").handler({});
    expect(mock.history.get[0].url).toBe("/rule-groups");
  });

  test("get_rule_group: GET /rule-groups/:id", async () => {
    mock.onGet("/rule-groups/4").reply(200, { data: { id: "4" } });
    const result = await t("get_rule_group").handler({ id: "4" });
    expect(mock.history.get[0].url).toBe("/rule-groups/4");
    expect(result.data.id).toBe("4");
  });

  test("trigger_rule_group: POST /rule-groups/:id/trigger", async () => {
    mock.onPost("/rule-groups/4/trigger").reply(200, {});
    const result = await t("trigger_rule_group").handler({ id: "4" });
    expect(mock.history.post[0].url).toBe("/rule-groups/4/trigger");
    expect(result.message).toMatch(/triggered/i);
  });

  test("list_webhooks: GET /webhooks", async () => {
    mock.onGet("/webhooks").reply(200, { data: [] });
    await t("list_webhooks").handler({});
    expect(mock.history.get[0].url).toBe("/webhooks");
  });

  test("create_webhook: POST /webhooks with required fields", async () => {
    mock.onPost("/webhooks").reply(200, { data: { id: "1" } });
    const payload = {
      title: "Discord Alerts",
      trigger: "STORE_TRANSACTION",
      response: "TRANSACTIONS",
      delivery: "JSON",
      url: "https://discord.com/webhook"
    };
    await t("create_webhook").handler(payload);
    expect(mock.history.post[0].url).toBe("/webhooks");
    expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
  });

  test("delete_webhook: DELETE /webhooks/:id", async () => {
    mock.onDelete("/webhooks/6").reply(204);
    const result = await t("delete_webhook").handler({ id: "6" });
    expect(mock.history.delete[0].url).toBe("/webhooks/6");
    expect(result.message).toMatch(/deleted/i);
  });
});

// ---------------------------------------------------------------------------
// 8. SYSTEM (Currencies, Preferences)
// ---------------------------------------------------------------------------
describe("System", () => {
  test("list_currencies: GET /currencies", async () => {
    mock.onGet("/currencies").reply(200, { data: [] });
    await t("list_currencies").handler({});
    expect(mock.history.get[0].url).toBe("/currencies");
  });

  test("get_currency: GET /currencies/:code", async () => {
    mock.onGet("/currencies/EUR").reply(200, { data: { code: "EUR" } });
    const result = await t("get_currency").handler({ code: "EUR" });
    expect(mock.history.get[0].url).toBe("/currencies/EUR");
    expect(result.data.code).toBe("EUR");
  });

  test("create_currency: POST /currencies", async () => {
    mock.onPost("/currencies").reply(200, { data: { code: "BRL" } });
    await t("create_currency").handler({ name: "Brazilian Real", code: "BRL", symbol: "R$", decimal_places: 2 });
    expect(mock.history.post[0].url).toBe("/currencies");
    expect(JSON.parse(mock.history.post[0].data).code).toBe("BRL");
  });

  test("update_currency: PUT /currencies/:code, strips code from body", async () => {
    mock.onPut("/currencies/BRL").reply(200, { data: { code: "BRL" } });
    await t("update_currency").handler({ code: "BRL", name: "Real" });
    expect(mock.history.put[0].url).toBe("/currencies/BRL");
    expect(JSON.parse(mock.history.put[0].data)).toEqual({ name: "Real" });
  });

  test("delete_currency: DELETE /currencies/:code", async () => {
    mock.onDelete("/currencies/BRL").reply(204);
    const result = await t("delete_currency").handler({ code: "BRL" });
    expect(mock.history.delete[0].url).toBe("/currencies/BRL");
    expect(result.message).toMatch(/deleted/i);
  });

  test("list_preferences: GET /preferences", async () => {
    mock.onGet("/preferences").reply(200, { data: [] });
    await t("list_preferences").handler({});
    expect(mock.history.get[0].url).toBe("/preferences");
  });

  test("get_preference: GET /preferences/:name", async () => {
    mock.onGet("/preferences/language").reply(200, { data: { data: "en_US" } });
    const result = await t("get_preference").handler({ name: "language" });
    expect(mock.history.get[0].url).toBe("/preferences/language");
    expect(result.data.data).toBe("en_US");
  });

  test("update_preference: PUT /preferences/:name with data field", async () => {
    mock.onPut("/preferences/language").reply(200, { data: { data: "pt_BR" } });
    await t("update_preference").handler({ name: "language", value: "pt_BR" });
    expect(mock.history.put[0].url).toBe("/preferences/language");
    expect(JSON.parse(mock.history.put[0].data)).toEqual({ data: "pt_BR" });
  });
});

// ---------------------------------------------------------------------------
// 9. INSIGHTS (Attachments, Charts, Summaries)
// ---------------------------------------------------------------------------
describe("Insights", () => {
  test("list_attachments: GET /attachments", async () => {
    mock.onGet("/attachments").reply(200, { data: [] });
    await t("list_attachments").handler({});
    expect(mock.history.get[0].url).toBe("/attachments");
  });

  test("get_attachment: GET /attachments/:id", async () => {
    mock.onGet("/attachments/10").reply(200, { data: { id: "10" } });
    const result = await t("get_attachment").handler({ id: "10" });
    expect(mock.history.get[0].url).toBe("/attachments/10");
    expect(result.data.id).toBe("10");
  });

  test("upload_attachment: two-step POST /attachments then POST /attachments/:id/upload", async () => {
    mock.onPost("/attachments").reply(200, { data: { id: "11" } });
    mock.onPost("/attachments/11/upload").reply(200, {});
    await t("upload_attachment").handler({
      filename: "receipt.jpg",
      attachable_type: "Transaction",
      attachable_id: "1",
      content_base64: Buffer.from("fake-image").toString("base64")
    });
    expect(mock.history.post[0].url).toBe("/attachments");
    expect(mock.history.post[1].url).toBe("/attachments/11/upload");
  });

  test("delete_attachment: DELETE /attachments/:id", async () => {
    mock.onDelete("/attachments/10").reply(204);
    const result = await t("delete_attachment").handler({ id: "10" });
    expect(mock.history.delete[0].url).toBe("/attachments/10");
    expect(result.message).toMatch(/deleted/i);
  });

  test("get_account_overview_chart: GET /charts/account/overview with params", async () => {
    mock.onGet("/charts/account/overview").reply(200, {});
    await t("get_account_overview_chart").handler({ start: "2024-01-01", end: "2024-01-31" });
    expect(mock.history.get[0].url).toBe("/charts/account/overview");
    expect(mock.history.get[0].params).toEqual({ start: "2024-01-01", end: "2024-01-31" });
  });

  test("get_net_worth_summary: GET /summary/basic with params", async () => {
    mock.onGet("/summary/basic").reply(200, {});
    await t("get_net_worth_summary").handler({ start: "2024-01-01", end: "2024-01-31" });
    expect(mock.history.get[0].url).toBe("/summary/basic");
    expect(mock.history.get[0].params).toEqual({ start: "2024-01-01", end: "2024-01-31" });
  });

  test("get_spending_summary: GET /insight/expense/category with params", async () => {
    mock.onGet("/insight/expense/category").reply(200, {});
    await t("get_spending_summary").handler({ start: "2024-01-01", end: "2024-01-31" });
    expect(mock.history.get[0].url).toBe("/insight/expense/category");
    expect(mock.history.get[0].params).toEqual({ start: "2024-01-01", end: "2024-01-31" });
  });
});

// ---------------------------------------------------------------------------
// 10. META (Categories, Tags)
// ---------------------------------------------------------------------------
describe("Meta", () => {
  test("list_categories: GET /categories", async () => {
    mock.onGet("/categories").reply(200, { data: [] });
    await t("list_categories").handler({});
    expect(mock.history.get[0].url).toBe("/categories");
  });

  test("create_category: POST /categories", async () => {
    mock.onPost("/categories").reply(200, { data: { id: "1" } });
    await t("create_category").handler({ name: "Entertainment" });
    expect(mock.history.post[0].url).toBe("/categories");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ name: "Entertainment" });
  });

  test("list_tags: GET /tags", async () => {
    mock.onGet("/tags").reply(200, { data: [] });
    await t("list_tags").handler({});
    expect(mock.history.get[0].url).toBe("/tags");
  });

  test("create_tag: POST /tags", async () => {
    mock.onPost("/tags").reply(200, { data: { id: "1" } });
    await t("create_tag").handler({ tag: "tax-deductible" });
    expect(mock.history.post[0].url).toBe("/tags");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ tag: "tax-deductible" });
  });
});

// ---------------------------------------------------------------------------
// 11. BILLS
// ---------------------------------------------------------------------------
describe("Bills", () => {
  test("list_bills: GET /bills", async () => {
    mock.onGet("/bills").reply(200, { data: [] });
    await t("list_bills").handler({});
    expect(mock.history.get[0].url).toBe("/bills");
  });

  test("create_bill: POST /bills with required fields", async () => {
    mock.onPost("/bills").reply(200, { data: { id: "1" } });
    const payload = {
      name: "Internet",
      amount_min: "50",
      amount_max: "60",
      date: "2024-01-01",
      repeat_freq: "monthly"
    };
    await t("create_bill").handler(payload);
    expect(mock.history.post[0].url).toBe("/bills");
    expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
  });

  test("delete_bill: DELETE /bills/:id", async () => {
    mock.onDelete("/bills/2").reply(204);
    const result = await t("delete_bill").handler({ id: "2" });
    expect(mock.history.delete[0].url).toBe("/bills/2");
    expect(result.message).toMatch(/deleted/i);
  });
});

// ---------------------------------------------------------------------------
// 12. PIGGY BANKS
// ---------------------------------------------------------------------------
describe("Piggy Banks", () => {
  test("list_piggy_banks: GET /piggy-banks", async () => {
    mock.onGet("/piggy-banks").reply(200, { data: [] });
    await t("list_piggy_banks").handler({});
    expect(mock.history.get[0].url).toBe("/piggy-banks");
  });

  test("create_piggy_bank: POST /piggy-banks", async () => {
    mock.onPost("/piggy-banks").reply(200, { data: { id: "1" } });
    await t("create_piggy_bank").handler({ name: "Vacation", target_amount: "2000", account_id: "1" });
    expect(mock.history.post[0].url).toBe("/piggy-banks");
    expect(JSON.parse(mock.history.post[0].data).name).toBe("Vacation");
  });

  test("update_piggy_bank: POST /piggy-banks/:id/events", async () => {
    mock.onPost("/piggy-banks/1/events").reply(200, {});
    await t("update_piggy_bank").handler({ id: "1", amount: "100", action: "add" });
    expect(mock.history.post[0].url).toBe("/piggy-banks/1/events");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ amount: "100", action: "add" });
  });

  test("delete_piggy_bank: DELETE /piggy-banks/:id", async () => {
    mock.onDelete("/piggy-banks/1").reply(204);
    const result = await t("delete_piggy_bank").handler({ id: "1" });
    expect(mock.history.delete[0].url).toBe("/piggy-banks/1");
    expect(result.message).toMatch(/deleted/i);
  });
});

// ---------------------------------------------------------------------------
// 13. OBJECT GROUPS
// ---------------------------------------------------------------------------
describe("Object Groups", () => {
  test("list_object_groups: GET /object-groups", async () => {
    mock.onGet("/object-groups").reply(200, { data: [] });
    await t("list_object_groups").handler({});
    expect(mock.history.get[0].url).toBe("/object-groups");
  });

  test("create_object_group: POST /object-groups", async () => {
    mock.onPost("/object-groups").reply(200, { data: { id: "1" } });
    await t("create_object_group").handler({ title: "Shared Expenses" });
    expect(mock.history.post[0].url).toBe("/object-groups");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ title: "Shared Expenses" });
  });
});

// ---------------------------------------------------------------------------
// 14. RECURRING TRANSACTIONS
// ---------------------------------------------------------------------------
describe("Recurring Transactions", () => {
  test("list_recurring: GET /recurring", async () => {
    mock.onGet("/recurring").reply(200, { data: [] });
    await t("list_recurring").handler({});
    expect(mock.history.get[0].url).toBe("/recurring");
  });

  test("get_recurring: GET /recurring/:id", async () => {
    mock.onGet("/recurring/5").reply(200, { data: { id: "5" } });
    const result = await t("get_recurring").handler({ id: "5" });
    expect(mock.history.get[0].url).toBe("/recurring/5");
    expect(result.data.id).toBe("5");
  });

  test("create_recurring: POST /recurring with required fields", async () => {
    mock.onPost("/recurring").reply(200, { data: { id: "1" } });
    const payload = {
      name: "Netflix",
      type: "withdrawal",
      amount: "15.99",
      first_date: "2024-01-01",
      repeat_freq: "monthly"
    };
    await t("create_recurring").handler(payload);
    expect(mock.history.post[0].url).toBe("/recurring");
    expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
  });

  test("update_recurring: PUT /recurring/:id, strips id", async () => {
    mock.onPut("/recurring/5").reply(200, { data: { id: "5" } });
    await t("update_recurring").handler({ id: "5", amount: "17.99" });
    expect(mock.history.put[0].url).toBe("/recurring/5");
    expect(JSON.parse(mock.history.put[0].data)).toEqual({ amount: "17.99" });
  });

  test("delete_recurring: DELETE /recurring/:id", async () => {
    mock.onDelete("/recurring/5").reply(204);
    const result = await t("delete_recurring").handler({ id: "5" });
    expect(mock.history.delete[0].url).toBe("/recurring/5");
    expect(result.message).toMatch(/deleted/i);
  });
});

// ---------------------------------------------------------------------------
// 15. ADMIN
// ---------------------------------------------------------------------------
describe("Admin", () => {
  test("trigger_export: POST /data/export/transactions", async () => {
    mock.onPost("/data/export/transactions").reply(200, {});
    const result = await t("trigger_export").handler({ start: "2024-01-01", end: "2024-12-31" });
    expect(mock.history.post[0].url).toBe("/data/export/transactions");
    const body = JSON.parse(mock.history.post[0].data);
    expect(body.start).toBe("2024-01-01");
    expect(result.message).toMatch(/successfully/i);
  });
});

// ---------------------------------------------------------------------------
// 15. ERROR HANDLING
// ---------------------------------------------------------------------------
describe("Error Handling", () => {
  test("API error response is propagated to MCP handler as isError", async () => {
    mock.onGet("/about").reply(401, { message: "Unauthorized" });
    const handler = mcpServer._requestHandlers.get("tools/call");
    const response = await handler({ method: "tools/call", params: { name: "get_about", arguments: {} } });
    expect(response.isError).toBe(true);
    expect(response.content[0].text).toContain("Unauthorized");
  });

  test("non-API error is propagated as plain message", async () => {
    mock.onGet("/about").networkError();
    const handler = mcpServer._requestHandlers.get("tools/call");
    const response = await handler({ method: "tools/call", params: { name: "get_about", arguments: {} } });
    expect(response.isError).toBe(true);
    expect(typeof response.content[0].text).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// 16. SSE MODE (MULTI-SESSION & RECONNECTION - ISSUE #15)
// ---------------------------------------------------------------------------
describe("SSE Transport (Issue #15)", () => {
  let server, baseUrl, transports;

  beforeAll((done) => {
    const created = createApp();
    transports = created.transports;
    server = created.app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      done();
    });
  });

  afterAll((done) => {
    for (const sid in transports) {
      try { transports[sid].close(); } catch (_) {}
    }
    server.close(done);
  });

  test("multiple concurrent GET /sse connections do not crash or throw 500", async () => {
    const sse1 = http.get(`${baseUrl}/sse`);
    const sse2 = http.get(`${baseUrl}/sse`);

    const res1 = await new Promise(resolve => sse1.once("response", resolve));
    const res2 = await new Promise(resolve => sse2.once("response", resolve));

    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200);

    expect(Object.keys(transports).length).toBe(2);

    sse1.destroy();
    sse2.destroy();
    await new Promise(r => setTimeout(r, 50));
    expect(Object.keys(transports).length).toBe(0);
  });

  test("POST /messages routes to correct session or returns 400 for unknown session", async () => {
    const res = await fetch(`${baseUrl}/messages?sessionId=non-existent-session-id`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} })
    });
    expect(res.status).toBe(400);
  });
});