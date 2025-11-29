const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const domainSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

domainSchema.plugin(toJSON);
domainSchema.plugin(paginate);

const Domain = mongoose.model('Domain', domainSchema);
module.exports = Domain;
