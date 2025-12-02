const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    code: Joi.string().trim().allow(''),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    role: Joi.string().required().valid('user', 'admin'),
    userType: Joi.string().required().valid('super_admin', 'user', 'guest'),
    stateRef: Joi.string().custom(objectId).allow(''),
    status: Joi.boolean(),
    isEmailVerified: Joi.boolean(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    code: Joi.string(),
    email: Joi.string().email(),
    role: Joi.string(),
    userType: Joi.string().valid('super_admin', 'user', 'guest'),
    status: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUsersByType = {
  params: Joi.object().keys({
    userType: Joi.string().required().valid('super_admin', 'user', 'guest'),
  }),
  query: Joi.object().keys({
    status: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      code: Joi.string().trim().allow(''),
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      role: Joi.string().valid('user', 'admin'),
      userType: Joi.string().valid('super_admin', 'user', 'guest'),
      stateRef: Joi.string().custom(objectId).allow(''),
      status: Joi.boolean(),
      isEmailVerified: Joi.boolean(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUsersByType,
  getUser,
  updateUser,
  deleteUser,
};
