const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPageContent = {
  body: Joi.object().keys({
    menuId: Joi.string().custom(objectId).required(),
    title: Joi.string().required().trim(),
    slug: Joi.string()
      .required()
      .trim()
      .pattern(/^[a-z0-9-]+$/),
    content: Joi.string().allow(''),
    excerpt: Joi.string().trim().allow(''),
    status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
    seoMeta: Joi.object().keys({
      title: Joi.string().trim().allow(''),
      description: Joi.string().trim().allow(''),
      keywords: Joi.array().items(Joi.string().trim()),
      ogImage: Joi.string().trim().allow(''),
      canonicalUrl: Joi.string().uri().allow(''),
    }),
    featuredImage: Joi.string().trim().allow(''),
    author: Joi.string().custom(objectId),
    tags: Joi.array().items(Joi.string().trim()),
    isActive: Joi.boolean().default(true),
  }),
};

const getPageContents = {
  query: Joi.object().keys({
    menuId: Joi.string().custom(objectId),
    title: Joi.string().trim(),
    status: Joi.string().valid('draft', 'published', 'archived'),
    author: Joi.string().custom(objectId),
    tags: Joi.string().trim(),
    isActive: Joi.boolean(),
    search: Joi.string().trim(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

const getPageContent = {
  params: Joi.object().keys({
    contentId: Joi.string().custom(objectId),
  }),
};

const getPageContentBySlug = {
  params: Joi.object().keys({
    slug: Joi.string().required().trim(),
  }),
  query: Joi.object().keys({
    preview: Joi.boolean().default(false),
  }),
};

const getPageContentsByMenu = {
  params: Joi.object().keys({
    menuId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

const updatePageContent = {
  params: Joi.object().keys({
    contentId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      menuId: Joi.string().custom(objectId),
      title: Joi.string().trim(),
      slug: Joi.string()
        .trim()
        .pattern(/^[a-z0-9-]+$/),
      content: Joi.string().allow(''),
      excerpt: Joi.string().trim().allow(''),
      status: Joi.string().valid('draft', 'published', 'archived'),
      seoMeta: Joi.object().keys({
        title: Joi.string().trim().allow(''),
        description: Joi.string().trim().allow(''),
        keywords: Joi.array().items(Joi.string().trim()),
        ogImage: Joi.string().trim().allow(''),
        canonicalUrl: Joi.string().uri().allow(''),
      }),
      featuredImage: Joi.string().trim().allow(''),
      author: Joi.string().custom(objectId),
      tags: Joi.array().items(Joi.string().trim()),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const deletePageContent = {
  params: Joi.object().keys({
    contentId: Joi.string().custom(objectId),
  }),
};

const publishPageContent = {
  params: Joi.object().keys({
    contentId: Joi.string().custom(objectId),
  }),
};

const searchPageContents = {
  query: Joi.object().keys({
    q: Joi.string().required().trim().min(2),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

module.exports = {
  createPageContent,
  getPageContents,
  getPageContent,
  getPageContentBySlug,
  getPageContentsByMenu,
  updatePageContent,
  deletePageContent,
  publishPageContent,
  searchPageContents,
};
