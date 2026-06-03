# 🏦 Homework 1: Banking Transactions API

> **Student Name**: Dmitry Upatov
> **Date Submitted**: 2026-04-30
> **AI Tools Used**: Antigravity (Google Deepmind)

---

## 📋 Project Overview

A Banking Transactions REST API built with **Node.js** and **Express.js**. It models the core
operations of a simple ledger: clients post **deposits**, **withdrawals**, and **transfers**, and the
API derives everything else — per-account balances, transaction history, summaries, and interest —
from that single stream of transactions.

There is no database: transactions live in an in-memory array for the lifetime of the process, which
keeps the project focused on API design and business logic rather than persistence. The codebase is
split into thin transport (routes), business logic (model), input validation (validator), and
cross-cutting concerns (rate-limiting middleware, helpers), so each task from the assignment maps to a
clearly identifiable place in the source tree.

### Key design decisions

- **Balances are computed, not stored.** An account has no standalone record — its balance is the
  reduction of every completed transaction touching it. This avoids a class of consistency bugs where a
  stored balance drifts from the underlying transactions.
- **Balances are grouped by currency.** Amounts in different currencies are never summed; a single
  account can hold `USD` and `EUR` positions side by side. The API returns a `balances` map rather than
  one figure.
- **Validation is type-aware.** Required accounts depend on the transaction type — `deposit` needs
  `toAccount`, `withdrawal` needs `fromAccount`, `transfer` needs both (and they must differ).
- **Route ordering matters.** `GET /transactions/export` is declared before `GET /transactions/:id` so
  the literal `export` segment is not captured as an `:id`.

### ✅ Implemented Tasks

| Task | Description | Status |
|------|-------------|--------|
| **Task 1** | Core API (CRUD endpoints + balance) | ✅ Done |
| **Task 2** | Transaction Validation (amount, account, currency) | ✅ Done |
| **Task 3** | Transaction Filtering (account, type, date range) | ✅ Done |
| **Task 4A** | Account Summary Endpoint | ✅ Done |
| **Task 4B** | Simple Interest Calculation | ✅ Done |
| **Task 4C** | Transaction CSV Export | ✅ Done |
| **Task 4D** | Rate Limiting (100 req/min per IP) | ✅ Done |

---

## 🏗️ Architecture

```
homework-1/
├── 📄 README.md                  # Project overview (this file)
├── 📄 HOWTORUN.md                # Step-by-step run instructions
├── 📄 TASKS.md                   # Original assignment description
├── 📄 package.json               # Node.js dependencies & scripts
├── 📄 .gitignore                 # Git ignore rules
├── 📂 src/
│   ├── index.js                  # Express app entry point
│   ├── 📂 routes/
│   │   ├── transactions.js       # Transaction endpoints
│   │   └── accounts.js           # Account endpoints (balance, summary, interest)
│   ├── 📂 models/
│   │   └── transaction.js        # In-memory storage & business logic
│   ├── 📂 validators/
│   │   └── transactionValidator.js  # Input validation rules
│   ├── 📂 middleware/
│   │   └── rateLimiter.js        # Rate limiting middleware
│   └── 📂 utils/
│       └── helpers.js            # CSV export & interest calculation
├── 📂 docs/
│   └── 📂 screenshots/          # Screenshots of AI interactions & API testing
└── 📂 demo/
    ├── run.bat                   # Windows start script
    ├── run.sh                    # Linux/macOS start script
    ├── sample-requests.http      # VS Code REST Client test requests
    └── sample-data.json          # Sample transaction data
```

---

## 🔌 API Endpoints

### Core Endpoints (Task 1)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/transactions` | Create a new transaction |
| `GET` | `/transactions` | List all transactions (with optional filters) |
| `GET` | `/transactions/:id` | Get a specific transaction by ID |
| `GET` | `/accounts/:accountId/balance` | Get account balance |

