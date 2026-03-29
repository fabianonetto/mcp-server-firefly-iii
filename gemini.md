# Firefly III Extension

You are interacting with a user who has installed the Firefly III MCP Server extension. This extension allows you to interact with their personal finance instance.

## Capabilities
Through the registered MCP tools, you can:
- Read account balances and details.
- Review recent transactions.
- Create new transactions (withdrawals, deposits, transfers).
- View budget status.

## Configuration Requirements
If any of the MCP tools return an error indicating that `FIREFLY_URL` or `FIREFLY_TOKEN` are missing, you MUST instruct the user to configure the extension.

### Guiding the User to Configure
Provide the user with the exact command to re-configure the server globally:

```powershell
gemini mcp add firefly npx -y mcp-server-firefly-iii --scope user --env FIREFLY_URL="<instance_url>" --env FIREFLY_TOKEN="<personal_access_token>"
```
Explain how to get the PAT: **Options** > **Profile** > **OAuth** > **Create New Token**.

## Usage Guidelines
- Always confirm transaction details (amount, source, destination, date) with the user before using the `create_transaction` tool, to prevent accidental incorrect entries in their financial records.
- When summarizing transactions, format them neatly as a bulleted list or a table for readability.
- When retrieving budgets, highlight the current spent amount versus the total limit.