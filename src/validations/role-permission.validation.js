const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addPermissionsToRole = {
  body: Joi.object().keys({
    roleId: Joi.string().custom(objectId).required(),
    permissionIds: Joi.array().items(Joi.string().custom(objectId)).min(1).required(),
  }),
};

const removePermissionsFromRole = {
  body: Joi.object().keys({
    roleId: Joi.string().custom(objectId).required(),
    permissionIds: Joi.array().items(Joi.string().custom(objectId)).min(1).required(),
  }),
};

const getRolePermissions = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId).required(),
  }),
};

const getAvailablePermissions = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  addPermissionsToRole,
  removePermissionsFromRole,
  getRolePermissions,
  getAvailablePermissions,
};
