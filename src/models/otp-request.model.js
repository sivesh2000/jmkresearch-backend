const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const otpRequestSchema = mongoose.Schema(
  {
    sentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    requestPayload: {
      type: mongoose.Schema.Types.Mixed,
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
    },
    sentStatus: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    purpose: {
      type: String,
      enum: ['certificate_cancellation', 'general'],
      default: 'general',
    },
  },
  {
    timestamps: true,
  }
);

otpRequestSchema.plugin(toJSON);
otpRequestSchema.plugin(paginate);

otpRequestSchema.index({ mobileNumber: 1 });
otpRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpRequest = mongoose.model('OtpRequest', otpRequestSchema);

module.exports = OtpRequest;
