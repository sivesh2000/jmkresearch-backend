const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { State } = require('../models/geographic.model');
const ApiError = require('../utils/ApiError');

const getAllStates = catchAsync(async (req, res) => {
  const states = await State.find({}).select('name code').sort({ name: 1 }).lean();
  res.json(states);
});

const getStates = catchAsync(async (req, res) => {
  const { search } = req.query;
  const filter = { isActive: true };

  if (typeof search === 'string' && search.trim() !== '') {
    filter.name = { $regex: search.trim(), $options: 'i' };
  }

  const states = await State.find(filter).select('name code').sort({ name: 1 }).lean();
  res.json(states);
});

const createState = catchAsync(async (req, res) => {
  const state = await State.create(req.body);
  res.status(httpStatus.CREATED).json(state);
});

const updateState = catchAsync(async (req, res) => {
  const state = await State.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!state) {
    throw new ApiError(httpStatus.NOT_FOUND, 'State not found');
  }
  res.json(state);
});

const deleteState = catchAsync(async (req, res) => {
  const state = await State.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!state) {
    throw new ApiError(httpStatus.NOT_FOUND, 'State not found');
  }
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getAllStates,
  getStates,
  createState,
  updateState,
  deleteState,
};
