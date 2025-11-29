const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { District } = require('../models/geographic.model');
const ApiError = require('../utils/ApiError');

const getAllDistrictsWithState = catchAsync(async (req, res) => {
  const districts = await District.find({}).populate('stateId', 'name code').select('name stateId').sort({ name: 1 }).lean();
  res.json(districts);
});

const getDistricts = catchAsync(async (req, res) => {
  const { stateId } = req.query;
  const filter = { isActive: true };
  if (stateId) filter.stateId = stateId;

  const districts = await District.find(filter).populate('stateId', 'name code').sort({ name: 1 }).lean();
  res.json(districts);
});

const createDistrict = catchAsync(async (req, res) => {
  const district = await District.create(req.body);
  res.status(httpStatus.CREATED).json(district);
});

const updateDistrict = catchAsync(async (req, res) => {
  const district = await District.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!district) {
    throw new ApiError(httpStatus.NOT_FOUND, 'District not found');
  }
  res.json(district);
});

const deleteDistrict = catchAsync(async (req, res) => {
  const district = await District.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!district) {
    throw new ApiError(httpStatus.NOT_FOUND, 'District not found');
  }
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getAllDistrictsWithState,
  getDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
};
