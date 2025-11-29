const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { Make } = require('../models/vehicle.model');
const ApiError = require('../utils/ApiError');

const getAllMakes = catchAsync(async (req, res) => {
  const makes = await Make.find({}).select('name').sort({ name: 1 }).lean();
  res.json(makes);
});

const getMakes = catchAsync(async (req, res) => {
  const makes = await Make.find({ isActive: true }).sort({ name: 1 }).lean();
  res.json(makes);
});

const createMake = catchAsync(async (req, res) => {
  const make = await Make.create(req.body);
  res.status(httpStatus.CREATED).json(make);
});

const updateMake = catchAsync(async (req, res) => {
  const make = await Make.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!make) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Make not found');
  }
  res.json(make);
});

const deleteMake = catchAsync(async (req, res) => {
  const make = await Make.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!make) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Make not found');
  }
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getAllMakes,
  getMakes,
  createMake,
  updateMake,
  deleteMake,
};
