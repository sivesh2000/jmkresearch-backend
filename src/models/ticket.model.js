const mongoose = require('mongoose');
const moment = require('moment');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true, index: true },
    issueType: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    categoryId: { type: String, required: false },
    issue: { type: String, required: false, default: '' },
    description: { type: String },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed', 'Reopen', 'Escalate'],
      default: 'Open',
    },
    email: { type: String, required: false },
    contactNumber: { type: String, required: false },

    attachment1: { name: String, contentType: String, data: Buffer },
    attachment2: { name: String, contentType: String, data: Buffer },
    attachment3: { name: String, contentType: String, data: Buffer },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Format output for frontend
ticketSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    return {
      ...ret,
      id: ret._id,
      createdAtFormatted: moment(ret.createdAt).format('DD MMM YYYY, hh:mm A'),
      updatedAtFormatted: moment(ret.updatedAt).format('DD MMM YYYY, hh:mm A'),
      _id: undefined,
    };
  },
});

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
