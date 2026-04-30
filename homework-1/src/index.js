const express = require('express');
const transactionRoutes = require('./routes/transactions');
const accountRoutes = require('./routes/accounts');
const { rateLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/transactions', transactionRoutes);
app.use('/accounts', accountRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Banking Transactions API',
    version: '1.0.0',
    endpoints: {
      transactions: '/transactions',
      accounts: '/accounts/:accountId/balance',
      summary: '/accounts/:accountId/summary',
      interest: '/accounts/:accountId/interest',
      export: '/transactions/export',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Only start the server when run directly (not when imported by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🏦 Banking Transactions API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
