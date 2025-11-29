const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const { getTicketCreatedTemplate, getTicketResponseTemplate } = require('../templates/helpdesk-email-template');
const { HelpDeskMapping, UserRole } = require('../models');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: config.email.smtp.auth.user,
    pass: config.email.smtp.auth.pass,
  },
});

const sendTicketNotificationAsync = async (ticket, user, categoryId) => {
  try {
    const html = getTicketCreatedTemplate(ticket, user);
    const toEmails = [];
    const ccEmails = [];

    const helpDeskMapping = await HelpDeskMapping.findOne({ categoryId }).populate('roleRef');

    if (helpDeskMapping) {
      // TO: HelpDeskMapping emails
      if (helpDeskMapping.email && helpDeskMapping.email.length > 0) {
        const cleanEmails = helpDeskMapping.email.map((email) => email.replace('mailto:', ''));
        toEmails.push(...cleanEmails);
      }

      // TO: Users with roleId from UserRole
      if (helpDeskMapping.roleRef) {
        const userRoles = await UserRole.find({ roleId: helpDeskMapping.roleRef._id }).populate('userId', 'email');
        const roleEmails = userRoles.map((ur) => ur.userId.email).filter(Boolean);
        toEmails.push(...roleEmails);
      }
    }

    // CC: ticket.email (manually entered) + createdBy.email
    if (ticket.email) {
      ccEmails.push(ticket.email);
    }
    if (user.email) {
      ccEmails.push(user.email);
    }

    const uniqueToEmails = [...new Set(toEmails)];
    const uniqueCcEmails = [...new Set(ccEmails)];

    if (uniqueToEmails.length > 0) {
      const mailOptions = {
        from: `"Nyom Support Team" <${config.email.from}>`,
        to: uniqueToEmails,
        cc: uniqueCcEmails,
        subject: `New Ticket Created: ${ticket.ticketNumber}`,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Ticket notification email sent: ${info.response}`);
    }
  } catch (err) {
    logger.error('Failed to send ticket notification email:', err.message);
  }
};

const sendTicketResponseNotificationAsync = async (ticket, responseUser, message, ticketUpdated) => {
  try {
    const html = getTicketResponseTemplate(ticket, responseUser, message, ticketUpdated);
    const toEmails = [];
    const ccEmails = [];

    const helpDeskMapping = await HelpDeskMapping.findOne({ categoryId: ticket.categoryId }).populate('roleRef');

    if (responseUser.userType === 'super_admin') {
      // Super admin response
      // TO: ticket.email + createdBy.email
      if (ticket.email) {
        toEmails.push(ticket.email);
      }
      if (ticket.createdBy && ticket.createdBy.email) {
        toEmails.push(ticket.createdBy.email);
      }

      // CC: HelpDeskMapping emails + replied user email (assignedTo)
      if (helpDeskMapping && helpDeskMapping.email && helpDeskMapping.email.length > 0) {
        const cleanEmails = helpDeskMapping.email.map((email) => email.replace('mailto:', ''));
        ccEmails.push(...cleanEmails);
      }

      if (ticket.assignedTo && ticket.assignedTo.email) {
        ccEmails.push(ticket.assignedTo.email);
      }
    } else {
      // User response
      // TO: HelpDeskMapping emails + assigned user email
      if (helpDeskMapping && helpDeskMapping.email && helpDeskMapping.email.length > 0) {
        const cleanEmails = helpDeskMapping.email.map((email) => email.replace('mailto:', ''));
        toEmails.push(...cleanEmails);
      }

      if (ticket.assignedTo && ticket.assignedTo.email) {
        toEmails.push(ticket.assignedTo.email);
      }

      // CC: ticket.email + createdBy.email
      if (ticket.email) {
        ccEmails.push(ticket.email);
      }
      if (ticket.createdBy && ticket.createdBy.email) {
        ccEmails.push(ticket.createdBy.email);
      }
    }

    const uniqueToEmails = [...new Set(toEmails.filter(Boolean))];
    const uniqueCcEmails = [...new Set(ccEmails.filter(Boolean))];

    if (uniqueToEmails.length > 0) {
      const mailOptions = {
        from: `"Nyom Support Team" <${config.email.from}>`,
        to: uniqueToEmails,
        cc: uniqueCcEmails,
        subject: `Response Added: ${ticket.ticketNumber}`,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Ticket response notification email sent: ${info.response}`);
    }
  } catch (err) {
    logger.error('Failed to send ticket response notification email:', err.message);
  }
};

module.exports = {
  sendTicketNotificationAsync,
  sendTicketResponseNotificationAsync,
  getTicketCreatedTemplate,
  getTicketResponseTemplate,
};
