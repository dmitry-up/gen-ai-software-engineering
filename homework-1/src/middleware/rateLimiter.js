/**
 * Simple in-memory rate limiter middleware.
 * Limits each IP to a maximum of 100 requests per 60-second window.
 * Returns 429 Too Many Requests when exceeded.
 */

const requestCounts = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, windowStart: now });
    return next();
  }

  const record = requestCounts.get(ip);

  // Reset window if expired
  if (now - record.windowStart > WINDOW_MS) {
    record.count = 1;
    record.windowStart = now;
    return next();
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.windowStart + WINDOW_MS - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Maximum ${MAX_REQUESTS} requests per minute. Try again in ${retryAfter} seconds.`,
    });
  }

  next();
}

module.exports = { rateLimiter };
