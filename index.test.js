const { mcpServer, TOOLS, apiClient } = require("./index.js");
const axiosMockAdapter = require("axios-mock-adapter");

const mock = new axiosMockAdapter(apiClient);

describe("Firefly III MCP Server v1.1", () => {
  beforeEach(() => {
    mock.reset();
  });

  test("should list all 9 tools (MVP + Categories/Tags)", async () => {
    expect(TOOLS.length).toBe(9);
    const names = TOOLS.map(t => t.name);
    expect(names).toContain("list_categories");
    expect(names).toContain("create_category");
    expect(names).toContain("list_tags");
    expect(names).toContain("create_tag");
  });

  test("list_categories tool should return categories", async () => {
    const mockData = { data: [{ name: "Bills" }] };
    mock.onGet("/categories").reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "list_categories");
    const result = await tool.handler({});
    expect(result).toEqual(mockData);
  });

  test("create_category tool should post new category", async () => {
    const mockData = { data: { id: "1", name: "NewCat" } };
    mock.onPost("/categories", { name: "NewCat" }).reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "create_category");
    const result = await tool.handler({ name: "NewCat" });
    expect(result).toEqual(mockData);
  });

  test("list_tags tool should return tags", async () => {
    const mockData = { data: [{ tag: "vacation" }] };
    mock.onGet("/tags").reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "list_tags");
    const result = await tool.handler({});
    expect(result).toEqual(mockData);
  });

  test("create_tag tool should post new tag", async () => {
    const mockData = { data: { tag: "new-tag" } };
    mock.onPost("/tags", { tag: "new-tag" }).reply(200, mockData);
    const tool = TOOLS.find(t => t.name === "create_tag");
    const result = await tool.handler({ tag: "new-tag" });
    expect(result).toEqual(mockData);
  });

  test("create_transaction should support tags array", async () => {
    mock.onPost("/transactions").reply(200, {});
    const tool = TOOLS.find(t => t.name === "create_transaction");
    await tool.handler({
      type: "withdrawal",
      amount: "5.00",
      description: "Tags Test",
      source_name: "Wallet",
      destination_name: "Store",
      tags: ["tag1", "tag2"]
    });
    
    const sentData = JSON.parse(mock.history.post[0].data);
    expect(sentData.transactions[0].tags).toEqual(["tag1", "tag2"]);
  });
});
