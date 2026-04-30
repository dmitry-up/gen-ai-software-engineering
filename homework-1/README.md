# 🏦 Homework 1: Banking Transactions API

> **Student Name**: Dmitry Upatov
> **Date Submitted**: 2026-04-30
> **AI Tools Used**: Antigravity (Google Deepmind)

---

## 📋 Project Overview

A fully-featured Banking Transactions REST API built with **Node.js** and **Express.js**. The API provides in-memory storage for financial transactions with comprehensive validation, filtering, account summaries, interest calculation, CSV export, and rate limiting.

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

This project was developed with the assistance of **Antigravity** (Google Deepmind) — an AI coding assistant integrated into the IDE. The AI was used for:

- Generating the project structure and boilerplate
- Implementing all API endpoints and business logic
- Writing validation rules and error handling
- Creating test files and documentation
- Code review and testing

<div align="center">

*This project was completed as part of the AI-Assisted Development course.*

</div>
