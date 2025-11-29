const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const districtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
    districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'District' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

districtSchema.index({ stateId: 1, name: 1 }, { unique: true });
citySchema.index({ stateId: 1, name: 1 }, { unique: true });

module.exports = {
  State: mongoose.model('State', stateSchema),
  District: mongoose.model('District', districtSchema),
  City: mongoose.model('City', citySchema),
};
