# Firefly III MCP Tool Reference

This document provides a detailed reference for all tools available in the Firefly III MCP Server.

## 🛠️ Available Tools

### System
- **`get_about`**: Get basic information and versioning from your Firefly III instance.
    - *Input*: None

### Accounts
- **`list_accounts`**: Retrieves all **Asset Accounts** and their current balances.
    - *Input*: None

### Transactions
- **`list_transactions`**: Fetches a list of recent transactions.
    - *Input Schema*:
        - `limit` (number, default: 10): Number of transactions to retrieve.
- **`search_transactions`**: Search for specific transactions using a query string.
    - *Input Schema*:
        - `query` (string): The search query (e.g., "Starbucks", "category:Food").
        - `limit` (number, optional): Max results to return.
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

### Organization
- **`list_budgets`**: Lists active budgets and their current spent vs. limit status.
    - *Input*: None
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
- **`list_bills`**: Retrieves a list of all defined bills and their status.
    - *Input*: None
- **`list_recurring`**: Lists all recurring transaction rules.
    - *Input*: None
