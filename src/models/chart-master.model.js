const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const chartMasterSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true },
    name: { type: String, required: true },
    titleFrontend: { type: String },

    chartType: {
      type: String,
      enum: ['line', 'bar', 'stackedBar', 'area', 'pie', 'donut', 'scatter', 'table'],
      required: true,
    },

    datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartDataset', required: true },

    mapping: {
      xKey: { type: String },
      yKeys: [{ type: String }],
      groupKey: { type: String },
      docIdField: { type: String },
    },

    axis: {
      xLabel: { type: String },
      yLabel: { type: String },
      showLabel: { type: Boolean, default: true },
    },

    options: {
      showLegend: { type: Boolean, default: true },
      stacked: { type: Boolean, default: false },
      enableSearchInTable: { type: Boolean, default: false },
      normalizeToPercent: { type: Boolean, default: false },
    },

    tags: [{ type: String }],
    status: { type: String, enum: ['Active', 'Inactive', 'Draft'], default: 'Active' },
    version: { type: Number, default: 1 },
    lastImportedAt: { type: Date },

    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

chartMasterSchema.index({ status: 1, chartType: 1 });
chartMasterSchema.index({ tags: 1 });
chartMasterSchema.index({ companyId: 1 });
chartMasterSchema.index({ stateId: 1 });
chartMasterSchema.index({ code: 1 });

// add plugin that converts mongoose to json
chartMasterSchema.plugin(toJSON);
chartMasterSchema.plugin(paginate);

module.exports = mongoose.model('ChartMaster', chartMasterSchema);
