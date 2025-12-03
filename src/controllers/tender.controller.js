const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { tenderService } = require('../services');

const createTender = catchAsync(async (req, res) => {
  const tender = await tenderService.createTender(req.body);
  res.status(httpStatus.CREATED).send(tender);
});

const getTenders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['tenderName', 'technology', 'tenderStatus', 'companyId', 'stateId']);

  if (req.query.search) {
    const searchTerm = req.query.search.trim();
    if (searchTerm) {
      filter.$or = [
        { tenderName: { $regex: searchTerm, $options: 'i' } },
        { tenderScope: { $regex: searchTerm, $options: 'i' } },
        { location: { $regex: searchTerm, $options: 'i' } },
      ];
    }
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!options.sortBy) options.sortBy = 'rfsIssueDate:desc';

  const result = await tenderService.queryTenders(filter, options);
  res.send(result);
});

const getTender = catchAsync(async (req, res) => {
  const tender = await tenderService.getTenderById(req.params.tenderId);
  if (!tender) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tender not found');
  }
  res.send(tender);
});

const getTenderBySlug = catchAsync(async (req, res) => {
  const tender = await tenderService.getTenderBySlug(req.params.slug);
  if (!tender) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tender not found');
  }
  res.send(tender);
});

const updateTender = catchAsync(async (req, res) => {
  const tender = await tenderService.updateTenderById(req.params.tenderId, req.body);
  res.send(tender);
});

const deleteTender = catchAsync(async (req, res) => {
  await tenderService.deleteTenderById(req.params.tenderId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getTendersByTechnology = catchAsync(async (req, res) => {
  const tenders = await tenderService.getTendersByTechnology(req.params.technology);
  res.send(tenders);
});

const getTendersByStatus = catchAsync(async (req, res) => {
  const tenders = await tenderService.getTendersByStatus(req.params.status);
  res.send(tenders);
});

module.exports = {
  createTender,
  getTenders,
  getTender,
  getTenderBySlug,
  updateTender,
  deleteTender,
  getTendersByTechnology,
  getTendersByStatus,
};
