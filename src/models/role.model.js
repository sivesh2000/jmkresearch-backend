const mongoose = require('mongoose');
const moment = require('moment');

const roleSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
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

// Format createdAt and updatedAt in JSON output
roleSchema.methods.toJSON = function () {
  const role = this.toObject();

  role.createdAt = moment(role.createdAt).format('DD-MMM-YYYY hh:mm A');
  role.updatedAt = moment(role.updatedAt).format('DD-MMM-YYYY hh:mm A');

  return role;
};

/**
 * @typedef Role
 */
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
