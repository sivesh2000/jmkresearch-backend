const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDataset = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
    data: Joi.alternatives().try(Joi.array(), Joi.object()).required(),
    columns: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid('string', 'number', 'date').default('string'),
        label: Joi.string(),
      })
    ),
    source: Joi.string(),
    status: Joi.string().valid('Active', 'Inactive'),
  }),
};

const createChart = {
  body: Joi.object().keys({
    code: Joi.string(),
    name: Joi.string().required(),
    titleFrontend: Joi.string(),
    chartType: Joi.string().valid('line', 'bar', 'stackedBar', 'area', 'pie', 'donut', 'scatter', 'table').required(),
    datasetId: Joi.string().custom(objectId).required(),
    mapping: Joi.object({
      xKey: Joi.string(),
      yKeys: Joi.array().items(Joi.string()),
      groupKey: Joi.string(),
      docIdField: Joi.string(),
    }),
    axis: Joi.object({
      xLabel: Joi.string(),
      yLabel: Joi.string(),
      showLabel: Joi.boolean(),
    }),
    options: Joi.object({
      showLegend: Joi.boolean(),
      stacked: Joi.boolean(),
      enableSearchInTable: Joi.boolean(),
      normalizeToPercent: Joi.boolean(),
    }),
    tags: Joi.array().items(Joi.string()),
    status: Joi.string().valid('Active', 'Inactive', 'Draft'),
    companyId: Joi.string().custom(objectId),
    stateId: Joi.string().custom(objectId),
  }),
};

const createPlacement = {
  body: Joi.object().keys({
    pageId: Joi.string().custom(objectId).required(),
    chartId: Joi.string().custom(objectId).required(),
    section: Joi.string().default('main'),
    position: Joi.number().default(0),
    width: Joi.string().valid('full', 'half', 'third', 'auto').default('auto'),
    priority: Joi.number().default(0),
    visibleFrom: Joi.date(),
    visibleTo: Joi.date(),
    isVisible: Joi.boolean().default(true),
    overrideTitle: Joi.string(),
    overrideAxis: Joi.object({
      xLabel: Joi.string(),
      yLabel: Joi.string(),
      showLabel: Joi.boolean(),
    }),
    overrideOptions: Joi.object({
      showLegend: Joi.boolean(),
      stacked: Joi.boolean(),
      enableSearchInTable: Joi.boolean(),
      normalizeToPercent: Joi.boolean(),
    }),
    overrideMapping: Joi.object({
      xKey: Joi.string(),
      yKeys: Joi.array().items(Joi.string()),
      groupKey: Joi.string(),
      docIdField: Joi.string(),
    }),
    filters: Joi.array().items(
      Joi.object({
        field: Joi.string().required(),
        op: Joi.string().valid('eq', 'neq', 'in', 'nin', 'gte', 'lte', 'contains').required(),
        value: Joi.alternatives().try(Joi.string(), Joi.number(), Joi.array(), Joi.boolean()).required(),
      })
    ),
  }),
};

const uploadData = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string(),
  }),
};

const getCharts = {
  query: Joi.object().keys({
    chartType: Joi.string(),
    status: Joi.string(),
    tags: Joi.string(),
    companyId: Joi.string().custom(objectId),
    stateId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getChart = {
  params: Joi.object().keys({
    chartId: Joi.string().custom(objectId),
  }),
};

const updateChart = {
  params: Joi.object().keys({
    chartId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      titleFrontend: Joi.string(),
      chartType: Joi.string().valid('line', 'bar', 'stackedBar', 'area', 'pie', 'donut', 'scatter', 'table'),
      mapping: Joi.object(),
      axis: Joi.object(),
      options: Joi.object(),
      tags: Joi.array().items(Joi.string()),
      status: Joi.string().valid('Active', 'Inactive', 'Draft'),
    })
    .min(1),
};

const deleteChart = {
  params: Joi.object().keys({
    chartId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createDataset,
  createChart,
  createPlacement,
  uploadData,
  getCharts,
  getChart,
  updateChart,
  deleteChart,
};
