const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { City } = require('../models/geographic.model');
const ApiError = require('../utils/ApiError');

const getAllCitiesWithState = catchAsync(async (req, res) => {
  const cities = await City.find({}).populate('stateId', 'name code').select('name stateId').sort({ name: 1 }).lean();
  res.json(cities);
});

const getCities = catchAsync(async (req, res) => {
  const { stateId } = req.query;
  const filter = { isActive: true };
  if (stateId) filter.stateId = stateId;

  const cities = await City.find(filter).populate('stateId', 'name code').sort({ name: 1 }).lean();
  res.json(cities);
});

const createCity = catchAsync(async (req, res) => {
  const city = await City.create(req.body);
  res.status(httpStatus.CREATED).json(city);
});

const updateCity = catchAsync(async (req, res) => {
  const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!city) {
    throw new ApiError(httpStatus.NOT_FOUND, 'City not found');
  }
  res.json(city);
});

const deleteCity = catchAsync(async (req, res) => {
  const city = await City.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!city) {
    throw new ApiError(httpStatus.NOT_FOUND, 'City not found');
  }
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getAllCitiesWithState,
  getCities,
  createCity,
  updateCity,
  deleteCity,
};
