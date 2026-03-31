# Firefly III MCP Tool Reference (v3.0.0 DEFINITIVE)

This document provides a definitive list of all 66 tools available in the Firefly III AI Bridge.

## 🛠️ Tool Registry

### 🏗️ System
- `get_about`: Connection and version details.

### 💸 Transactions (Exhaustive)
- `list_transactions`: History retrieval with pagination.
- `get_transaction`: Deep-dive into a specific transaction.
- `create_transaction`: Intelligent recording (Simple).
- `create_split_transaction`: Create a single entry with multiple categories/amounts (e.g., one grocery receipt split into Food and Household).
- `update_transaction`: Correct transaction group descriptions.
- `delete_transaction`: Remove financial records.
- `search_transactions`: Powerful query-based search.

### 🔗 Transaction Linking (v3.0)
- `list_link_types`: List available link relationships.
- `link_transactions`: Create a logical link between two transaction journals.
- `list_transaction_links`: View links for a specific transaction.

### 📉 Budget Limits (v3.0)
- `list_budget_limits`: View monetary limits for specific periods.
- `create_budget_limit`: Set a new limit for a budget.
- `delete_budget_limit`: Remove a period limit.

### 📁 Object Groups (v3.0)
- `list_object_groups`: View groups used for organizing accounts/piggy banks.
- `create_object_group`: Group resources for better AI organization.

### 🔄 Recurring Transactions (v3.0)
- `list_recurring`: Review all automated transaction rules.
- `get_recurring`: Get details for a specific recurrence.
- `create_recurring`: Set up new automated transaction rules.
- `update_recurring`: Modify recurrence properties.
- `delete_recurring`: Stop an automated recurrence.

### 📊 Advanced Insights
- `get_net_worth_summary`: Rapid overview of net worth trends.
- `get_spending_summary`: Category-based spending reports for a period.
- `get_account_overview_chart`: Pre-calculated balance trend data.

### 🛡️ Administration
- `trigger_export`: AI-initiated data backups (CSV/JSON).

### 💰 Accounts
- `list_accounts`: Search and list all accounts by type.
- `get_account`: Retrieve details for a specific account.
- `create_account`: Initialize a new account (supports opening balances).
- `update_account`: Modify account properties.
- `delete_account`: Permanently remove an account.

### 📊 Organization
- `list_budgets`: Overview of spending limits.
- `get_budget`: Specific budget details.
- `create_budget`: Set up a new budget category.
- `update_budget`: Change budget limits/names.
- `delete_budget`: Remove a budget.
- `list_categories` / `create_category`: Category management.
- `list_tags` / `create_tag`: Labeling and organization.

### 📅 Bills
- `list_bills`: Track upcoming obligations.
- `create_bill`: Define a new regular bill.
- `delete_bill`: Stop tracking a bill.

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

### 📁 Attachments
- `list_attachments`: View all uploaded files.
- `get_attachment`: Metadata for specific files.
- `upload_attachment`: Store new receipts.
- `delete_attachment`: Remove files.
