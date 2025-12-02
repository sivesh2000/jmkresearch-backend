const httpStatus = require('http-status');
const { Config } = require('../models');
const ApiError = require('../utils/ApiError');

const createConfig = async (configBody) => {
  if (await Config.findOne({ key: configBody.key })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Config key already exists');
  }
  return Config.create(configBody);
};

const queryConfigs = async (filter, options) => {
  return Config.paginate(filter, options);
};

const getConfigById = async (id) => {
  return Config.findById(id);
};

const getConfigByKey = async (key) => {
  return Config.getByKey(key);
};

const getConfigsByCategory = async (category) => {
  return Config.getByCategory(category);
};

const updateConfigById = async (configId, updateBody) => {
  const config = await getConfigById(configId);
  if (!config) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Config not found');
  }
  if (!config.isEditable) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Config is not editable');
  }
  if (updateBody.key && updateBody.key !== config.key) {
    if (await Config.findOne({ key: updateBody.key, _id: { $ne: configId } })) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Config key already exists');
    }
  }
  Object.assign(config, updateBody);
  await config.save();
  return config;
};

const deleteConfigById = async (configId) => {
  const config = await getConfigById(configId);
  if (!config) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Config not found');
  }
  if (!config.isEditable) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Config cannot be deleted');
  }
  await config.deleteOne();
  return config;
};

module.exports = {
  createConfig,
  queryConfigs,
  getConfigById,
  getConfigByKey,
  getConfigsByCategory,
  updateConfigById,
  deleteConfigById,
};
