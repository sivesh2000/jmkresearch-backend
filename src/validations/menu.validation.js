const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createMenu = {
  body: Joi.object().keys({
    title: Joi.string().required().trim(),
    slug: Joi.string()
      .required()
      .trim()
      .pattern(/^[a-z0-9-]+$/),
    parentId: Joi.string().custom(objectId).allow(null, ''),
    order: Joi.number().integer().min(0).default(0),
    isActive: Joi.boolean().default(true),
    url: Joi.string().trim().allow(''),
    icon: Joi.string().trim().allow(''),
    description: Joi.string().trim().allow(''),
  }),
};

const getMenus = {
  query: Joi.object().keys({
    title: Joi.string().trim(),
    parentId: Joi.string().custom(objectId).allow(null, ''),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

const getMenu = {
  params: Joi.object().keys({
    menuId: Joi.string().custom(objectId),
  }),
};

const getMenuBySlug = {
  params: Joi.object().keys({
    slug: Joi.string().required().trim(),
  }),
};

const updateMenu = {
  params: Joi.object().keys({
    menuId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().trim(),
      slug: Joi.string()
        .trim()
        .pattern(/^[a-z0-9-]+$/),
      parentId: Joi.string().custom(objectId).allow(null, ''),
      order: Joi.number().integer().min(0),
      isActive: Joi.boolean(),
      url: Joi.string().trim().allow(''),
      icon: Joi.string().trim().allow(''),
      description: Joi.string().trim().allow(''),
    })
    .min(1),
};

const deleteMenu = {
  params: Joi.object().keys({
    menuId: Joi.string().custom(objectId),
  }),
};

const reorderMenus = {
  body: Joi.object().keys({
    menuOrders: Joi.array()
      .items(
        Joi.object().keys({
          id: Joi.string().custom(objectId).required(),
          order: Joi.number().integer().min(0).required(),
        })
      )
      .required(),
  }),
};

module.exports = {
  createMenu,
  getMenus,
  getMenu,
  getMenuBySlug,
  updateMenu,
  deleteMenu,
  reorderMenus,
};
