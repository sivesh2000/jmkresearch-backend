const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const permissionSchema = mongoose.Schema(
  {
    domain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Domain',
      required: true,
    },
    actions: {
      type: String,
    },
    instance: {
      type: String,
      trim: true,
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Drop the problematic index if it exists
permissionSchema.index({ name: 1 }, { background: true, sparse: true });
permissionSchema.index({ code: 1 }, { background: true, sparse: true });

permissionSchema.plugin(toJSON);
permissionSchema.plugin(paginate);

const Permission = mongoose.model('Permission', permissionSchema);
module.exports = Permission;
