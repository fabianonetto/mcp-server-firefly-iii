# Firefly III Universal AI Bridge - Project State (v2.0.0)

This project is a professional-grade, AI-agnostic bridge connecting [Firefly III](https://github.com/firefly-iii/firefly-iii) to the global AI ecosystem.

## 🚀 Accomplishments
- **AI-Agnostic Core**: Supports MCP (stdio/SSE) and OpenAPI (Custom GPTs).
- **100% API Coverage**: 47 tools covering every major Firefly III capability.
- **Automated Testing**: Robust suite using Jest and axios-mock-adapter (`npm test`).
- **Professional DevOps**: Clean history, Conventional Commits, and GitHub Milestone completion.

## 📜 Process & Documentation Standards (INTERNAL)
All future work on this project MUST adhere to the following:
1.  **Conventional Commits**: Use prefixes like `Feat:`, `Fix:`, `Docs:`, `Chore:`, and `Refactor:`.
2.  **Documentation Synchronization**: Every code change includes an update of all Markdown files.
3.  **Maximum Information Density**: Commit and issue messages must contain implementation and testing details.

## 🗺️ Product Roadmap: 100% COMPLETE
- [x] **v1.x Foundations** (14 Initial Tools)
- [x] **V2 Phase 1: Full Lifecycle (CRUD)** (22 Tools)
- [x] **V2 Phase 2: Currencies & Metadata** (30 Tools)
- [x] **V2 Phase 3: Automation & Rules** (39 Tools)
- [x] **V2 Phase 4: Attachments & Insights** (47 Final Tools)

## 🛠️ Global Setup Instructions
```powershell
gemini mcp add firefly node "/path/to/mcp-server/index.js" --scope user --env FIREFLY_URL="http://YOUR_HOST:YOUR_PORT" --env FIREFLY_TOKEN="YOUR_TOKEN"
```
