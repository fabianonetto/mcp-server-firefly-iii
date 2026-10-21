# Universal Firefly III AI Bridge (v3.0.0)

A professional-grade, AI-agnostic bridge providing exhaustive 100% API coverage for connecting AI assistants to your [Firefly III](https://github.com/firefly-iii/firefly-iii) personal finance instance.

**66 tools** covering every major Firefly III capability: accounts, transactions, budgets, bills, recurring rules, automation, insights, attachments, currencies, and more.

---

## Compatibility

| AI Platform | Protocol | Connection | Setup Guide |
| :--- | :--- | :--- | :--- |
| **Claude Code** | MCP (Native) | stdio | [CLAUDE.md](CLAUDE.md) |
| **Claude Desktop** | MCP (Native) | stdio | [CLAUDE.md](CLAUDE.md) |
| **Gemini CLI** | MCP Extension | stdio | [gemini.md](gemini.md) |
| **Cursor / VS Code** | MCP | stdio or SSE | Manual setup below |
| **ChatGPT** | OpenAPI Actions | REST / JSON | `/openapi.json` endpoint |
| **Custom Apps** | REST API | HTTP | `/api/<tool>` endpoints |

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A running [Firefly III](https://github.com/firefly-iii/firefly-iii) instance
- A **Personal Access Token** from Firefly III  
  *(Profile → OAuth → Personal Access Tokens → Create new token)*

### Clone and install

```bash
git clone https://github.com/fabianonetto/mcp-server-firefly-iii.git
cd mcp-server-firefly-iii
npm install
```

---

## Setup by Platform

### Claude Code (Recommended)

Claude Code uses `.mcp.json` in the project directory for MCP server configuration. Credentials go in a separate `.env` file so no secrets are ever in config files.

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

The server reads credentials from `.env` automatically. No secrets in `.mcp.json`.

**3. Start Claude Code** from the repo directory:

```bash
claude
```

The server starts automatically. Claude Code will prompt you to approve it on first launch (once only).

**4. Verify** the connection by asking:

```
Use the get_about tool
```

You should receive your Firefly III version and API information.

**Using from other projects:**  
Copy both `.env` and `.mcp.json` to any other project directory, changing `./index.js` to the absolute path:

```json
"args": ["/absolute/path/to/mcp-server-firefly-iii/index.js"]
```

See [CLAUDE.md](CLAUDE.md) for the full guide including auto-approval configuration.

---

## Claude Desktop

Add the server to your Claude Desktop config file:

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

## Gemini CLI Extension (One-command install)

```bash
gemini extensions install https://github.com/fabianonetto/mcp-server-firefly-iii
```

Then configure your instance:

```bash
gemini config set extensions.firefly-iii-universal-bridge.settings.FIREFLY_URL "http://your-host:PORT"
gemini config set extensions.firefly-iii-universal-bridge.settings.FIREFLY_TOKEN "your_token"
```

See [gemini.md](gemini.md) for the full guide.

---

## Docker (Official Image)

The official image is available on GitHub Packages: `ghcr.io/fabianonetto/mcp-server-firefly-iii`.

#### Run as a service (SSE Mode)
Ideal for ChatGPT Actions, Cursor (SSE), or custom integrations.

```bash
docker run -d \
  --name firefly-mcp \
  -p 3001:3001 \
  -e FIREFLY_URL="http://your-firefly-instance" \
  -e FIREFLY_TOKEN="your_personal_access_token" \
  -e PORT=3001 \
  ghcr.io/fabianonetto/mcp-server-firefly-iii:latest
```

#### Run with Claude Desktop (stdio Mode)
Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "firefly-iii": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "FIREFLY_URL=http://your-host:PORT",
        "-e", "FIREFLY_TOKEN=your_token",
        "ghcr.io/fabianonetto/mcp-server-firefly-iii:latest"
      ]
    }
  }
}
```

---

## Cursor / VS Code (MCP Extension)

Add to your MCP config (`.cursor/mcp.json` or equivalent):

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

---

### HTTP Mode (Streamable HTTP, SSE, ChatGPT Actions, REST)

Start the server with a port to enable the MCP HTTP endpoints and REST API:

```bash
FIREFLY_URL=http://your-host:PORT FIREFLY_TOKEN=your_token PORT=3000 node index.js
```

Available endpoints:

| Endpoint | Description |
| :--- | :--- |
| `POST /mcp`, `GET /mcp`, `DELETE /mcp` | Streamable HTTP transport (recommended for modern MCP clients like n8n) |
| `GET /sse` | Server-Sent Events (SSE) transport (supports multiple concurrent sessions & reconnects) |
| `POST /messages` | SSE message endpoint (routes by `?sessionId=...`) |
| `POST /api/<tool_name>` | Direct REST call to any tool |
| `GET /openapi.json` | OpenAPI 3.0 spec (import into ChatGPT Actions) |

---

## Tool Categories

| Category | Tools | Description |
| :--- | :---: | :--- |
| Core | 1 | System info & connectivity |
| Accounts | 5 | Full CRUD for all account types |
| Transactions | 7 | CRUD, split transactions, search |
| Budgets | 8 | Budgets + monetary limits |
| Bills & Piggy Banks | 7 | Bill tracking + savings goals |
| Automation | 11 | Rules, rule groups, webhooks |
| Recurring | 5 | Recurring transaction rules |
| System | 8 | Currencies + user preferences |
| Insights | 7 | Attachments, charts, net worth, spending |
| Meta | 4 | Categories + tags |
| Object Groups | 2 | Account/piggy bank organization |
| Admin | 1 | Data export |
| **Total** | **66** | |

---

## Documentation

| Document | Description |
| :--- | :--- |
| [docs/API.md](docs/API.md) | Complete reference for all 66 tools and their input schemas |
| [docs/PROMPTS.md](docs/PROMPTS.md) | Prompt examples for common financial tasks |
| [docs/USE_CASES.md](docs/USE_CASES.md) | Strategic guides: tax assistant, subscription auditor, receipt manager |
| [docs/TESTING.md](docs/TESTING.md) | Test suite documentation (78 tests, all tools covered) |
| [CLAUDE.md](CLAUDE.md) | Claude Code & Claude Desktop setup guide |
| [gemini.md](gemini.md) | Gemini CLI extension guide |

---

## Running Tests

```bash
npm test
```

78 tests covering all 66 tools. No live Firefly III instance required — all API calls are mocked.
See [docs/TESTING.md](docs/TESTING.md) for details.

---

## Security

- Use a VPN or SSH tunnel if exposing the server to the internet.
- Keep your `FIREFLY_TOKEN` secret. Never commit `.mcp.json` or `.env` files.
- See [SECURITY.md](SECURITY.md) for the full security policy.

---

## Roadmap

- [x] v1.x — Initial connectivity
- [x] v2.x — Exhaustive API coverage (CRUD & core admin)
- [x] v3.x — Power user features (splits, insights, automation)
- [x] v3.1.0 — Official Docker image & CI/CD
