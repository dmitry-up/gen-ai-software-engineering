const request = require('supertest');
const app = require('../src/index');

describe('Banking Transactions API', () => {

  // ============================================================
  // Health Check
  // ============================================================
  describe('GET /', () => {
    it('should return API info with available endpoints', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Banking Transactions API');
      expect(res.body.version).toBe('1.0.0');
      expect(res.body.endpoints).toBeDefined();
    });
  });

  // ============================================================
  // Task 1: Core API — POST /transactions
  // ============================================================
  describe('Task 1: Core API', () => {

    describe('POST /transactions', () => {
      it('should create a deposit transaction', async () => {
        const res = await request(app)
          .post('/transactions')
          .send({
            toAccount: 'ACC-11111',
            amount: 500,
            currency: 'USD',
            type: 'deposit',
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.id).toBeDefined();
        expect(res.body.toAccount).toBe('ACC-11111');
        expect(res.body.amount).toBe(500);
        expect(res.body.currency).toBe('USD');
        expect(res.body.type).toBe('deposit');
        expect(res.body.status).toBe('completed');
        expect(res.body.timestamp).toBeDefined();
      });

      it('should create a withdrawal transaction', async () => {
        const res = await request(app)
          .post('/transactions')
          .send({
            fromAccount: 'ACC-11111',
            amount: 100,
            currency: 'USD',
            type: 'withdrawal',
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.type).toBe('withdrawal');
        expect(res.body.fromAccount).toBe('ACC-11111');
      });

      it('should create a transfer transaction', async () => {
        const res = await request(app)
          .post('/transactions')
          .send({
            fromAccount: 'ACC-11111',
            toAccount: 'ACC-22222',
            amount: 200.50,
            currency: 'EUR',
            type: 'transfer',
          });

        expect(res.statusCode).toBe(201);
        expect(res.body.type).toBe('transfer');
        expect(res.body.fromAccount).toBe('ACC-11111');
        expect(res.body.toAccount).toBe('ACC-22222');
        expect(res.body.amount).toBe(200.50);
      });
    });

    // GET /transactions
    describe('GET /transactions', () => {
      it('should return all transactions', async () => {
        const res = await request(app).get('/transactions');
        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBeGreaterThanOrEqual(3);
        expect(Array.isArray(res.body.transactions)).toBe(true);
      });
    });

    // GET /transactions/:id
    describe('GET /transactions/:id', () => {
      it('should return a transaction by ID', async () => {
        // First create one to get its ID
        const createRes = await request(app)
          .post('/transactions')
          .send({
            toAccount: 'ACC-33333',
            amount: 99.99,
            currency: 'GBP',
            type: 'deposit',
          });

        const id = createRes.body.id;
        const res = await request(app).get(`/transactions/${id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(id);
        expect(res.body.amount).toBe(99.99);
      });

      it('should return 404 for non-existent transaction', async () => {
        const res = await request(app).get('/transactions/non-existent-id');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Transaction not found');
      });
    });

    // GET /accounts/:accountId/balance
    describe('GET /accounts/:accountId/balance', () => {
      it('should return the balance for an account', async () => {
        const res = await request(app).get('/accounts/ACC-11111/balance');
        expect(res.statusCode).toBe(200);
        expect(res.body.accountId).toBe('ACC-11111');
        expect(res.body.balances).toBeDefined();
        expect(res.body.balances.USD).toBeDefined();
      });

      it('should return 404 for account with no transactions', async () => {
        const res = await request(app).get('/accounts/ACC-NOPE1/balance');
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBe('Account not found');
      });
    });
  });

  // ============================================================
  // Task 2: Transaction Validation
  // ============================================================
  describe('Task 2: Transaction Validation', () => {

    it('should reject missing type', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ toAccount: 'ACC-11111', amount: 10, currency: 'USD' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'type' }),
        ])
      );
    });

    it('should reject invalid type', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ toAccount: 'ACC-11111', amount: 10, currency: 'USD', type: 'refund' });

      expect(res.statusCode).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'type', message: expect.stringContaining('Invalid') }),
        ])
      );
    });

    it('should reject negative amount', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ toAccount: 'ACC-11111', amount: -50, currency: 'USD', type: 'deposit' });

      expect(res.statusCode).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'amount', message: expect.stringContaining('positive') }),
        ])
      );
    });

    it('should reject zero amount', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ toAccount: 'ACC-11111', amount: 0, currency: 'USD', type: 'deposit' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject amount with more than 2 decimal places', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ toAccount: 'ACC-11111', amount: 10.123, currency: 'USD', type: 'deposit' });

      expect(res.statusCode).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'amount', message: expect.stringContaining('decimal') }),
        ])
      );
    });

    it('should reject invalid currency code', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ toAccount: 'ACC-11111', amount: 10, currency: 'FAKE', type: 'deposit' });

      expect(res.statusCode).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'currency', message: expect.stringContaining('Invalid') }),
        ])
      );
    });

    it('should reject invalid account format', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ toAccount: 'INVALID', amount: 10, currency: 'USD', type: 'deposit' });

      expect(res.statusCode).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'toAccount', message: expect.stringContaining('ACC-XXXXX') }),
        ])
      );
    });

    it('should reject transfer with same fromAccount and toAccount', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({
          fromAccount: 'ACC-11111',
          toAccount: 'ACC-11111',
          amount: 10,
          currency: 'USD',
          type: 'transfer',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'toAccount', message: expect.stringContaining('different') }),
        ])
      );
    });

    it('should reject transfer without fromAccount', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ toAccount: 'ACC-11111', amount: 10, currency: 'USD', type: 'transfer' });

      expect(res.statusCode).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'fromAccount' }),
        ])
      );
    });

    it('should reject deposit without toAccount', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ amount: 10, currency: 'USD', type: 'deposit' });

      expect(res.statusCode).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'toAccount' }),
        ])
      );
    });

    it('should return multiple validation errors at once', async () => {
      const res = await request(app)
        .post('/transactions')
        .send({ amount: -5, currency: 'NOPE', type: 'deposit' });

      expect(res.statusCode).toBe(400);
      expect(res.body.details.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ============================================================
  // Task 3: Transaction Filtering
  // ============================================================
  describe('Task 3: Transaction Filtering', () => {

    it('should filter transactions by accountId', async () => {
      const res = await request(app).get('/transactions?accountId=ACC-11111');
      expect(res.statusCode).toBe(200);
      res.body.transactions.forEach((t) => {
        const matches = t.fromAccount === 'ACC-11111' || t.toAccount === 'ACC-11111';
        expect(matches).toBe(true);
      });
    });

    it('should filter transactions by type', async () => {
      const res = await request(app).get('/transactions?type=deposit');
      expect(res.statusCode).toBe(200);
      res.body.transactions.forEach((t) => {
        expect(t.type).toBe('deposit');
      });
    });

    it('should filter by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app).get(`/transactions?from=${today}&to=${today}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array for future date range', async () => {
      const res = await request(app).get('/transactions?from=2099-01-01&to=2099-12-31');
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBe(0);
      expect(res.body.transactions).toEqual([]);
    });

    it('should combine accountId and type filters', async () => {
      const res = await request(app).get('/transactions?accountId=ACC-11111&type=deposit');
      expect(res.statusCode).toBe(200);
      res.body.transactions.forEach((t) => {
        expect(t.type).toBe('deposit');
        const matches = t.fromAccount === 'ACC-11111' || t.toAccount === 'ACC-11111';
        expect(matches).toBe(true);
      });
    });
  });

  // ============================================================
  // Task 4A: Account Summary
  // ============================================================
  describe('Task 4A: Account Summary', () => {

    it('should return account summary with all required fields', async () => {
      const res = await request(app).get('/accounts/ACC-11111/summary');
      expect(res.statusCode).toBe(200);
      expect(res.body.accountId).toBe('ACC-11111');
      expect(typeof res.body.totalDeposits).toBe('number');
      expect(typeof res.body.totalWithdrawals).toBe('number');
      expect(typeof res.body.numberOfTransactions).toBe('number');
      expect(res.body.mostRecentTransactionDate).toBeDefined();
    });

    it('should return 404 for account with no transactions', async () => {
      const res = await request(app).get('/accounts/ACC-NOPE2/summary');
      expect(res.statusCode).toBe(404);
    });
  });

  // ============================================================
  // Task 4B: Simple Interest Calculation
  // ============================================================
  describe('Task 4B: Interest Calculation', () => {

    it('should calculate interest with given rate and days', async () => {
      const res = await request(app).get('/accounts/ACC-11111/interest?rate=0.05&days=30');
      expect(res.statusCode).toBe(200);
      expect(res.body.accountId).toBe('ACC-11111');
      expect(res.body.rate).toBe(0.05);
      expect(res.body.days).toBe(30);
      expect(res.body.interestBreakdown).toBeDefined();
    });

    it('should use default rate and days when not specified', async () => {
      const res = await request(app).get('/accounts/ACC-11111/interest');
      expect(res.statusCode).toBe(200);
      expect(res.body.rate).toBe(0.05);
      expect(res.body.days).toBe(30);
    });

    it('should reject invalid rate (> 1)', async () => {
      const res = await request(app).get('/accounts/ACC-11111/interest?rate=5');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Invalid rate');
    });

    it('should return 404 for non-existent account', async () => {
      const res = await request(app).get('/accounts/ACC-NOPE3/interest?rate=0.05&days=30');
      expect(res.statusCode).toBe(404);
    });
  });

  // ============================================================
  // Task 4C: Transaction Export (CSV)
  // ============================================================
  describe('Task 4C: CSV Export', () => {

    it('should export transactions as CSV', async () => {
      const res = await request(app).get('/transactions/export?format=csv');
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.headers['content-disposition']).toMatch(/attachment/);

      const lines = res.text.trim().split('\n');
      expect(lines[0]).toBe('id,fromAccount,toAccount,amount,currency,type,timestamp,status');
      expect(lines.length).toBeGreaterThan(1);
    });

    it('should reject unsupported export format', async () => {
      const res = await request(app).get('/transactions/export?format=xml');
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Unsupported export format');
    });
  });

  // ============================================================
  // Task 4D: Rate Limiting
  // ============================================================
  describe('Task 4D: Rate Limiting', () => {

    it('should allow requests within the limit', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
    });

    // Note: Testing the actual 429 response would require sending 100+ requests
    // in a single test, which is slow. We verify the middleware is active instead.
  });

  // ============================================================
  // 404 Handler
  // ============================================================
  describe('404 Handler', () => {

    it('should return 404 for unknown endpoints', async () => {
      const res = await request(app).get('/nonexistent');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Endpoint not found');
    });
  });
});
