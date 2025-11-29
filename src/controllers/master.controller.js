const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const MasterData = require('../models/master.model');
const ApiError = require('../utils/ApiError');

const getMasterData = catchAsync(async (req, res) => {
  const data = await MasterData.findOne({ code: 'master_data' });
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Master data not found');
  }
  res.json(data);
});

const updateMasterData = catchAsync(async (req, res) => {
  const data = await MasterData.findOneAndUpdate(
    { code: 'master_data' },
    { code: 'master_data', ...req.body },
    { new: true, upsert: true }
  );
  res.json(data);
});

module.exports = {
  getMasterData,
  updateMasterData,
};
