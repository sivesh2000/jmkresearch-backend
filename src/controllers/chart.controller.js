const httpStatus = require('http-status');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { chartService } = require('../services');

const upload = multer({ dest: 'uploads/' });

const uploadDataset = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  const { name, description } = req.body;
  const results = [];
  let headers = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('headers', (headerList) => {
      headers = headerList;
    })
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const columns = headers.map((header) => ({
          name: header,
          type: 'string',
          label: header,
        }));

        const dataset = await chartService.createDataset(
          {
            name,
            description,
            data: results,
            columns,
            source: req.file.originalname,
          },
          req.user.id
        );

        fs.unlinkSync(req.file.path);
        res.status(httpStatus.CREATED).send(dataset);
      } catch (error) {
        fs.unlinkSync(req.file.path);
        throw error;
      }
    });
});

const createDataset = catchAsync(async (req, res) => {
  const dataset = await chartService.createDataset(req.body, req.user.id);
  res.status(httpStatus.CREATED).send(dataset);
});

const createChart = catchAsync(async (req, res) => {
  const chart = await chartService.createChart(req.body, req.user.id);
  res.status(httpStatus.CREATED).send(chart);
});

const createPlacement = catchAsync(async (req, res) => {
  const placement = await chartService.createPlacement(req.body, req.user.id);
  res.status(httpStatus.CREATED).send(placement);
});

const getCharts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['chartType', 'status', 'tags', 'companyId', 'stateId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await chartService.queryCharts(filter, options);
  res.send(result);
});

const getChart = catchAsync(async (req, res) => {
  const chart = await chartService.getChartById(req.params.chartId);
  res.send(chart);
});

const getChartData = catchAsync(async (req, res) => {
  const filters = req.body.filters || [];
  const chart = await chartService.getChartWithData(req.params.chartId, filters);
  res.send(chart);
});

const updateChart = catchAsync(async (req, res) => {
  const chart = await chartService.updateChartById(req.params.chartId, req.body, req.user.id);
  res.send(chart);
});

const deleteChart = catchAsync(async (req, res) => {
  await chartService.deleteChartById(req.params.chartId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getPageCharts = catchAsync(async (req, res) => {
  const charts = await chartService.getPageCharts(req.params.pageId);
  res.send(charts);
});

const quickSetup = catchAsync(async (req, res) => {
  const { datasetName, chartName, chartType, csvData, pageId } = req.body;

  // Process CSV data
  const lines = csvData.split('\n').filter((line) => line.trim());
  const headers = lines[0].split(',').map((h) => h.trim());
  const data = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    return row;
  });

  const columns = headers.map((header) => ({
    name: header,
    type: 'string',
    label: header,
  }));

  // Create dataset
  const dataset = await chartService.createDataset(
    {
      name: datasetName,
      data,
      columns,
      source: 'Quick Setup',
    },
    req.user.id
  );

  // Create chart
  const chart = await chartService.createChart(
    {
      name: chartName,
      titleFrontend: chartName,
      chartType,
      datasetId: dataset._id,
      mapping: {
        xKey: headers[0],
        yKeys: headers.slice(1),
      },
    },
    req.user.id
  );

  // Create placement if pageId provided
  let placement = null;
  if (pageId) {
    placement = await chartService.createPlacement(
      {
        pageId,
        chartId: chart._id,
      },
      req.user.id
    );
  }

  res.status(httpStatus.CREATED).send({ dataset, chart, placement });
});

module.exports = {
  uploadDataset: [upload.single('file'), uploadDataset],
  createDataset,
  createChart,
  createPlacement,
  getCharts,
  getChart,
  getChartData,
  updateChart,
  deleteChart,
  getPageCharts,
  quickSetup,
};
