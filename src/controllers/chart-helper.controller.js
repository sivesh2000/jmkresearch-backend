const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
// const { chartService } = require('../services');
const { ChartDataset, PageContent } = require('../models');

const getChartTypes = catchAsync(async (req, res) => {
  const chartTypes = [
    { value: 'line', label: 'Line Chart', description: 'Best for trends over time' },
    { value: 'bar', label: 'Bar Chart', description: 'Compare different categories' },
    { value: 'stackedBar', label: 'Stacked Bar', description: 'Show parts of a whole' },
    { value: 'area', label: 'Area Chart', description: 'Show volume over time' },
    { value: 'pie', label: 'Pie Chart', description: 'Show proportions' },
    { value: 'donut', label: 'Donut Chart', description: 'Show proportions with center space' },
    { value: 'scatter', label: 'Scatter Plot', description: 'Show relationships between variables' },
    { value: 'table', label: 'Data Table', description: 'Display raw data in table format' },
  ];
  res.send(chartTypes);
});

const getDatasets = catchAsync(async (req, res) => {
  const datasets = await ChartDataset.find({ status: 'Active' })
    .select('_id name description columns createdAt')
    .sort({ createdAt: -1 });
  res.send(datasets);
});

const getPages = catchAsync(async (req, res) => {
  const pages = await PageContent.find({ status: 'Active' }).select('_id title slug').sort({ title: 1 });
  res.send(pages);
});

const getDatasetColumns = catchAsync(async (req, res) => {
  const dataset = await ChartDataset.findById(req.params.datasetId);
  if (!dataset) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Dataset not found' });
  }
  res.send(dataset.columns);
});

const previewChart = catchAsync(async (req, res) => {
  const { datasetId, chartType, mapping } = req.body;

  const dataset = await ChartDataset.findById(datasetId);
  if (!dataset) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Dataset not found' });
  }

  // Return sample data (first 10 rows) for preview
  const sampleData = dataset.data.slice(0, 10);

  res.send({
    chartType,
    mapping,
    data: sampleData,
    columns: dataset.columns,
  });
});

const getChartSuggestions = catchAsync(async (req, res) => {
  const { datasetId } = req.params;

  const dataset = await ChartDataset.findById(datasetId);
  if (!dataset) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Dataset not found' });
  }

  const suggestions = [];
  const numericColumns = dataset.columns.filter((col) => col.type === 'number');
  const stringColumns = dataset.columns.filter((col) => col.type === 'string');
  const dateColumns = dataset.columns.filter((col) => col.type === 'date');

  // Suggest line chart for time series
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    suggestions.push({
      chartType: 'line',
      title: 'Time Series Analysis',
      mapping: {
        xKey: dateColumns[0].name,
        yKeys: [numericColumns[0].name],
      },
      reason: 'Perfect for showing trends over time',
    });
  }

  // Suggest bar chart for categorical data
  if (stringColumns.length > 0 && numericColumns.length > 0) {
    suggestions.push({
      chartType: 'bar',
      title: 'Category Comparison',
      mapping: {
        xKey: stringColumns[0].name,
        yKeys: [numericColumns[0].name],
      },
      reason: 'Great for comparing different categories',
    });
  }

  // Suggest pie chart for proportional data
  if (stringColumns.length > 0 && numericColumns.length > 0) {
    suggestions.push({
      chartType: 'pie',
      title: 'Proportion Analysis',
      mapping: {
        xKey: stringColumns[0].name,
        yKeys: [numericColumns[0].name],
      },
      reason: 'Shows how parts relate to the whole',
    });
  }

  res.send(suggestions);
});

module.exports = {
  getChartTypes,
  getDatasets,
  getPages,
  getDatasetColumns,
  previewChart,
  getChartSuggestions,
};
