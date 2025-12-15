const Joi = require('joi');
const { objectId } = require('./custom.validation');

const uploadAsset = {
  body: Joi.object().keys({
    category: Joi.string().valid('document', 'image', 'logo', 'banner', 'icon', 'other'),
    tags: Joi.array().items(Joi.string()),
    alt: Joi.string(),
    description: Joi.string(),
    companyId: Joi.string().custom(objectId),
    pageId: Joi.string().custom(objectId),
    isPublic: Joi.boolean(),
  }),
};

const getAssets = {
  query: Joi.object().keys({
    category: Joi.string(),
    companyId: Joi.string().custom(objectId),
    pageId: Joi.string().custom(objectId),
    tags: Joi.string(),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAsset = {
  params: Joi.object().keys({
    assetId: Joi.string().custom(objectId),
  }),
};

const updateAsset = {
  params: Joi.object().keys({
    assetId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      category: Joi.string().valid('document', 'image', 'logo', 'banner', 'icon', 'other'),
      tags: Joi.array().items(Joi.string()),
      alt: Joi.string(),
      description: Joi.string(),
      isPublic: Joi.boolean(),
      status: Joi.string().valid('Active', 'Inactive'),
    })
    .min(1),
};

const deleteAsset = {
  params: Joi.object().keys({
    assetId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  uploadAsset,
  getAssets,
  getAsset,
  updateAsset,
  deleteAsset,
};