### Additional Endpoints (Task 4)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/accounts/:accountId/summary` | Account transaction summary |
| `GET` | `/accounts/:accountId/interest` | Simple interest calculation |
| `GET` | `/transactions/export?format=csv` | Export transactions as CSV |

---

## 🛡️ Validation Rules (Task 2)

- **Amount**: Must be a positive number with at most 2 decimal places
- **Account format**: Must match `ACC-XXXXX` (X = alphanumeric character)
- **Currency**: Must be a valid ISO 4217 code (USD, EUR, GBP, JPY, UAH, etc.)
- **Type**: Must be one of `deposit`, `withdrawal`, or `transfer`
- **Type-specific**: `transfer` requires both `fromAccount` and `toAccount`; `deposit` requires `toAccount`; `withdrawal` requires `fromAccount`

---

## 🔍 Filtering (Task 3)

The `GET /transactions` endpoint supports query parameters:

| Parameter | Example | Description |
|-----------|---------|-------------|
| `accountId` | `?accountId=ACC-12345` | Filter by account (from or to) |
| `type` | `?type=transfer` | Filter by transaction type |
| `from` | `?from=2026-01-01` | Filter from date (inclusive) |
| `to` | `?to=2026-12-31` | Filter to date (inclusive) |

Filters can be combined: `?accountId=ACC-12345&type=deposit`

---

## 🚦 Rate Limiting (Task 4D)

- **Limit**: 100 requests per minute per IP address
- **Response**: `429 Too Many Requests` with `Retry-After` header when exceeded

---

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **UUID Generation**: `uuid` package (v14)
- **Storage**: In-memory (no database required)

---

## 🤖 AI Tools Usage

The project was built with **Antigravity** (Google DeepMind), an AI coding assistant integrated into
the IDE. Rather than generating the whole app from one prompt, the work was done iteratively — scaffold
first, then one task at a time, reviewing and correcting the output at each step.

### Workflow

1. **Scaffold.** Asked the assistant to set up an Express project with the folder layout from the
   assignment (`routes/`, `models/`, `validators/`, `middleware/`, `utils/`) and a runnable entry point.
2. **Task-by-task implementation.** Each task from `TASKS.md` was a separate prompt — core endpoints,
   then validation, then filtering, then the optional features. This kept diffs small and reviewable.
3. **Review and correct.** Generated code was read, not blindly accepted. Several outputs needed
   correction (see below).
4. **Docs and demo.** README, `HOWTORUN.md`, and the `demo/` sample requests were generated last, once
   the API behaviour was final.

### Representative prompts

- *"Create an Express REST API with in-memory storage for banking transactions. Endpoints: POST/GET
  `/transactions`, GET `/transactions/:id`, GET `/accounts/:id/balance`. Follow this folder structure…"*
- *"Add validation: amount must be positive with at most 2 decimal places, accounts match `ACC-XXXXX`,
  currency must be a valid ISO 4217 code. Return a `{ error, details[] }` shape."*
- *"Add query filters to GET `/transactions`: accountId, type, and a from/to date range that can be
  combined."*
- *"Add account summary, simple-interest, CSV export, and a 100-req/min-per-IP rate limiter."*

### Where the AI needed correction

- **Route ordering.** The first version put `GET /transactions/:id` before `/export`, so the export
  endpoint was swallowed by the `:id` param. Reordered the routes manually.
- **Single-currency balance.** The initial balance logic summed all amounts regardless of currency.
  Prompted a rewrite to group balances per currency.
- **Decimal-place check.** The naive `amount * 100 % 1` approach was replaced with a string-based check
  to avoid floating-point false positives.

### Takeaway

The AI was strong at boilerplate, consistent error shapes, and documentation, but business rules
(currency handling, route precedence, money rounding) still required a developer to read the output and
push back. Small, focused prompts produced better results than one large one.

<div align="center">

*This project was completed as part of the AI-Assisted Development course.*

</div>
