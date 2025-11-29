const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const thirdPartyLogSchema = mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    certificateRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate',
      required: true,
    },
    requestUrl: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    },
    headers: {
      type: Object,
      default: {},
    },
    payload: {
      type: Object,
      default: {},
    },
    response: {
      type: Object,
      default: {},
    },
    statusCode: {
      type: Number,
    },
    success: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

thirdPartyLogSchema.plugin(toJSON);
thirdPartyLogSchema.plugin(paginate);

const ThirdPartyLog = mongoose.model('ThirdPartyLog', thirdPartyLogSchema);

module.exports = ThirdPartyLog;
