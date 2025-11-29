const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increase from 20 to 500 requests per window per IP
  skipSuccessfulRequests: true,
  message: {
    error: {
      status: 429,
      message: 'Too many authentication attempts, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for trusted IPs (optional)
  skip: (req) => {
    const trustedIPs = ['127.0.0.1', '::1']; // Add your trusted IPs
    return trustedIPs.includes(req.ip);
  },
});

module.exports = {
  authLimiter,
};
