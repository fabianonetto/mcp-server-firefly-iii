# Universal Firefly III AI Bridge (MCP + OpenAPI)

A unified server that connects your AI assistants to your [Firefly III](https://github.com/firefly-iii/firefly-iii) personal finance instance. This server speaks multiple "AI languages" simultaneously.

## 🚀 One Bridge, All AIs

| AI Platform | Protocol Used | Connection Type |
| :--- | :--- | :--- |
| **Claude / Cursor** | MCP (Native) | stdio or SSE |
| **Gemini CLI** | MCP | stdio |
| **ChatGPT** | OpenAPI (Actions) | REST / JSON |
| **Custom Apps** | REST API | HTTP |

## 🛠️ Features
- **Account Management**: List asset accounts and check real-time balances.
- **Transaction History**: Retrieve recent spending and income history.
- **Smart Recording**: Create withdrawals, deposits, and transfers via natural language.
- **Budget Tracking**: Monitor your budget limits and current spending.

## ⚙️ Configuration

Set these environment variables:
- `FIREFLY_URL`: Your instance URL (e.g., `http://192.168.1.50:8081`).
- `FIREFLY_TOKEN`: Your Personal Access Token.
- `PORT`: (Optional) Setting this turns the server into a Web/SSE server.

## 📦 Usage

### 1. Local (Gemini CLI)
```powershell
gemini mcp add firefly npx -y mcp-server-firefly-iii --env FIREFLY_URL="..." --env FIREFLY_TOKEN="..."
```

### 2. Claude Desktop (Windows/macOS)
Claude Desktop requires editing a configuration file.

**File Locations:**
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Add this to the `mcpServers` section:**
```json
{
  "mcpServers": {
    "firefly-iii": {
      "command": "npx",
      "args": ["-y", "mcp-server-firefly-iii"],
      "env": {
        "FIREFLY_URL": "http://your-instance:8080",
        "FIREFLY_TOKEN": "YOUR_TOKEN"
      }
    }
  }
}
```
*Note: Restart Claude Desktop after saving.*

### 3. Remote / Cloud (ChatGPT / Mobile AIs)
Run the server on a hosted machine with a `PORT`:
```bash
export PORT=3000
npx -y mcp-server-firefly-iii
```
Then, point ChatGPT to `http://your-server-ip:PORT/openapi.json`.

## 📜 Documentation
- [**Tool Reference (API.md)**](docs/API.md): Detailed list of all tools and parameters.
- [**Testing Guide (TESTING.md)**](docs/TESTING.md): How to run and write automated tests.
- [**Gemini Manifest (gemini.md)**](gemini.md): Instructions for Gemini Agents.
- [**OpenAPI Spec**](/openapi.json): Specification for ChatGPT Actions (available when running in Web mode).

## 🗺️ Roadmap
We are working towards a full-fledged Firefly III integration. Check out our [v1.1 Milestone](https://github.com/fabianonetto/mcp-server-firefly-iii/milestone/1).

- [x] [Categories & Tags Management](https://github.com/fabianonetto/mcp-server-firefly-iii/issues/1) (v1.1.0)
- [x] [Bills & Recurring Transactions](https://github.com/fabianonetto/mcp-server-firefly-iii/issues/2) (v1.2.0)
- [ ] [Advanced Search Tool](https://github.com/fabianonetto/mcp-server-firefly-iii/issues/3) (v1.3.0)
- [ ] [Piggy Banks Integration](https://github.com/fabianonetto/mcp-server-firefly-iii/issues/4)

## ✨ Created with Gemini CLI
This project was built using **Gemini CLI vibecoding**. Feedback and contributions are always welcome!

## 🔒 Security
- Use a VPN or SSH tunnel if exposing this server to the internet.
- Ensure your `FIREFLY_TOKEN` is kept secret and has appropriate permissions.
