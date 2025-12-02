const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createConfig = {
  body: Joi.object().keys({
    key: Joi.string()
      .required()
      .trim()
      .pattern(/^[a-zA-Z0-9_.-]+$/),
    value: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.object(), Joi.array()).required(),
    category: Joi.string().required().trim(),
    description: Joi.string().trim().allow(''),
    dataType: Joi.string().valid('string', 'number', 'boolean', 'object', 'array').default('string'),
    isActive: Joi.boolean().default(true),
    isEditable: Joi.boolean().default(true),
  }),
};

const getConfigs = {
  query: Joi.object().keys({
    key: Joi.string().trim(),
    category: Joi.string().trim(),
    dataType: Joi.string().valid('string', 'number', 'boolean', 'object', 'array'),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

const getConfig = {
  params: Joi.object().keys({
    configId: Joi.string().custom(objectId),
  }),
};

const getConfigByKey = {
  params: Joi.object().keys({
    key: Joi.string().required().trim(),
  }),
};

const getConfigsByCategory = {
  params: Joi.object().keys({
    category: Joi.string().required().trim(),
  }),
};

const updateConfig = {
  params: Joi.object().keys({
    configId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      key: Joi.string()
        .trim()
        .pattern(/^[a-zA-Z0-9_.-]+$/),
      value: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean(), Joi.object(), Joi.array()),
      category: Joi.string().trim(),
      description: Joi.string().trim().allow(''),
      dataType: Joi.string().valid('string', 'number', 'boolean', 'object', 'array'),
      isActive: Joi.boolean(),
      isEditable: Joi.boolean(),
    })
    .min(1),
};

const deleteConfig = {
  params: Joi.object().keys({
    configId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createConfig,
  getConfigs,
  getConfig,
  getConfigByKey,
  getConfigsByCategory,
  updateConfig,
  deleteConfig,
};
