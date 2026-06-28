const crypto = require('crypto');

/**
 * In-memory transaction storage.
 * Each transaction follows the schema:
 * {
 *   id: string (auto-generated UUID),
 *   fromAccount: string,
 *   toAccount: string,
 *   amount: number,
 *   currency: string (ISO 4217),
 *   type: 'deposit' | 'withdrawal' | 'transfer',
 *   timestamp: string (ISO 8601),
 *   status: 'pending' | 'completed' | 'failed'
 * }
 */

const transactions = [];

/**
 * Create a new transaction and store it.
 * @param {object} data - Transaction data from the request body.
 * @returns {object} The created transaction with generated id, timestamp, and status.
 */
function createTransaction(data) {
  const transaction = {
    id: crypto.randomUUID(),
    fromAccount: data.fromAccount || null,
    toAccount: data.toAccount || null,
    amount: data.amount,
    currency: data.currency.toUpperCase(),
    type: data.type,
    timestamp: new Date().toISOString(),
    status: 'completed',
  };
  transactions.push(transaction);
  return transaction;
}

/**
 * Retrieve all transactions, optionally filtered.
 * @param {object} filters - Optional filters: accountId, type, from, to.
 * @returns {object[]} Filtered array of transactions.
 */
function getTransactions(filters = {}) {
  let result = [...transactions];

  // Filter by accountId (matches either fromAccount or toAccount)
  if (filters.accountId) {
    result = result.filter(
      (t) => t.fromAccount === filters.accountId || t.toAccount === filters.accountId
    );
  }

  // Filter by transaction type
  if (filters.type) {
    result = result.filter((t) => t.type === filters.type);
  }

  // Filter by date range
  if (filters.from) {
    const fromDate = new Date(filters.from);
    result = result.filter((t) => new Date(t.timestamp) >= fromDate);
  }
  if (filters.to) {
    const toDate = new Date(filters.to);
    // Set to end of day for inclusive filtering
    toDate.setHours(23, 59, 59, 999);
    result = result.filter((t) => new Date(t.timestamp) <= toDate);
  }

  return result;
}

/**
 * Find a transaction by its ID.
 * @param {string} id - The transaction UUID.
 * @returns {object|undefined} The matching transaction or undefined.
 */
function getTransactionById(id) {
  return transactions.find((t) => t.id === id);
}

/**
 * Calculate the balance for a given account.
 * Deposits and incoming transfers increase the balance.
 * Withdrawals and outgoing transfers decrease the balance.
 * @param {string} accountId - The account identifier.
 * @returns {object} Balance info including the account ID, balance, and currency.
 */
function getAccountBalance(accountId) {
  const accountTransactions = transactions.filter(
    (t) =>
      (t.fromAccount === accountId || t.toAccount === accountId) &&
      t.status === 'completed'
  );

  if (accountTransactions.length === 0) {
    return null;
  }

  // Group balances by currency
  const balances = {};

  for (const t of accountTransactions) {
    const currency = t.currency;
    if (!balances[currency]) {
      balances[currency] = 0;
    }

    if (t.type === 'deposit' && t.toAccount === accountId) {
      balances[currency] += t.amount;
    } else if (t.type === 'withdrawal' && t.fromAccount === accountId) {
      balances[currency] -= t.amount;
    } else if (t.type === 'transfer') {
      if (t.fromAccount === accountId) {
        balances[currency] -= t.amount;
      }
      if (t.toAccount === accountId) {
        balances[currency] += t.amount;
      }
    }
  }

  return {
    accountId,
    balances,
    transactionCount: accountTransactions.length,
  };
}

/**
 * Generate an account summary.
 * @param {string} accountId - The account identifier.
 * @returns {object|null} Summary object or null if no transactions exist.
 */
function getAccountSummary(accountId) {
  const accountTransactions = transactions.filter(
    (t) =>
      (t.fromAccount === accountId || t.toAccount === accountId) &&
      t.status === 'completed'
  );

  if (accountTransactions.length === 0) {
    return null;
  }

  let totalDeposits = 0;
  let totalWithdrawals = 0;

  for (const t of accountTransactions) {
    if (t.type === 'deposit' && t.toAccount === accountId) {
      totalDeposits += t.amount;
    } else if (t.type === 'withdrawal' && t.fromAccount === accountId) {
      totalWithdrawals += t.amount;
    } else if (t.type === 'transfer') {
      if (t.toAccount === accountId) {
        totalDeposits += t.amount;
      }
      if (t.fromAccount === accountId) {
        totalWithdrawals += t.amount;
      }
    }
  }

  // Find the most recent transaction
  const sorted = [...accountTransactions].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return {
    accountId,
    totalDeposits: Math.round(totalDeposits * 100) / 100,
    totalWithdrawals: Math.round(totalWithdrawals * 100) / 100,
    numberOfTransactions: accountTransactions.length,
    mostRecentTransactionDate: sorted[0].timestamp,
  };
}

/**
 * Get all transactions (unfiltered) for export purposes.
 * @returns {object[]} All stored transactions.
 */
function getAllTransactions() {
  return [...transactions];
}

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  getAccountBalance,
  getAccountSummary,
  getAllTransactions,
};
