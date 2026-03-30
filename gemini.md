# Firefly III Universal AI Bridge - Project State

This project is a professional-grade, AI-agnostic bridge connecting [Firefly III](https://github.com/firefly-iii/firefly-iii) to the global AI ecosystem.

## 🚀 Accomplishments
- **AI-Agnostic Core**: Supports MCP (stdio/SSE) and OpenAPI.
- **Comprehensive Toolset (v1.4.0)**: 14 tools covering Accounts, Transactions, Categories, Tags, Bills, Recurring rules, Search, and Piggy Banks.
- **Automated Testing**: Robust suite using Jest and axios-mock-adapter.
- **Professional DevOps**: Clean history, Conventional Commits, and GitHub Roadmap (Phase 1 100% Complete).
- **User Support**: Comprehensive Prompt Gallery created in `docs/PROMPTS.md`.

## 📜 Process & Documentation Standards
All future work on this project MUST adhere to the following:
1.  **Conventional Commits**: Use prefixes like `Feat:`, `Fix:`, `Docs:`, `Chore:`, and `Refactor:`.
2.  **Tool Reference**: Every time a tool is added or modified, `docs/API.md` MUST be updated.
3.  **Testing Standards**: Every new feature must include unit tests in `index.test.js`.
4.  **Issue Management**: Link all commits to the corresponding V2 roadmap issues.

## 🗺️ Product Roadmap (V2.0 - Exhaustive API Integration)
- [x] **v1.x Foundations** (14 Initial Tools)
- [ ] **V2 Phase 1: Full Lifecycle Management (CRUD)** - Add Update/Delete for all resources.
- [ ] **V2 Phase 2: Currencies & System Metadata** - Support for multiple currencies and preferences.
- [ ] **V2 Phase 3: Automation, Rules & Webhooks** - Trigger and manage system logic.
- [ ] **V2 Phase 4: Attachments & Advanced Insight Tools** - Support for receipts and pre-calculated reports.

## 🛠️ Global Setup Instructions
```powershell
gemini mcp add firefly node "W:/ai/gemini/firefly-iii/mcp-server/index.js" --scope user --env FIREFLY_URL="http://toshiba-laptop-ethernet:8081" --env FIREFLY_TOKEN="YOUR_TOKEN"
```
