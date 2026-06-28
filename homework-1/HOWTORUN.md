# ▶️ How to Run the Application

## Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **npm** (comes bundled with Node.js)

## Quick Start

### 1. Install Dependencies

```bash
cd homework-1
npm install
```

### 2. Start the Server

```bash
npm start
```

The API will be available at: **http://localhost:3000**

You should see:
```
🏦 Banking Transactions API running on http://localhost:3000
```

### Alternative: Development Mode (auto-restart on file changes)

```bash
npm run dev
```

### Alternative: Using the Demo Scripts

**Windows:**
```bash
demo\run.bat
```

**Linux / macOS:**
```bash
chmod +x demo/run.sh
./demo/run.sh
```

---

## 🧪 Testing the API

### Option 1: VS Code REST Client

Open `demo/sample-requests.http` in VS Code with the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) and click "Send Request" above each request.

### Option 2: curl (Bash / Git Bash / WSL)

```bash
# Health check
curl http://localhost:3000/

# Create a deposit
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "toAccount": "ACC-12345",
    "amount": 1000.00,
    "currency": "USD",
    "type": "deposit"
  }'

# Create a transfer
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "fromAccount": "ACC-12345",
    "toAccount": "ACC-67890",
    "amount": 250.50,
    "currency": "USD",
    "type": "transfer"
  }'

# List all transactions
curl http://localhost:3000/transactions

# Filter by account
curl "http://localhost:3000/transactions?accountId=ACC-12345"

# Filter by type
curl "http://localhost:3000/transactions?type=transfer"

# Get account balance
curl http://localhost:3000/accounts/ACC-12345/balance

# Get account summary
curl http://localhost:3000/accounts/ACC-12345/summary

# Calculate interest (5% annual rate, 30 days)
curl "http://localhost:3000/accounts/ACC-12345/interest?rate=0.05&days=30"

# Export transactions as CSV
curl "http://localhost:3000/transactions/export?format=csv"
```

### Option 3: PowerShell

```powershell
# Health check
Invoke-RestMethod -Uri http://localhost:3000/ | ConvertTo-Json

# Create a deposit
$body = '{"toAccount":"ACC-12345","amount":1000,"currency":"USD","type":"deposit"}'
Invoke-RestMethod -Uri http://localhost:3000/transactions -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json

# Get all transactions
Invoke-RestMethod -Uri http://localhost:3000/transactions | ConvertTo-Json -Depth 5

# Get balance
Invoke-RestMethod -Uri http://localhost:3000/accounts/ACC-12345/balance | ConvertTo-Json -Depth 5
```

---

## 📌 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the server listens on |

Example:
```bash
PORT=8080 npm start
```

---

## 🛑 Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.