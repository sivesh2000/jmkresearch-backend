const TicketResponse = require('../models/ticketResponse.model');

// Create a ticket response

const createResponse = async (body) => {
  // create response with references only
  const response = await TicketResponse.create({
    ticketRef: body.ticketId,
    message: body.message,
    attachmentUrl: body.attachmentUrl || null,
    createdBy: body.createdBy,
  });

  return response.populate([
    { path: 'ticketRef', select: 'ticketNumber issueType issue' },
    { path: 'createdBy', select: 'name email' },
  ]);
};

// Get all responses by ticket ID (sorted oldest → newest)

const getResponsesByTicket = async (ticketId) => {
  const responses = await TicketResponse.find({ ticketRef: ticketId })
    .populate([
      { path: 'ticketRef', select: 'ticketNumber issueType issue' },
      { path: 'createdBy', select: 'name email' },
    ])
    .sort({ createdAt: 1 });

  return responses;
};

//  Get all responses (optional for admin)

const getAllResponses = async () => {
  return TicketResponse.find()
    .populate([
      { path: 'ticketRef', select: 'ticketNumber issueType issue' },
      { path: 'createdBy', select: 'name email' },
    ])
    .sort({ createdAt: 1 });
};

module.exports = {
  createResponse,
  getResponsesByTicket,
  getAllResponses,
};
