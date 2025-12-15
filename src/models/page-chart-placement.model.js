const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const pageChartPlacementSchema = new mongoose.Schema(
  {
    pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'PageContent', required: true },
    chartId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChartMaster', required: true },

    section: { type: String, default: 'main' },
    position: { type: Number, default: 0 },
    width: { type: String, enum: ['full', 'half', 'third', 'auto'], default: 'auto' },
    priority: { type: Number, default: 0 },

    visibleFrom: { type: Date },
    visibleTo: { type: Date },
    isVisible: { type: Boolean, default: true },

    overrideTitle: { type: String },
    overrideAxis: {
      xLabel: { type: String },
      yLabel: { type: String },
      showLabel: { type: Boolean },
    },
    overrideOptions: {
      showLegend: { type: Boolean },
      stacked: { type: Boolean },
      enableSearchInTable: { type: Boolean },
      normalizeToPercent: { type: Boolean },
    },
    overrideMapping: {
      xKey: { type: String },
      yKeys: [{ type: String }],
      groupKey: { type: String },
      docIdField: { type: String },
    },

    filters: [
      {
        field: { type: String },
        op: { type: String, enum: ['eq', 'neq', 'in', 'nin', 'gte', 'lte', 'contains'] },
        value: { type: mongoose.Schema.Types.Mixed },
      },
    ],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

pageChartPlacementSchema.index({ pageId: 1, section: 1, position: 1 });
pageChartPlacementSchema.index({ chartId: 1 });
pageChartPlacementSchema.index({ isVisible: 1, visibleFrom: 1, visibleTo: 1 });

// add plugin that converts mongoose to json
pageChartPlacementSchema.plugin(toJSON);
pageChartPlacementSchema.plugin(paginate);

module.exports = mongoose.model('PageChartPlacement', pageChartPlacementSchema);
