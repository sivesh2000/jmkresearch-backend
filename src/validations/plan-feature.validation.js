const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPlanFeature = {
  body: Joi.object().keys({
    title: Joi.string().required().trim(),
    desc: Joi.string().allow(''),
    note: Joi.string().trim().allow(''),
    status: Joi.boolean(),
  }),
};

const getPlanFeatures = {
  query: Joi.object().keys({
    title: Joi.string(),
    status: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPlanFeature = {
  params: Joi.object().keys({
    planFeatureId: Joi.string().custom(objectId),
  }),
};

const updatePlanFeature = {
  params: Joi.object().keys({
    planFeatureId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().trim(),
      desc: Joi.string().allow(''),
      note: Joi.string().trim().allow(''),
      status: Joi.boolean(),
    })
    .min(1),
};

const deletePlanFeature = {
  params: Joi.object().keys({
    planFeatureId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createPlanFeature,
  getPlanFeatures,
  getPlanFeature,
  updatePlanFeature,
  deletePlanFeature,
};
