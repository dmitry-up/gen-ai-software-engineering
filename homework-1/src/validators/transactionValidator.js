/**
 * Valid ISO 4217 currency codes (commonly used subset).
 */
const VALID_CURRENCIES = new Set([
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD',
  'CNY', 'HKD', 'SGD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK',
  'HUF', 'RON', 'BGN', 'HRK', 'RUB', 'UAH', 'TRY', 'BRL',
  'MXN', 'INR', 'KRW', 'ZAR', 'AED', 'SAR', 'THB', 'MYR',
  'IDR', 'PHP', 'VND', 'ILS', 'EGP', 'NGN', 'KES', 'GHS',
]);

/**
 * Valid transaction types.
 */
const VALID_TYPES = new Set(['deposit', 'withdrawal', 'transfer']);

/**
 * Regex pattern for account number format: ACC-XXXXX (X is alphanumeric).
 */
const ACCOUNT_PATTERN = /^ACC-[A-Za-z0-9]{5}$/;

/**
 * Validate a transaction request body.
 * Returns an array of error objects. Empty array means valid.
 * @param {object} body - The request body.
 * @returns {{ field: string, message: string }[]} Array of validation errors.
 */
function validateTransaction(body) {
  const errors = [];

  // --- Type validation ---
  if (!body.type) {
    errors.push({ field: 'type', message: 'Transaction type is required' });
  } else if (!VALID_TYPES.has(body.type)) {
    errors.push({
      field: 'type',
      message: `Invalid transaction type. Must be one of: ${[...VALID_TYPES].join(', ')}`,
    });
  }

  // --- Amount validation ---
  if (body.amount === undefined || body.amount === null) {
    errors.push({ field: 'amount', message: 'Amount is required' });
  } else if (typeof body.amount !== 'number' || isNaN(body.amount)) {
    errors.push({ field: 'amount', message: 'Amount must be a number' });
  } else if (body.amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be a positive number' });
  } else {
    // Check maximum 2 decimal places
    const decimalStr = body.amount.toString();
    if (decimalStr.includes('.') && decimalStr.split('.')[1].length > 2) {
      errors.push({ field: 'amount', message: 'Amount must have at most 2 decimal places' });
    }
  }

  // --- Currency validation ---
  if (!body.currency) {
    errors.push({ field: 'currency', message: 'Currency is required' });
  } else if (!VALID_CURRENCIES.has(body.currency.toUpperCase())) {
    errors.push({ field: 'currency', message: 'Invalid currency code. Must be a valid ISO 4217 code' });
  }

  // --- Account validation based on type ---
  if (body.type === 'deposit') {
    if (!body.toAccount) {
      errors.push({ field: 'toAccount', message: 'toAccount is required for deposits' });
    } else if (!ACCOUNT_PATTERN.test(body.toAccount)) {
      errors.push({ field: 'toAccount', message: 'toAccount must follow format ACC-XXXXX (X is alphanumeric)' });
    }
  } else if (body.type === 'withdrawal') {
    if (!body.fromAccount) {
      errors.push({ field: 'fromAccount', message: 'fromAccount is required for withdrawals' });
    } else if (!ACCOUNT_PATTERN.test(body.fromAccount)) {
      errors.push({ field: 'fromAccount', message: 'fromAccount must follow format ACC-XXXXX (X is alphanumeric)' });
    }
  } else if (body.type === 'transfer') {
    if (!body.fromAccount) {
      errors.push({ field: 'fromAccount', message: 'fromAccount is required for transfers' });
    } else if (!ACCOUNT_PATTERN.test(body.fromAccount)) {
      errors.push({ field: 'fromAccount', message: 'fromAccount must follow format ACC-XXXXX (X is alphanumeric)' });
    }

    if (!body.toAccount) {
      errors.push({ field: 'toAccount', message: 'toAccount is required for transfers' });
    } else if (!ACCOUNT_PATTERN.test(body.toAccount)) {
      errors.push({ field: 'toAccount', message: 'toAccount must follow format ACC-XXXXX (X is alphanumeric)' });
    }

    if (body.fromAccount && body.toAccount && body.fromAccount === body.toAccount) {
      errors.push({ field: 'toAccount', message: 'fromAccount and toAccount must be different' });
    }
  }

  return errors;
}

module.exports = { validateTransaction };
