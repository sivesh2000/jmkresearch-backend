const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');

const healthCheck = catchAsync(async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  };

  res.json(health);
});

module.exports = {
  healthCheck,
};
