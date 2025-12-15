const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const chartDatasetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON data
    columns: [
      {
        name: { type: String, required: true },
        type: { type: String, enum: ['string', 'number', 'date'], default: 'string' },
        label: { type: String },
      },
    ],
    source: { type: String }, // file name or source info
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

chartDatasetSchema.index({ status: 1 });
chartDatasetSchema.index({ name: 1 });

// add plugin that converts mongoose to json
chartDatasetSchema.plugin(toJSON);
chartDatasetSchema.plugin(paginate);

module.exports = mongoose.model('ChartDataset', chartDatasetSchema);
