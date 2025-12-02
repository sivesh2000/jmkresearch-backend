const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { configService } = require('../services');

const createConfig = catchAsync(async (req, res) => {
  const config = await configService.createConfig(req.body);
  res.status(httpStatus.CREATED).send(config);
});

const getConfigs = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['key', 'category', 'dataType', 'isActive']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!options.sortBy) options.sortBy = 'category:asc,key:asc';

  const result = await configService.queryConfigs(filter, options);
  res.send(result);
});

const getConfig = catchAsync(async (req, res) => {
  const config = await configService.getConfigById(req.params.configId);
  if (!config) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Config not found');
  }
  res.send(config);
});

const getConfigByKey = catchAsync(async (req, res) => {
  const config = await configService.getConfigByKey(req.params.key);
  if (!config) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Config not found');
  }
  res.send(config);
});

const getConfigsByCategory = catchAsync(async (req, res) => {
  const configs = await configService.getConfigsByCategory(req.params.category);
  res.send(configs);
});

const updateConfig = catchAsync(async (req, res) => {
  const config = await configService.updateConfigById(req.params.configId, req.body);
  res.send(config);
});

const deleteConfig = catchAsync(async (req, res) => {
  await configService.deleteConfigById(req.params.configId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createConfig,
  getConfigs,
  getConfig,
  getConfigByKey,
  getConfigsByCategory,
  updateConfig,
  deleteConfig,
};
