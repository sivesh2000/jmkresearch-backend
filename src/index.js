const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { seedConfigs } = require('./config/seedConfigs');

let server;

// MongoDB connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoose.url, {
      ...config.mongoose.options,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 2000,
    });
    logger.info('Connected to MongoDB');
    await seedConfigs();
  } catch (err) {
    logger.error('MongoDB connection error:', err);
    setTimeout(connectDB, 5000);
  }
};

// Monitor MongoDB connection
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});

connectDB().then(() => {
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      mongoose.connection.close(false, () => {
        logger.info('MongoDB connection closed');
        process.exit(1);
      });
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('Unexpected error:', error);
  if (config.env === 'production') {
    logger.error('Process will continue running...');
  } else {
    exitHandler();
  }
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  exitHandler();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received');
  exitHandler();
});
