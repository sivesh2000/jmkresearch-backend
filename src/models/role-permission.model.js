const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const rolePermissionSchema = mongoose.Schema(
  {
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    permissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique role-permission combinations
rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

rolePermissionSchema.plugin(toJSON);
rolePermissionSchema.plugin(paginate);

const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);

module.exports = RolePermission;
