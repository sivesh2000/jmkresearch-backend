const httpStatus = require('http-status');
const { Ticket, User, Master } = require('../models');
const ApiError = require('../utils/ApiError');
const { getTicketsByUserRole } = require('../services/ticket.service');
const { sendTicketNotificationAsync } = require('../utils/email');

const createTicket = async (req, res, next) => {
  try {
    const {
      issueType,
      subCategory,
      issue,
      description,
      priority,
      email,
      contactNumber,
      attachment1Base64,
      attachment2Base64,
      attachment3Base64,
    } = req.body;

    const createdBy = req.user._id;
    const user = await User.findById(createdBy).populate(['dealerRef', 'mainDealerRef']);
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

    // Get categoryId from master data based on issueType
    const masterData = await Master.findOne({ code: 'master_data' });
    const category =
      masterData && masterData.issueCategory && masterData.issueCategory.find((cat) => cat.name === issueType);
    const categoryId = (category && category.id) || null;

    const lastTicket = await Ticket.findOne().sort({ createdAt: -1 });
    let ticketNumber = 'TCKT-0001';
    if (lastTicket && lastTicket.ticketNumber) {
      const lastNum = parseInt(lastTicket.ticketNumber.replace('TCKT-', ''), 10) || 0;
      ticketNumber = `TCKT-${String(lastNum + 1).padStart(4, '0')}`;
    }

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
        name: `${ticketNumber}_${suffix}.${contentType.split('/')[1] || 'bin'}`,
        contentType,
        data: Buffer.from(dataPart, 'base64'),
      };
    };

    const att1 = decodeBase64(attachment1Base64, '1');
    const att2 = decodeBase64(attachment2Base64, '2');
    const att3 = decodeBase64(attachment3Base64, '3');

    const newTicket = await Ticket.create({
      ticketNumber,
      issueType,
      subCategory,
      categoryId,
      email,
      contactNumber,
      issue,
      description,
      priority,
      createdBy,
      assignedTo: null,
      attachment1: att1,
      attachment2: att2,
      attachment3: att3,
    });

    setImmediate(() => {
      sendTicketNotificationAsync(newTicket, user, categoryId);
    });

    res.status(httpStatus.CREATED).json({
      message: 'Ticket created successfully',
      ticket: newTicket,
    });
  } catch (err) {
    next(err);
  }
};

const downloadAttachment = async (req, res, next) => {
  try {
    const { ticketId, num } = req.params;

    if (!['1', '2', '3'].includes(num)) {
      return res.status(400).send('Invalid attachment number');
    }

    const ticket = await Ticket.findById(ticketId).lean();
    if (!ticket) return res.status(404).send('Ticket not found');

    const field = `attachment${num}`;
    const attachment = ticket[field];
    if (!attachment || !attachment.data) {
      return res.status(404).send('Attachment not found');
    }

    const fileBuffer = Buffer.from(attachment.data.buffer || attachment.data);
    const fileName =
      attachment.name || `attachment_${num}.${(attachment.contentType && attachment.contentType.split('/')[1]) || 'bin'}`;

    res.setHeader('Content-Type', attachment.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    return res.end(fileBuffer);
  } catch (err) {
    next(err);
  }
};

const getTickets = async (req, res, next) => {
  try {
    const filter = {
      status: req.query.status,
      priority: req.query.priority,
      issueType: req.query.issueType,
    };

    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sortBy: req.query.sortBy || 'createdAt:desc',
    };

    const result = await getTicketsByUserRole(req.user, filter, options);
    res.status(httpStatus.OK).json(result);
  } catch (err) {
    next(err);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId)
      .populate({
        path: 'createdBy',
        select: 'name email userType mainDealerRef contactPersonMobile',
        populate: { path: 'mainDealerRef', select: 'name email userType' },
      })
      .populate('assignedTo', 'name email userType');

    if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');

    const { user } = req;
    if (user.userType !== 'super_admin' && ticket.createdBy._id.toString() !== user._id.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are not allowed to view this ticket');
    }

    res.status(httpStatus.OK).json(ticket);
  } catch (err) {
    next(err);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { id, ticketId } = req.params;
    const actualId = ticketId || id;

    const ticket = await Ticket.findById(actualId);
    if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');

    const allowedFields = ['status', 'priority', 'assignedTo'];
    allowedFields.forEach((key) => {
      if (req.body[key] !== undefined) ticket[key] = req.body[key];
    });
    await ticket.save();

    const updated = await Ticket.findById(actualId).populate('createdBy', 'name email').populate('assignedTo', 'name email');

    res.status(httpStatus.OK).json({
      message: 'Ticket updated successfully',
      ticket: updated,
    });
  } catch (err) {
    next(err);
  }
};

const getIssueTypes = async (req, res, next) => {
  try {
    const masterData = await Master.findOne({ code: 'master_data' });
    if (!masterData || !masterData.issueCategory) {
      return res.status(httpStatus.OK).json([]);
    }

    const issueTypes = masterData.issueCategory.map((category) => category.name);
    res.status(httpStatus.OK).json(issueTypes);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  downloadAttachment,
  getIssueTypes,
};
