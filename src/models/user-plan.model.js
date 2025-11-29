const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const userPlanSchema = mongoose.Schema(
  {
    planRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mrp: {
      type: Number,
      required: true,
    },
    dlp: {
      type: Number,
      required: true,
    },
    canEditMRP: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique plan-user combination
userPlanSchema.index({ planRef: 1, userRef: 1 }, { unique: true });

userPlanSchema.plugin(toJSON);
userPlanSchema.plugin(paginate);

const UserPlan = mongoose.model('UserPlan', userPlanSchema);

module.exports = UserPlan;
