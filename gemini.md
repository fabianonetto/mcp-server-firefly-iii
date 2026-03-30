# Firefly III Universal AI Bridge - Project State

This project is a professional-grade, AI-agnostic bridge connecting [Firefly III](https://github.com/firefly-iii/firefly-iii) to the global AI ecosystem.

## 🚀 Accomplishments
- **AI-Agnostic Core**: Supports MCP (stdio/SSE) and OpenAPI.
- **Comprehensive Toolset (v2.0.0-phase3)**: 34 tools covering Accounts, Transactions, Categories, Tags, Bills, Recurring, Search, Piggy Banks, Rules, and Webhooks.
- **Automated Testing**: Robust suite using Jest and axios-mock-adapter.
- **Professional DevOps**: Clean history, Conventional Commits, and Detailed Technical Retrospectives on GitHub.

## 📜 Process & Documentation Standards
All future work on this project MUST adhere to the following:
1.  **Conventional Commits**: Use prefixes like `Feat:`, `Fix:`, `Docs:`, `Chore:`, and `Refactor:`.
2.  **Documentation Synchronization**: Every code change MUST be accompanied by an audit and update of ALL relevant `.md` files (README, API, PROMPTS, etc.).
3.  **Tool Reference**: `docs/API.md` MUST be kept exhaustive.
4.  **Prompt Gallery**: `docs/PROMPTS.md` MUST be updated with new examples for new tools.
5.  **Testing Standards**: Every new feature must include unit tests in `index.test.js`.

## 🗺️ Product Roadmap (V2.0 - Exhaustive API Integration)
- [x] **v1.x Foundations** (14 Core Tools)
- [x] **V2 Phase 1: Full Lifecycle (CRUD)** (v2.0.0-phase1)
- [x] **V2 Phase 2: Currencies & Metadata** (v2.0.0-phase2)
- [x] **V2 Phase 3: Automation & Rules** (v2.0.0-phase3)
- [ ] **V2 Phase 4: Attachments & Advanced Insight Tools** (v2.0.0-phase4)

## 🛠️ Global Setup Instructions
```powershell
gemini mcp add firefly node "W:/ai/gemini/firefly-iii/mcp-server/index.js" --scope user --env FIREFLY_URL="http://toshiba-laptop-ethernet:8081" --env FIREFLY_TOKEN="YOUR_TOKEN"
```
