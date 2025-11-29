const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { HelpDeskMapping } = require('../models');

const createHelpDeskMapping = catchAsync(async (req, res) => {
  const helpDeskMapping = await HelpDeskMapping.create(req.body);
  res.status(httpStatus.CREATED).send(helpDeskMapping);
});

const getHelpDeskMappings = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['roleRef', 'categoryId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await HelpDeskMapping.paginate(filter, { ...options, populate: 'roleRef' });
  res.send(result);
});

const getHelpDeskMapping = catchAsync(async (req, res) => {
  const helpDeskMapping = await HelpDeskMapping.findById(req.params.helpDeskMappingId).populate('roleRef');
  if (!helpDeskMapping) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Help desk mapping not found');
  }
  res.send(helpDeskMapping);
});

const updateHelpDeskMapping = catchAsync(async (req, res) => {
  const helpDeskMapping = await HelpDeskMapping.findByIdAndUpdate(req.params.helpDeskMappingId, req.body, { new: true });
  if (!helpDeskMapping) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Help desk mapping not found');
  }
  res.send(helpDeskMapping);
});

const deleteHelpDeskMapping = catchAsync(async (req, res) => {
  await HelpDeskMapping.findByIdAndDelete(req.params.helpDeskMappingId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createHelpDeskMapping,
  getHelpDeskMappings,
  getHelpDeskMapping,
  updateHelpDeskMapping,
  deleteHelpDeskMapping,
};
