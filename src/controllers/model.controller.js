const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { Model } = require('../models/vehicle.model');
const ApiError = require('../utils/ApiError');

const getAllModelsWithMake = catchAsync(async (req, res) => {
  const models = await Model.find({}).populate('makeId', 'name').select('name makeId').sort({ name: 1 }).lean();
  res.json(models);
});

const getModels = catchAsync(async (req, res) => {
  const { makeId } = req.query;
  const filter = { isActive: true };
  if (makeId) filter.makeId = makeId;

  const models = await Model.find(filter).populate('makeId', 'name').sort({ name: 1 }).lean();
  res.json(models);
});

const createModel = catchAsync(async (req, res) => {
  const model = await Model.create(req.body);
  res.status(httpStatus.CREATED).json(model);
});

const updateModel = catchAsync(async (req, res) => {
  const model = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!model) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Model not found');
  }
  res.json(model);
});

const deleteModel = catchAsync(async (req, res) => {
  const model = await Model.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!model) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Model not found');
  }
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getAllModelsWithMake,
  getModels,
  createModel,
  updateModel,
  deleteModel,
};
