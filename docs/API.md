# Firefly III MCP Tool Reference (v2.0.0-phase4)

This document provides a detailed reference for all tools available in the Firefly III MCP Server.

## 🛠️ Available Tools

### System
- **`get_about`**: Get basic information and versioning from your Firefly III instance.

### Attachments
- **`list_attachments`**: Retrieves a list of all files uploaded to Firefly III.
- **`get_attachment`**: Get metadata for a specific attachment by ID.
- **`upload_attachment`**: Upload a new file (base64 encoded) to Firefly III.
    - *Input Schema*:
        - `filename` (string)
        - `attachable_type` (string): Either `Account` or `TransactionJournal`.
        - `attachable_id` (string): The ID of the parent resource.
        - `content` (string): Base64 string of the file.
- **`delete_attachment`**: Delete an attachment by ID.

### Charts & Insights
- **`get_account_overview_chart`**: Get pre-calculated balance trends for a date range.
    - *Input Schema*:
        - `start` (string): YYYY-MM-DD
        - `end` (string): YYYY-MM-DD

### Rules & Automation
- **`list_rules`**: Retrieves all automation rules.
- **`get_rule`**: Get a single rule by ID.
- **`create_rule`**: Store a new automation rule.
- **`update_rule`**: Update an existing automation rule.
- **`delete_rule`**: Delete an automation rule.
- **`list_rule_groups`**: List all rule groups.
- **`get_rule_group`**: Get a single rule group by ID.
- **`trigger_rule_group`**: Manually run all rules in a specific group.

### Webhooks
- **`list_webhooks`**: List all registered external webhooks.
- **`create_webhook`**: Create a new webhook.
- **`delete_webhook`**: Delete a webhook.

### Currencies
- **`list_currencies`**: Retrieves all currencies.
- **`update_currency`**: Update an existing currency.

### Preferences
- **`list_preferences`**: List all user preferences.
- **`get_preference`**: Get a specific preference by name.
- **`update_preference`**: Update a specific preference value.

### Accounts
- **`list_accounts`**: Retrieves all Asset Accounts.
- **`update_account`**: Update account details.
- **`delete_account`**: Permanently delete an account.

### Transactions
- **`list_transactions`**: Fetches a list of recent transactions.
- **`create_transaction`**: Records a new financial activity.
- **`update_transaction`**: Update an existing transaction.
- **`delete_transaction`**: Permanently delete a transaction group.

### Search
- **`search_transactions`**: Search using query strings.

### Budgets
- **`list_budgets`**: Lists active budgets.
- **`update_budget`**: Update a budget.
- **`delete_budget`**: Delete a budget.

### Categories & Tags
- **`list_categories`**: List all categories.
- **`create_category`**: Create a new category.
- **`list_tags`**: List all tags.
- **`create_tag`**: Create a new tag.

### Bills
- **`list_bills`**: Retrieves all bills.
- **`delete_bill`**: Delete a specific bill.

### Savings (Piggy Banks)
- **`list_piggy_banks`**: Lists all savings goals.
- **`update_piggy_bank`**: Add or remove money from a piggy bank.
- **`delete_piggy_bank`**: Delete a piggy bank.
