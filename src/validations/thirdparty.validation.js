// src/validations/thirdparty.validation.js
const Joi = require('joi');
const { objectId } = require('./custom.validation');

const sendCertificateKeyologicData = {
  body: Joi.object().keys({
    certificateId: Joi.string().custom(objectId).required(),
  }),
};

const getThirdPartyLogs = {
  query: Joi.object().keys({
    provider: Joi.string(),
    certificateRef: Joi.string().custom(objectId),
    success: Joi.boolean(),
    statusCode: Joi.number(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getThirdPartyLog = {
  params: Joi.object().keys({
    logId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  sendCertificateKeyologicData,
  getThirdPartyLogs,
  getThirdPartyLog,
};
