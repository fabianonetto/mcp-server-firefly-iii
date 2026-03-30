# Universal Firefly III AI Bridge (v3.0.0)

A professional-grade, AI-agnostic bridge that provides 100% API coverage for connecting your AI assistants to your [Firefly III](https://github.com/firefly-iii/firefly-iii) personal finance instance.

## 🚀 One Bridge, All AIs

This server exposes **65 Tools** to any AI platform supporting standard protocols.

| AI Platform | Protocol Used | Connection Type |
| :--- | :--- | :--- |
| **Claude / Cursor** | MCP (Native) | stdio or SSE |
| **Gemini CLI** | MCP | stdio |
| **ChatGPT** | OpenAPI (Actions) | REST / JSON |
| **Custom Apps** | REST API | HTTP |

## 🛠️ Key Capabilities
- **Full CRUD Management**: Exhaustive control over Accounts, Transactions, Budgets, and Piggy Banks.
- **Power User Logic**: Support for Transaction Linking, Budget Limits, and Object Groups.
- **System Intelligence**: AI-driven Rule management, Rule Group execution, and Webhook configuration.
- **Data Richness**: Support for file attachments (receipts) and pre-calculated trend insights.
- **Administration**: AI-initiated data exports and global system preferences.

## 📜 Documentation
- [**Tool Reference (API.md)**](docs/API.md): Categorized list of all 65 tools and schemas.
- [**Prompt Gallery (PROMPTS.md)**](docs/PROMPTS.md): Practical examples for interacting with the AI.
- [**Testing Guide (TESTING.md)**](docs/TESTING.md): How to run and write automated tests.
- [**Gemini Manifest (gemini.md)**](gemini.md): Instructions for Gemini Agents.

## 🗺️ Roadmap Status: 100% COMPLETE (v3.0.0)
Moving beyond basic CRUD to advanced logic and data mastery.

- [x] **v1.x Foundations** (Initial Connectivity)
- [x] **v2.x Exhaustive API** (CRUD & Core Admin)
- [x] **v3.x Power User Phase** (Advanced Logic, Linking, & Insights)

## ⚙️ Configuration
Set these environment variables:
- `FIREFLY_URL`: Your instance URL (e.g., `http://your-host:YOUR_PORT`).
- `FIREFLY_TOKEN`: Your Personal Access Token.
- `PORT`: (Optional) Setting this enables the Web/SSE server mode.

## ✨ Created with Gemini CLI
This project was built using **Gemini CLI vibecoding**. Feedback and contributions are always welcome!

## 🔒 Security
- Use a VPN or SSH tunnel if exposing this server to the internet.
- Ensure your `FIREFLY_TOKEN` is kept secret and has appropriate permissions.
