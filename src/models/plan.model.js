const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const planSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    features: [String],
    planFeatures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlanFeature',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

planSchema.plugin(toJSON);
planSchema.plugin(paginate);

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
