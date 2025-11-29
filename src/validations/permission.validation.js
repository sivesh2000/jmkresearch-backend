const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPermission = {
  body: Joi.object().keys({
    domain: Joi.string().required().custom(objectId),
    actions: Joi.string().required().trim(),
    instance: Joi.string().required().trim(),
    isActive: Joi.boolean().default(true),
    description: Joi.string().trim().allow(''),
  }),
};

const getPermissions = {
  query: Joi.object().keys({
    domain: Joi.string().custom(objectId),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPermission = {
  params: Joi.object().keys({
    permissionId: Joi.string().custom(objectId).required(),
  }),
};

const updatePermission = {
  params: Joi.object().keys({
    permissionId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      domain: Joi.string().custom(objectId),
      actions: Joi.string().trim(),
      instance: Joi.string().trim(),
      isActive: Joi.boolean(),
      description: Joi.string().trim().allow(''),
    })
    .min(1),
};

const deletePermission = {
  params: Joi.object().keys({
    permissionId: Joi.string().custom(objectId).required(),
  }),
};

const createCustomRole = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    description: Joi.string().trim().allow(''),
    permissions: Joi.array().items(Joi.string().custom(objectId)).required(),
  }),
};

const getCustomRoles = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCustomRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId).required(),
  }),
};

const updateCustomRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      description: Joi.string().trim().allow(''),
      permissions: Joi.array().items(Joi.string().custom(objectId)),
    })
    .min(1),
};

const deleteCustomRole = {
  params: Joi.object().keys({
    roleId: Joi.string().custom(objectId).required(),
  }),
};

const assignRoleToUser = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    customRoleId: Joi.string().custom(objectId),
    permissions: Joi.array().items(Joi.string().custom(objectId)),
  }),
};

module.exports = {
  createPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
  createCustomRole,
  getCustomRoles,
  getCustomRole,
  updateCustomRole,
  deleteCustomRole,
  assignRoleToUser,
};
