# Universal Firefly III AI Bridge (MCP + OpenAPI)

A unified server that connects your [Firefly III](https://www.firefly-iii.org/) instance to any AI platform. This server speaks multiple "AI languages" simultaneously.

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
Then, point ChatGPT to `http://your-server-ip:3000/openapi.json`.

## 📜 Documentation Files
- **`README.md`**: Human-readable setup and usage guide.
- **`gemini.md`**: AI-readable instructions for Gemini Agents.
- **`/openapi.json`**: Auto-generated specification for ChatGPT Actions.

## 🔒 Security
- Use a VPN or SSH tunnel if exposing this server to the internet.
- Ensure your `FIREFLY_TOKEN` is kept secret and has appropriate permissions.
