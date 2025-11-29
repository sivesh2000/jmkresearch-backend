const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addResponse = {
  body: Joi.object().keys({
    ticketId: Joi.string().required().custom(objectId),
    message: Joi.string().required().trim(),
    createdBy: Joi.string().custom(objectId).allow(null, ''),
    status: Joi.string().valid('Open', 'In Progress', 'Resolved', 'Closed', 'Reopen', 'Escalate').optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').optional(),
    assignedTo: Joi.string().custom(objectId).optional(),
    attachment1Base64: Joi.string().optional(),
    attachment2Base64: Joi.string().optional(),
    attachment3Base64: Joi.string().optional(),
  }),
};

const getResponses = {
  params: Joi.object().keys({
    ticketId: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  addResponse,
  getResponses,
};
