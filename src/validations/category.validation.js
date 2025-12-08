const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    slug: Joi.string()
      .required()
      .trim()
      .pattern(/^[a-z0-9-]+$/),
    parentId: Joi.string().custom(objectId).allow(null, ''),
    order: Joi.number().integer().min(0).default(0),
    isActive: Joi.boolean().default(true),
    description: Joi.string().trim().allow(''),
    icon: Joi.string().trim().allow(''),
    color: Joi.string().trim().allow(''),
  }),
};

const getCategories = {
  query: Joi.object().keys({
    name: Joi.string().trim(),
    parentId: Joi.string().custom(objectId).allow(null, ''),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
};

const getCategoryBySlug = {
  params: Joi.object().keys({
    slug: Joi.string().required().trim(),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      slug: Joi.string()
        .trim()
        .pattern(/^[a-z0-9-]+$/),
      parentId: Joi.string().custom(objectId).allow(null, ''),
      order: Joi.number().integer().min(0),
      isActive: Joi.boolean(),
      description: Joi.string().trim().allow(''),
      icon: Joi.string().trim().allow(''),
      color: Joi.string().trim().allow(''),
    })
    .min(1),
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId),
  }),
};

const reorderCategories = {
  body: Joi.object().keys({
    categoryOrders: Joi.array()
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
  createCategory,
  getCategories,
  getCategory,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  reorderCategories,
};
