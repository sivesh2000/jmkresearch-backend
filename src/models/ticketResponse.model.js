const mongoose = require('mongoose');
const moment = require('moment');

const ticketResponseSchema = new mongoose.Schema(
  {
    ticketRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    message: { type: String, required: true, trim: true },

    attachment1: { name: String, contentType: String, data: Buffer },
    attachment2: { name: String, contentType: String, data: Buffer },
    attachment3: { name: String, contentType: String, data: Buffer },
    senderType: {
      type: String,
      enum: ['user', 'dealer', 'main_dealer', 'super_admin', 'custom'],
      required: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ticketResponseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    return {
      ...ret,
      id: ret._id,
      createdAtFormatted: moment(ret.createdAt).format('DD MMM YYYY, hh:mm A'),
      _id: undefined,
    };
  },
});

const TicketResponse = mongoose.model('TicketResponse', ticketResponseSchema);
module.exports = TicketResponse;
