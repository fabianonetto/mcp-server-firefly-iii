# Firefly III MCP Tool Reference (v2.0.0-phase1)

This document provides a detailed reference for all tools available in the Firefly III MCP Server.

## 🛠️ Available Tools

### System
- **`get_about`**: Get basic information and versioning from your Firefly III instance.
    - *Input*: None

### Accounts
- **`list_accounts`**: Retrieves all **Asset Accounts** and their current balances.
    - *Input*: None
- **`update_account`**: Update an existing account's details (name, active status, notes).
    - *Input Schema*:
        - `id` (string): Unique account ID.
        - `name` (string, optional)
        - `active` (boolean, optional)
        - `notes` (string, optional)
- **`delete_account`**: Permanently delete an account.
    - *Input Schema*:
        - `id` (string): Unique account ID.

### Transactions
- **`list_transactions`**: Fetches a list of recent transactions.
    - *Input Schema*:
        - `limit` (number, default: 10): Number of transactions to retrieve.
- **`create_transaction`**: Records a new financial activity.
    - *Input Schema*:
        - `type` (string, enum: `withdrawal`, `deposit`, `transfer`): The transaction type.
        - `amount` (string): The currency amount.
        - `description` (string): Brief description.
        - `source_name` (string): Name of the source account.
        - `destination_name` (string): Name of the destination account.
        - `category_name` (string, optional): Category to assign.
        - `tags` (array of strings, optional): List of tags.
        - `date` (string, optional): ISO 8601 date.
- **`update_transaction`**: Update an existing transaction's description or category.
    - *Input Schema*:
        - `id` (string): Transaction group ID.
        - `description` (string, optional)
        - `category_name` (string, optional)
- **`delete_transaction`**: Permanently delete a transaction group.
    - *Input Schema*:
        - `id` (string): Transaction group ID.

### Search
- **`search_transactions`**: Search for specific transactions using a query string.
    - *Input Schema*:
        - `query` (string): The search query (e.g., "Starbucks", "category:Food").
        - `limit` (number, optional): Max results to return.

### Budgets
- **`list_budgets`**: Lists active budgets and their status.
    - *Input*: None
- **`update_budget`**: Update a budget's name or active status.
    - *Input Schema*:
        - `id` (string): Unique budget ID.
        - `name` (string, optional)
        - `active` (boolean, optional)
- **`delete_budget`**: Delete a budget.
    - *Input Schema*:
        - `id` (string): Unique budget ID.

### Categories & Tags
- **`list_categories`**: Lists all transaction categories.
    - *Input*: None
- **`create_category`**: Creates a new category.
    - *Input Schema*:
        - `name` (string): The category name.
- **`list_tags`**: Lists all transaction tags.
    - *Input*: None
- **`create_tag`**: Creates a new tag.
    - *Input Schema*:
        - `tag` (string): The tag name.

### Bills & Recurring
- **`list_bills`**: Retrieves a list of all defined bills.
    - *Input*: None
- **`delete_bill`**: Delete a specific bill.
    - *Input Schema*:
        - `id` (string): Unique bill ID.
- **`list_recurring`**: Lists all recurring transaction rules.
    - *Input*: None

### Savings (Piggy Banks)
- **`list_piggy_banks`**: Lists all savings goals and their progress.
    - *Input*: None
- **`update_piggy_bank`**: Adds or removes money from a specific piggy bank.
    - *Input Schema*:
        - `id` (string): The unique ID of the piggy bank.
        - `amount` (string): Amount to add (positive) or remove (negative).
- **`delete_piggy_bank`**: Delete a piggy bank.
    - *Input Schema*:
        - `id` (string): The unique ID of the piggy bank.
