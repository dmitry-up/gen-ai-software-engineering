const express = require('express');
const router = express.Router();
const { validateTransaction } = require('../validators/transactionValidator');
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  getAllTransactions,
} = require('../models/transaction');
const { transactionsToCSV } = require('../utils/helpers');

/**
 * POST /transactions
 * Create a new transaction.
 */
router.post('/', (req, res) => {
  const errors = validateTransaction(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  const transaction = createTransaction(req.body);
  res.status(201).json(transaction);
});

/**
 * GET /transactions/export
 * Export all transactions as CSV.
 * Must be defined BEFORE the /:id route to avoid conflicts.
 */
router.get('/export', (req, res) => {
  const format = (req.query.format || 'csv').toLowerCase();

  if (format !== 'csv') {
    return res.status(400).json({
      error: 'Unsupported export format',
      message: 'Currently only CSV format is supported. Use ?format=csv',
    });
  }

  const transactions = getAllTransactions();
  const csv = transactionsToCSV(transactions);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
  res.send(csv);
});

/**
 * GET /transactions
 * List all transactions with optional filters:
 *   ?accountId=ACC-12345
 *   ?type=transfer
 *   ?from=2024-01-01&to=2024-01-31
 */
router.get('/', (req, res) => {
  const filters = {
    accountId: req.query.accountId || null,
    type: req.query.type || null,
    from: req.query.from || null,
    to: req.query.to || null,
  };

  const transactions = getTransactions(filters);
  res.json({
    count: transactions.length,
    transactions,
  });
});

/**
 * GET /transactions/:id
 * Get a specific transaction by ID.
 */
router.get('/:id', (req, res) => {
  const transaction = getTransactionById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      error: 'Transaction not found',
      message: `No transaction found with ID: ${req.params.id}`,
    });
  }

  res.json(transaction);
});

module.exports = router;
