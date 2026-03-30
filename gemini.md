# Firefly III Universal AI Bridge - Project State

This project is a professional-grade, AI-agnostic bridge connecting [Firefly III](https://github.com/firefly-iii/firefly-iii) to the global AI ecosystem.

## 🚀 Accomplishments
- **AI-Agnostic Core**: Supports MCP (stdio/SSE) and OpenAPI.
- **Comprehensive Toolset (v1.2.0)**: 11 tools covering Accounts, Transactions, Categories, Tags, Bills, and Recurring rules.
- **Automated Testing**: Robust suite using Jest and axios-mock-adapter.
- **Professional DevOps**: Clean history, Conventional Commits, and GitHub Roadmap.

## 📜 Process & Documentation Standards
All future work on this project MUST adhere to the following:
1.  **Conventional Commits**: Use prefixes like `Feat:`, `Fix:`, `Docs:`, `Chore:`, and `Refactor:`.
2.  **Tool Reference**: Every time a tool is added or modified, `docs/API.md` MUST be updated.
3.  **Testing Standards**: Every new feature must include unit tests in `index.test.js`, and `docs/TESTING.md` must be updated if the methodology changes.
4.  **Issue Management**: Use descriptive issue bodies and link them to commits/PRs.

## 🗺️ Product Roadmap
- [x] Categories & Tags Management (v1.1.0)
- [x] Bills & Recurring Transactions (v1.2.0)
- [ ] Advanced Search Tool (v1.3.0)
- [ ] Piggy Banks Integration (v1.4.0)

## 🛠️ Global Setup Instructions
```powershell
gemini mcp add firefly node "W:/ai/gemini/firefly-iii/mcp-server/index.js" --scope user --env FIREFLY_URL="http://toshiba-laptop-ethernet:8081" --env FIREFLY_TOKEN="YOUR_TOKEN"
```
