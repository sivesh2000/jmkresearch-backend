const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPlan = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    code: Joi.string().required(),
    description: Joi.string(),
    features: Joi.array().items(Joi.string()),
    planFeatures: Joi.array().items(Joi.string().custom(objectId)),
    isActive: Joi.boolean(),
  }),
};

const getPlans = {
  query: Joi.object().keys({
    name: Joi.string(),
    code: Joi.string(),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPlan = {
  params: Joi.object().keys({
    planId: Joi.string().custom(objectId),
  }),
};

const updatePlan = {
  params: Joi.object().keys({
    planId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      code: Joi.string(),
      description: Joi.string(),
      features: Joi.array().items(Joi.string()),
      planFeatures: Joi.array().items(Joi.string().custom(objectId)),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const deletePlan = {
  params: Joi.object().keys({
    planId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
};
