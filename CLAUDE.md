# Firefly III MCP Server — Claude Code Guide

MCP server bridging Firefly III personal finance manager to AI assistants. 66 tools, Node.js, fully tested (83 tests).

---

## Quick Setup (Claude Code)

**1. Create `.env`** in the repo root (gitignored — never committed):

```env
FIREFLY_URL=http://your-host:PORT
FIREFLY_TOKEN=your_personal_access_token
```

Get your token: Firefly III → **Profile → OAuth → Personal Access Tokens → Create new token**

**2. Create `.mcp.json`** in the repo root (gitignored — never committed):

```json
{
  "mcpServers": {
    "firefly-iii": {
      "command": "node",
      "args": ["./index.js"]
    }
  }
}
```

The server reads credentials from `.env` automatically via `dotenv`. No secrets in `.mcp.json`.

**3. Start Claude Code** from this directory:

```bash
claude
```

The server starts automatically. On first launch Claude Code asks for approval (once only). To skip the prompt, add `"enabledMcpjsonServers": ["firefly-iii"]` to `~/.claude/settings.json`.

**3. Verify** the connection:

```
Use the get_about tool
```

You should receive your Firefly III version and API information. An `Unauthenticated` error means the token in `.mcp.json` is still the placeholder — update it with your real token.

---

## Using from Other Projects

Copy `.mcp.json` with an absolute path so Claude Code can find the server from any directory:

```json
{
  "mcpServers": {
    "firefly-iii": {
      "command": "node",
      "args": ["C:/absolute/path/to/mcp-server-firefly-iii/index.js"],
      "env": {
        "FIREFLY_URL": "http://your-host:PORT",
        "FIREFLY_TOKEN": "your_personal_access_token"
      }
    }
  }
}
```

---

## Claude Desktop Setup

Config file locations:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "firefly-iii": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-firefly-iii/index.js"],
      "env": {
        "FIREFLY_URL": "http://your-host:PORT",
        "FIREFLY_TOKEN": "your_personal_access_token"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

---

## Project Commands

```bash
npm test                   # Run 83-test suite (all mocked, no live Firefly needed)
node index.js              # Start in stdio mode (MCP clients: Claude Code, Gemini CLI)
PORT=3001 node index.js    # Start in HTTP mode (Streamable HTTP, SSE, ChatGPT Actions, REST clients)
docker build -t mcp .      # Build Docker image
docker run -p 3001:3001 -e FIREFLY_URL=... -e FIREFLY_TOKEN=... -e PORT=3001 mcp # Run HTTP mode
```

---

## Architecture

```
index.js              # Entry point: MCP server + Express HTTP/SSE mode
src/
  config.js           # Reads env vars, creates axios apiClient with Bearer auth
  tools/
    core.js           # get_about (1)
    accounts.js       # CRUD (5)
    transactions.js   # CRUD + split + search (7)
    budgets.js        # Budgets + limits CRUD (8)
    automation.js     # Rules, rule groups, webhooks (11)
    system.js         # Currencies + preferences CRUD (8)
    insights.js       # Attachments + analytics (7)
    meta.js           # Categories + tags (4)
    bills.js          # Bills + piggy banks CRUD (7)
    groups.js         # Object groups (2)
    recurring.js      # Recurring transactions CRUD (5)
    admin.js          # trigger_export (1)
```

Each tool file exports an array of `{ name, description, inputSchema, handler }` objects. `index.js` merges them all into a single `TOOLS` registry and registers MCP handlers.

---

## Adding a New Tool

1. Add the tool object to the relevant `src/tools/*.js` file
2. Update the tool count assertion in `index.test.js`: `expect(TOOLS.length).toBe(66)` → new count
3. Add a test: verify HTTP method, URL path, and request payload
4. Update `docs/API.md`

---

## Key Gotchas

**`.mcp.json` is gitignored** — it holds real credentials. Never commit it.

**Query params must use axios `{ params }` option**, not string interpolation. `apiClient.get(\`/path?x=${x}\`)` causes 404s from the mock adapter and can break reverse proxies. Always use `apiClient.get("/path", { params: { x } })`.

**Tool count is enforced in tests.** Adding or removing a tool without updating `expect(TOOLS.length).toBe(66)` fails the suite — intentional guard.

**stdio vs HTTP mode** — without `PORT` the server speaks MCP over stdin/stdout. With `PORT` it starts Express with `/mcp` (Streamable HTTP), `/sse` & `/messages` (legacy SSE), `/api/<tool>`, and `/openapi.json`.

**`Unauthenticated` on startup is normal** if the token is still the placeholder. The server connects successfully; tool calls fail at the Firefly III API level, not at the MCP level.

---

## Testing

```bash
npm test
```

83 tests, 17 describe blocks, all 66 tools covered. No live Firefly III required.
See [`docs/TESTING.md`](docs/TESTING.md) for the full coverage table.
