const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTicket = {
  body: Joi.object().keys({
    issueType: Joi.string().required(),
    subCategory: Joi.string().required(),
    issue: Joi.string().optional().allow(''),
    description: Joi.string().required(),
    priority: Joi.string().required(),
    email: Joi.string().email().optional().allow(''),
    contactNumber: Joi.string().optional().allow(''),
    attachment1Base64: Joi.string().optional(),
    attachment2Base64: Joi.string().optional(),
    attachment3Base64: Joi.string().optional(),
  }),
};

const getTickets = {
  query: Joi.object().keys({
    issueType: Joi.string(),
    status: Joi.string().valid('Open', 'In Progress', 'Resolved', 'Closed', 'Reopen'),

    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical'),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

const getTicket = {
  params: Joi.object().keys({
    ticketId: Joi.string().custom(objectId).required(),
  }),
};

// updateTicket schema — added assignedTo field
const updateTicket = {
  params: Joi.object().keys({
    ticketId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .min(1)
    .keys({
      status: Joi.string().valid('Open', 'In Progress', 'Resolved', 'Closed', 'Reopen'),
      priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical'),
      assignedTo: Joi.string().custom(objectId).optional(),
    }),
};

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
};
