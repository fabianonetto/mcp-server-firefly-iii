# Firefly III MCP Tool Reference (v2.0.0)

This document provides a definitive list of all 47 tools available in the Firefly III AI Bridge.

## 🛠️ Tool Registry

### 🏗️ System
- `get_about`: Connection and version details.

### 💰 Accounts
- `list_accounts`: Search and list all accounts by type.
- `get_account`: Retrieve details for a specific account.
- `create_account`: Initialize a new account.
- `update_account`: Modify account properties.
- `delete_account`: Permanently remove an account.

### 💸 Transactions
- `list_transactions`: History retrieval with pagination.
- `get_transaction`: Deep-dive into a specific transaction.
- `create_transaction`: Intelligent recording (Withdrawal/Deposit/Transfer).
- `update_transaction`: Correct transaction groups.
- `delete_transaction`: Remove financial records.
- `search_transactions`: Powerful query-based search.

### 📊 Organization
- `list_budgets`: Overview of spending limits.
- `get_budget`: Specific budget details.
- `create_budget`: Set up a new budget category.
- `update_budget`: Change budget limits/names.
- `delete_budget`: Remove a budget.
- `list_categories` / `create_category`: Category management.
- `list_tags` / `create_tag`: Labeling and organization.

### 📅 Bills & Recurring
- `list_bills`: Track upcoming obligations.
- `create_bill`: Define a new regular bill.
- `delete_bill`: Stop tracking a bill.
- `list_recurring`: Review automated transaction rules.

### 🐷 Savings (Piggy Banks)
- `list_piggy_banks`: View all savings goals.
- `create_piggy_bank`: Start a new goal.
- `update_piggy_bank`: Move money in/out of goals.
- `delete_piggy_bank`: Close a savings goal.

### 🧠 Automation (Rules)
- `list_rules`: View all system logic.
- `get_rule`: Read a specific rule.
- `create_rule`: Store new automation logic.
- `update_rule`: Modify existing rules.
- `delete_rule`: Remove automation logic.
- `list_rule_groups`: View logic collections.
- `get_rule_group`: Read a specific group.
- `trigger_rule_group`: Manually execute automation sets.

### 🔗 Webhooks
- `list_webhooks`: View external integrations.
- `create_webhook`: Add a notification target.
- `delete_webhook`: Remove an integration.

### 🌍 Currencies & Preferences
- `list_currencies`: View all defined currencies.
- `update_currency`: Enable/disable specific currencies.
- `list_preferences`: View user UI/system settings.
- `get_preference`: Read a specific setting.
- `update_preference`: Change system behavior.

### 📁 Attachments & Insights
- `list_attachments`: View all uploaded files.
- `get_attachment`: Metadata for specific files.
- `upload_attachment`: Store new receipts (Base64).
- `delete_attachment`: Remove files.
- `get_account_overview_chart`: Retrieve pre-calculated trend data.
