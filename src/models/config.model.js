const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const configSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dataType: { type: String, enum: ['string', 'number', 'boolean', 'object', 'array'], default: 'string' },
    isActive: { type: Boolean, default: true },
    isEditable: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

configSchema.plugin(toJSON);
configSchema.plugin(paginate);

configSchema.index({ key: 1 });
configSchema.index({ category: 1, isActive: 1 });

configSchema.statics.getByKey = function (key) {
  return this.findOne({ key, isActive: true });
};

configSchema.statics.getByCategory = function (category) {
  return this.find({ category, isActive: true }).sort({ key: 1 });
};

configSchema.statics.getValue = async function (key, defaultValue = null) {
  const config = await this.findOne({ key, isActive: true });
  return config ? config.value : defaultValue;
};

module.exports = mongoose.model('Config', configSchema);
