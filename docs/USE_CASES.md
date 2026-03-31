# Firefly III AI Bridge: Advanced Use Cases

This guide explores high-level strategies for using your AI assistant to achieve absolute financial mastery.

## 🏛️ The Tax Assistant
**Goal**: Prepare data for annual tax filing.
- **Strategy**: 
    1. Tag relevant spending throughout the year as `#TaxDeductible`.
    2. At year-end, ask: *"Find all transactions from 2025 tagged as 'TaxDeductible'. Group them by category and give me the total for each."*
- **Tools Used**: `search_transactions`, `list_categories`.

## 🔍 The Subscription Auditor
**Goal**: Identify and eliminate "zombie" subscriptions.
- **Strategy**: 
    1. Ask: *"List all my recurring transactions and recurring rules."*
    2. Then ask: *"Search for any monthly bills that have increased in price in the last 6 months."*
    3. The AI will compare historical search results with current recurring rules to spot price hikes.
- **Tools Used**: `list_recurring`, `search_transactions`.

## 🐷 The Savings Counselor
**Goal**: Reach a savings goal faster by optimizing spending.
- **Strategy**:
    1. Ask: *"How much have I spent on 'Dining Out' this month compared to my budget?"*
    2. Then ask: *"If I want to reach my 'New House' piggy bank goal 2 months earlier, how much do I need to move from 'Dining Out' to that piggy bank every week?"*
- **Tools Used**: `list_budgets`, `get_spending_summary`, `update_piggy_bank`.

## 📁 The Receipt Manager
**Goal**: Ensure every major purchase is documented.
- **Strategy**:
    1. Upload a receipt via base64.
    2. Ask: *"Find my most recent transaction at 'Apple Store' and attach this file to it."*
- **Tools Used**: `search_transactions`, `upload_attachment`.

## 🩺 The "Firefly Doctor"
**Goal**: Ensure system health and data integrity.
- **Strategy**:
    1. Ask: *"Run a system audit. Are all my accounts active? Do all my active budgets have a limit set for this period?"*
- **Tools Used**: `get_about`, `list_accounts`, `list_budgets`, `list_budget_limits`.
