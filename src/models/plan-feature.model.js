const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const planFeatureSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
    },
    note: {
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

planFeatureSchema.plugin(toJSON);
planFeatureSchema.plugin(paginate);

planFeatureSchema.index({ title: 1 });

const PlanFeature = mongoose.model('PlanFeature', planFeatureSchema);

module.exports = PlanFeature;
