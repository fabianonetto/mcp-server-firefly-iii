# Testing Guide

This project uses **Jest** for unit testing and **axios-mock-adapter** to simulate Firefly III API responses.

## 🚀 Running Tests

To run the full test suite:
```bash
npm test
```

## 🧪 Testing Philosophy

1.  **Mocking**: We never hit a live Firefly III instance during regular tests. All API calls must be mocked in `index.test.js`.
2.  **Statelessness**: Each test should reset the mock state (`mock.reset()`) to ensure isolation.
3.  **Environment Variables**: The test runner uses dummy variables for `FIREFLY_URL` and `FIREFLY_TOKEN` to bypass initialization checks.

## 📝 Writing a New Test

When adding a new tool, add a corresponding test case in `index.test.js`:

```javascript
test("your_tool_name should do X", async () => {
  const mockData = { data: { ... } };
  mock.onGet("/your-endpoint").reply(200, mockData);
  
  const tool = TOOLS.find(t => t.name === "your_tool_name");
  const result = await tool.handler({});
  expect(result).toEqual(mockData);
});
```
