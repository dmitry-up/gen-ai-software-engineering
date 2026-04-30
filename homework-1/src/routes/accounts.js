const express = require('express');
const router = express.Router();
const { getAccountBalance, getAccountSummary } = require('../models/transaction');
const { calculateSimpleInterest } = require('../utils/helpers');

/**
 * GET /accounts/:accountId/balance
 * Get the current balance for an account.
 */
router.get('/:accountId/balance', (req, res) => {
  const { accountId } = req.params;
  const balanceInfo = getAccountBalance(accountId);

  if (!balanceInfo) {
    return res.status(404).json({
      error: 'Account not found',
      message: `No transactions found for account: ${accountId}`,
    });
  }

  res.json(balanceInfo);
});

/**
 * GET /accounts/:accountId/summary
 * Get transaction summary for an account:
 * - Total deposits
 * - Total withdrawals
 * - Number of transactions
 * - Most recent transaction date
 */
router.get('/:accountId/summary', (req, res) => {
  const { accountId } = req.params;
  const summary = getAccountSummary(accountId);

  if (!summary) {
    return res.status(404).json({
      error: 'Account not found',
      message: `No transactions found for account: ${accountId}`,
    });
  }

  res.json(summary);
});

/**
 * GET /accounts/:accountId/interest
 * Calculate simple interest on current balance.
 * Query params:
 *   ?rate=0.05  (annual interest rate, default 0.05)
 *   ?days=30    (number of days, default 30)
 */
router.get('/:accountId/interest', (req, res) => {
  const { accountId } = req.params;
  const rate = parseFloat(req.query.rate) || 0.05;
  const days = parseInt(req.query.days, 10) || 30;

  if (rate < 0 || rate > 1) {
    return res.status(400).json({
      error: 'Invalid rate',
      message: 'Rate must be between 0 and 1 (e.g. 0.05 for 5%)',
    });
  }

  if (days < 1 || days > 3650) {
    return res.status(400).json({
      error: 'Invalid days',
      message: 'Days must be between 1 and 3650',
    });
  }

  const balanceInfo = getAccountBalance(accountId);

  if (!balanceInfo) {
    return res.status(404).json({
      error: 'Account not found',
      message: `No transactions found for account: ${accountId}`,
    });
  }

  // Calculate interest for each currency balance
  const interestBreakdown = {};
  for (const [currency, balance] of Object.entries(balanceInfo.balances)) {
    interestBreakdown[currency] = {
      principal: Math.round(balance * 100) / 100,
      rate,
      days,
      interest: calculateSimpleInterest(balance, rate, days),
      totalAfterInterest: Math.round((balance + calculateSimpleInterest(balance, rate, days)) * 100) / 100,
    };
  }

  res.json({
    accountId,
    rate,
    days,
    interestBreakdown,
  });
});

module.exports = router;
