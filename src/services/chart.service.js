const httpStatus = require('http-status');
const { ChartDataset, ChartMaster, PageChartPlacement } = require('../models');
const ApiError = require('../utils/ApiError');

const createDataset = async (datasetBody, userId) => {
  return ChartDataset.create({ ...datasetBody, createdBy: userId, updatedBy: userId });
};

const createChart = async (chartBody, userId) => {
  return ChartMaster.create({ ...chartBody, createdBy: userId, updatedBy: userId });
};

const createPlacement = async (placementBody, userId) => {
  return PageChartPlacement.create({ ...placementBody, createdBy: userId, updatedBy: userId });
};

const queryCharts = async (filter, options) => {
  const charts = await ChartMaster.paginate(filter, options);
  return charts;
};

const getChartById = async (id) => {
  const chart = await ChartMaster.findById(id).populate('datasetId');
  if (!chart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chart not found');
  }
  return chart;
};

const updateChartById = async (chartId, updateBody, userId) => {
  const chart = await getChartById(chartId);
  Object.assign(chart, { ...updateBody, updatedBy: userId });
  await chart.save();
  return chart;
};

const deleteChartById = async (chartId) => {
  const chart = await getChartById(chartId);
  await chart.remove();
  return chart;
};

const getChartWithData = async (chartId, filters = []) => {
  const chart = await ChartMaster.findById(chartId).populate('datasetId');
  if (!chart) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Chart not found');
  }

  let { data } = chart.datasetId;

  // Apply filters if provided
  if (filters.length > 0) {
    data = data.filter((row) => {
      return filters.every((filter) => {
        const value = row[filter.field];
        switch (filter.op) {
          case 'eq':
            return value === filter.value;
          case 'neq':
            return value !== filter.value;
          case 'in':
            return filter.value.includes(value);
          case 'nin':
            return !filter.value.includes(value);
          case 'gte':
            return value >= filter.value;
          case 'lte':
            return value <= filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
          default:
            return true;
        }
      });
    });
  }

  return { ...chart.toObject(), datasetId: { ...chart.datasetId.toObject(), data } };
};

const getPageCharts = async (pageId) => {
  const placements = await PageChartPlacement.find({
    pageId,
    isVisible: true,
    $and: [
      { $or: [{ visibleFrom: { $exists: false } }, { visibleFrom: { $lte: new Date() } }] },
      { $or: [{ visibleTo: { $exists: false } }, { visibleTo: { $gte: new Date() } }] },
    ],
  })
    .populate({
      path: 'chartId',
      populate: { path: 'datasetId' },
    })
    .sort({ section: 1, priority: -1, position: 1 });

  return placements;
};

const processCSVData = (csvData, columns) => {
  const lines = csvData.split('\n').filter((line) => line.trim());
  const headers = lines[0].split(',').map((h) => h.trim());

  const data = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      const column = columns.find((c) => c.name === header);
      let value = values[index];

      if (column && column.type === 'number') {
        value = parseFloat(value) || 0;
      } else if (column && column.type === 'date') {
        value = new Date(value);
      }

      row[header] = value;
    });
    return row;
  });

  return { headers, data };
};

module.exports = {
  createDataset,
  createChart,
  createPlacement,
  queryCharts,
  getChartById,
  updateChartById,
  deleteChartById,
  getChartWithData,
  getPageCharts,
  processCSVData,
};
