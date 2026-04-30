/**
 * Convert an array of transaction objects to CSV format.
 * @param {object[]} transactions - Array of transaction objects.
 * @returns {string} CSV formatted string.
 */
function transactionsToCSV(transactions) {
  if (transactions.length === 0) {
    return 'id,fromAccount,toAccount,amount,currency,type,timestamp,status\n';
  }

  const headers = ['id', 'fromAccount', 'toAccount', 'amount', 'currency', 'type', 'timestamp', 'status'];
  const headerLine = headers.join(',');

  const rows = transactions.map((t) =>
    headers
      .map((h) => {
        const value = t[h];
        if (value === null || value === undefined) return '';
        // Escape values that contain commas or quotes
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',')
  );

  return [headerLine, ...rows].join('\n') + '\n';
}

/**
 * Calculate simple interest.
 * Formula: Principal × Rate × (Days / 365)
 * @param {number} principal - The principal amount (balance).
 * @param {number} rate - Annual interest rate (e.g. 0.05 for 5%).
 * @param {number} days - Number of days.
 * @returns {number} The calculated interest, rounded to 2 decimal places.
 */
function calculateSimpleInterest(principal, rate, days) {
  const interest = principal * rate * (days / 365);
  return Math.round(interest * 100) / 100;
}

module.exports = { transactionsToCSV, calculateSimpleInterest };
