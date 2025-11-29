const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const userRoleSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique user-role combinations
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });

userRoleSchema.plugin(toJSON);
userRoleSchema.plugin(paginate);

const UserRole = mongoose.model('UserRole', userRoleSchema);

module.exports = UserRole;
