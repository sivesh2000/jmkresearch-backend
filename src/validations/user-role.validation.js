const Joi = require('joi');
const { objectId } = require('./custom.validation');

const assignRolesToUser = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    roleIds: Joi.array().items(Joi.string().custom(objectId)).min(1).required(),
  }),
};

const removeRolesFromUser = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    roleIds: Joi.array().items(Joi.string().custom(objectId)).min(1).required(),
  }),
};

const toggleUserRoles = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    roleIds: Joi.array().items(Joi.string().custom(objectId)).min(1).required(),
  }),
};

const getUserRolesAndPermissions = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  assignRolesToUser,
  removeRolesFromUser,
  toggleUserRoles,
  getUserRolesAndPermissions,
};
