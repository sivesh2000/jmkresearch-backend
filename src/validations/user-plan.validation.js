const Joi = require('joi');
const { objectId } = require('./custom.validation');

const assignPlanToUser = {
  body: Joi.object().keys({
    planRef: Joi.string().custom(objectId).required(),
    userRef: Joi.string().custom(objectId).required(),
    assignedBy: Joi.string().custom(objectId),
    mrp: Joi.number().positive().required(),
    dlp: Joi.number().positive().required(),
    canEditMRP: Joi.boolean(),
    isActive: Joi.boolean(),
  }),
};

// In user-plan.validation.js - getUserPlans schema
const getUserPlans = {
  query: Joi.object().keys({
    planRef: Joi.string().custom(objectId),
    userRef: Joi.string().custom(objectId),
    isActive: Joi.boolean(),
    assignedBy: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUserPlan = {
  params: Joi.object().keys({
    userPlanId: Joi.string().custom(objectId),
  }),
};

const updateUserPlan = {
  params: Joi.object().keys({
    userPlanId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      mrp: Joi.number().positive(),
      dlp: Joi.number().positive(),
      isActive: Joi.boolean(),
      canEditMRP: Joi.boolean(),
    })
    .min(1),
};

const updateUserPlanStatus = {
  params: Joi.object().keys({
    userPlanId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    isActive: Joi.boolean().required(),
  }),
};

const deleteUserPlan = {
  params: Joi.object().keys({
    userPlanId: Joi.string().custom(objectId),
  }),
};

const assignPlanByMainDealer = {
  body: Joi.object().keys({
    planRef: Joi.string().custom(objectId).required(),
    userRef: Joi.string().custom(objectId).required(),
    mrp: Joi.number().positive().required(),
    dlp: Joi.number().positive().required(),
    canEditMRP: Joi.boolean(),
  }),
};

const updateMRPPermission = {
  params: Joi.object().keys({
    userPlanId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    canEditMRP: Joi.boolean().required(),
  }),
};

const getAssignedUsersByPlan = {
  params: Joi.object().keys({
    planRef: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  assignPlanToUser,
  assignPlanByMainDealer,
  getAssignedUsersByPlan,
  updateMRPPermission,
  updateUserPlanStatus,
  getUserPlans,
  getUserPlan,
  updateUserPlan,
  deleteUserPlan,
};
