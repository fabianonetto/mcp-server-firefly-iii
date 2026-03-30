# Firefly III Universal AI Bridge - Project State (v2.0.0 DEFINITIVE)

This project is a 100% sanitized, professional-grade, AI-agnostic bridge connecting [Firefly III](https://github.com/firefly-iii/firefly-iii) to the global AI ecosystem.

## 🚀 Accomplishments
- **Exhaustive API Coverage**: 47 tools implemented, covering every major Firefly III capability.
- **AI-Agnostic Core**: Supports MCP (stdio/SSE) and OpenAPI (for ChatGPT Actions).
- **Sanitized Environment**: All local paths, hostnames, and ports have been replaced with generic placeholders.
- **Wiped Git History**: A fresh, single-commit history has been force-pushed to GitHub to ensure security and privacy.
- **Automated Testing**: Robust suite using Jest and axios-mock-adapter.
- **Complete Documentation**: README, API Reference, and Prompt Gallery are 100% synchronized at v2.0.0.

## 📜 Process & Documentation Standards (INTERNAL)
All future work on this project MUST adhere to the following:
1.  **Conventional Commits**: Use standard prefixes (Feat:, Fix:, etc.).
2.  **Documentation Synchronization**: Every code change includes an update of all Markdown files.
3.  **Maximum Information Density**: Commit and issue messages must contain implementation and testing details.
4.  **Privacy First**: NEVER commit local paths or environment-specific details.

## 🗺️ Product Roadmap (Pushing to v3.0)
- [x] **v1.x Foundations** (14 Tools)
- [x] **v2.x Exhaustive API** (47 Tools)
- [ ] **V3 Phase 1: Advanced Financial Logic** - Transaction Linking & Budget Limits.
- [ ] **V3 Phase 2: Data Mastery & Organization** - Object Groups & Recurring CRUD.
- [ ] **V3 Phase 3: Insights & Administration** - Summary Reports & Exports.

## 🛠️ Global Setup Instructions
```powershell
gemini mcp add firefly node "/path/to/mcp-server/index.js" --scope user --env FIREFLY_URL="http://YOUR_HOST:YOUR_PORT" --env FIREFLY_TOKEN="YOUR_TOKEN"
```
