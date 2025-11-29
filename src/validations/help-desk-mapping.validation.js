const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createHelpDeskMapping = {
  body: Joi.object().keys({
    roleRef: Joi.string().custom(objectId),
    categoryId: Joi.string().required(),
    categoryName: Joi.string().required(),
    subCategories: Joi.array().items(
      Joi.object().keys({
        id: Joi.string(),
        name: Joi.string(),
      })
    ),
    email: Joi.array().items(Joi.string().email()),
    phone: Joi.string().allow('', null),
    alternativePhone: Joi.string().allow('', null),
  }),
};

const getHelpDeskMappings = {
  query: Joi.object().keys({
    roleRef: Joi.string().custom(objectId),
    categoryId: Joi.string(),
    subCategories: Joi.array().items(
      Joi.object().keys({
        id: Joi.string(),
        name: Joi.string(),
      })
    ),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getHelpDeskMapping = {
  params: Joi.object().keys({
    helpDeskMappingId: Joi.string().custom(objectId),
  }),
};

const updateHelpDeskMapping = {
  params: Joi.object().keys({
    helpDeskMappingId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      roleRef: Joi.string().custom(objectId),
      categoryId: Joi.string(),
      categoryName: Joi.string(),
      subCategories: Joi.array().items(
        Joi.object().keys({
          id: Joi.string(),
          name: Joi.string(),
        })
      ),
      email: Joi.array().items(Joi.string().email()),
      phone: Joi.string().allow('', null),
      alternativePhone: Joi.string().allow('', null),
    })
    .min(1),
};

const deleteHelpDeskMapping = {
  params: Joi.object().keys({
    helpDeskMappingId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createHelpDeskMapping,
  getHelpDeskMappings,
  getHelpDeskMapping,
  updateHelpDeskMapping,
  deleteHelpDeskMapping,
};
