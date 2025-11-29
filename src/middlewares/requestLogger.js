const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);

    // Log auth failures specifically
    if (res.statusCode === 401) {
      logger.warn(`Auth failure: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    }
  });

  next();
};

module.exports = requestLogger;
