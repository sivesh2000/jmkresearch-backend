const mongoose = require('mongoose');

const makeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const modelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    makeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Make', required: true },
    isActive: { type: Boolean, default: true },
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], default: 'Petrol' },
  },
  { timestamps: true }
);

modelSchema.index({ makeId: 1, name: 1 }, { unique: true });

module.exports = {
  Make: mongoose.model('Make', makeSchema),
  Model: mongoose.model('Model', modelSchema),
};
