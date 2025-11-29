const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { TicketResponse, Ticket } = require('../models');
const ApiError = require('../utils/ApiError');
const { sendTicketResponseNotificationAsync } = require('../utils/email');

const addResponse = async (req, res, next) => {
  try {
    const { ticketId, message, status, priority, assignedTo, attachment1Base64, attachment2Base64, attachment3Base64 } =
      req.body;
    const createdBy = (req.user && req.user._id) || req.body.createdBy;
    const { user } = req;

    const ticket = await Ticket.findById(ticketId).populate('createdBy', 'name email').populate('assignedTo', 'name email');
    if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');

    const senderType = user.userType;

    const decodeBase64 = (base64String, suffix) => {
      if (!base64String) return null;
      let contentType = 'application/octet-stream';
      let dataPart = base64String;
      const matches = base64String.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const [, matchedType, matchedData] = matches;
        contentType = matchedType;
        dataPart = matchedData;
      }
      return {
        name: `response_${ticketId}_${suffix}.${contentType.split('/')[1] || 'bin'}`,
        contentType,
        data: Buffer.from(dataPart, 'base64'),
      };
    };

    const att1 = decodeBase64(attachment1Base64, '1');
    const att2 = decodeBase64(attachment2Base64, '2');
    const att3 = decodeBase64(attachment3Base64, '3');

    const response = await TicketResponse.create({
      ticketRef: ticket._id,
      message,
      createdBy,
      senderType,
      attachment1: att1,
      attachment2: att2,
      attachment3: att3,
    });

    let ticketUpdated = false;

    // First response assignment
    if (!ticket.assignedTo) {
      ticket.assignedTo = createdBy;
      ticketUpdated = true;
    }

    if (user.userType === 'super_admin' || user.userType === 'custom') {
      if (status && ['Open', 'In Progress', 'Resolved', 'Closed', 'Reopen'].includes(status)) {
        ticket.status = status;
        ticketUpdated = true;
      }
      if (priority && ['Low', 'Medium', 'High', 'Critical'].includes(priority)) {
        ticket.priority = priority;
        ticketUpdated = true;
      }
      if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
        ticket.assignedTo = assignedTo;
        ticketUpdated = true;
      }
    }

    if (ticketUpdated) await ticket.save();

    const updatedTicket = await Ticket.findById(ticketId)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    const populated = await TicketResponse.findById(response._id)
      .populate('ticketRef', 'ticketNumber issueType issue status priority')
      .populate({
        path: 'createdBy',
        select: 'name email userType mainDealerRef',
        populate: { path: 'mainDealerRef', select: 'name email userType' },
      });

    setImmediate(() => {
      sendTicketResponseNotificationAsync(updatedTicket, user, message, ticketUpdated);
    });

    res.status(httpStatus.CREATED).json({
      message: ticketUpdated ? 'Response added and ticket updated successfully' : 'Response added successfully',
      response: populated,
    });
  } catch (err) {
    next(err);
  }
};

const downloadResponseAttachment = async (req, res, next) => {
  try {
    const { responseId, num } = req.params;

    if (!['1', '2', '3'].includes(num)) {
      return res.status(400).send('Invalid attachment number');
    }

    const response = await TicketResponse.findById(responseId).lean();
    if (!response) return res.status(404).send('Response not found');

    const field = `attachment${num}`;
    const attachment = response[field];
    if (!attachment || !attachment.data) {
      return res.status(404).send('Attachment not found');
    }

    const fileBuffer = Buffer.from(attachment.data.buffer || attachment.data);
    const fileName =
      attachment.name ||
      `response_attachment_${num}.${(attachment.contentType && attachment.contentType.split('/')[1]) || 'bin'}`;

    res.setHeader('Content-Type', attachment.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    return res.end(fileBuffer);
  } catch (err) {
    next(err);
  }
};

const getResponsesByTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const responses = await TicketResponse.find({ ticketRef: ticketId })
      .populate('ticketRef', 'ticketNumber issueType issue status priority')
      .populate({
        path: 'createdBy',
        select: 'name email userType mainDealerRef',
        populate: { path: 'mainDealerRef', select: 'name email userType' },
      })
      .sort({ createdAt: 1 });

    res.status(httpStatus.OK).json(responses);
  } catch (err) {
    next(err);
  }
};

const getAllResponses = async (req, res, next) => {
  try {
    const allResponses = await TicketResponse.find()
      .populate('ticketRef', 'ticketNumber issueType issue status priority')
      .populate({
        path: 'createdBy',
        select: 'name email userType mainDealerRef',
        populate: { path: 'mainDealerRef', select: 'name email userType' },
      })
      .sort({ createdAt: -1 });

    res.status(httpStatus.OK).json(allResponses);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addResponse,
  getResponsesByTicket,
  getAllResponses,
  downloadResponseAttachment,
};
