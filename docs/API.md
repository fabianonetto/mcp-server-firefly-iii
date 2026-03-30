# Firefly III MCP Tool Reference (v2.0.0-phase3)

This document provides a detailed reference for all tools available in the Firefly III MCP Server.

## 🛠️ Available Tools

### System
- **`get_about`**: Get basic information and versioning from your Firefly III instance.

### Rules & Automation
- **`list_rules`**: Retrieves all automation rules defined in the system.
- **`get_rule`**: Get a single rule by ID.
- **`create_rule`**: Store a new automation rule.
- **`update_rule`**: Update an existing automation rule.
- **`delete_rule`**: Delete an automation rule.
- **`list_rule_groups`**: List all rule groups.
- **`get_rule_group`**: Get a single rule group by ID.
- **`trigger_rule_group`**: Manually run all rules in a specific group.

### Webhooks
- **`list_webhooks`**: List all registered external webhooks.
- **`create_webhook`**: Create a new webhook for external notifications.
- **`delete_webhook`**: Delete a webhook.

### Currencies
- **`list_currencies`**: Retrieves all currencies defined in the system.
- **`update_currency`**: Update an existing currency (enable/disable).

### Preferences
- **`list_preferences`**: List all user preferences.
- **`get_preference`**: Get a specific preference by name.
- **`update_preference`**: Update a specific preference value.

### Accounts
- **`list_accounts`**: Retrieves all **Asset Accounts** and their balances.
- **`update_account`**: Update an existing account's details.
- **`delete_account`**: Permanently delete an account.

### Transactions
- **`list_transactions`**: Fetches a list of recent transactions.
- **`create_transaction`**: Records a new financial activity.
- **`update_transaction`**: Update an existing transaction description.
- **`delete_transaction`**: Permanently delete a transaction group.

### Search
- **`search_transactions`**: Search for transactions using a query string.

### Budgets
- **`list_budgets`**: Lists active budgets and their status.
- **`update_budget`**: Update a budget's name or status.
- **`delete_budget`**: Delete a budget.

### Categories & Tags
- **`list_categories`**: Lists all transaction categories.
- **`create_category`**: Creates a new category.
- **`list_tags`**: Lists all transaction tags.
- **`create_tag`**: Creates a new tag.

### Bills & Recurring
- **`list_bills`**: Retrieves a list of all defined bills.
- **`delete_bill`**: Delete a specific bill.
- **`list_recurring`**: Lists all recurring transaction rules.

### Savings (Piggy Banks)
- **`list_piggy_banks`**: Lists all savings goals and their progress.
- **`update_piggy_bank`**: Adds or removes money from a specific piggy bank.
- **`delete_piggy_bank`**: Delete a piggy bank.
