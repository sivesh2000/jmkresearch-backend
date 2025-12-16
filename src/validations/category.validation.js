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
    hasParent: Joi.boolean().description('true => only subcategories, false => only root categories'),
    order: Joi.number().integer().min(0).default(0),
    isActive: Joi.boolean().default(true),
    description: Joi.string().trim().allow(''),
    icon: Joi.string().trim().allow(''),
    color: Joi.string().trim().allow(''),
  }),
};

const getCategories = {
  query: Joi.object().keys({
    search: Joi.string().trim(),
    name: Joi.string().trim(),
    parentId: Joi.alternatives()
      .try(Joi.string().custom(objectId), Joi.string().valid('null', 'notnull'))
      .description('Parent category id (ObjectId) or use "null"/"notnull" to filter roots/subcategories'),
    hasParent: Joi.boolean().description('true => only subcategories, false => only root categories'),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().positive(),
    page: Joi.number().integer().positive(),
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
