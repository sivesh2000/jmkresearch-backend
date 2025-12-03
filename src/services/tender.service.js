const httpStatus = require('http-status');
const { Tender, Company, State } = require('../models');
const ApiError = require('../utils/ApiError');

const createTender = async (tenderBody) => {
  // Validate company exists
  if (!(await Company.findById(tenderBody.companyId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Company not found');
  }

  // Validate state exists
  if (!(await State.findById(tenderBody.stateId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'State not found');
  }

  // Check if tender number already exists
  if (tenderBody.tenderNumber && (await Tender.findOne({ tenderNumber: tenderBody.tenderNumber }))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Tender number already exists');
  }

  return Tender.create(tenderBody);
};

const queryTenders = async (filter, options) => {
  return Tender.paginate(filter, {
    ...options,
    populate: 'companyId,stateId',
  });
};

const getTenderById = async (id) => {
  return Tender.findById(id).populate('companyId', 'name playerType').populate('stateId', 'name');
};

const getTenderBySlug = async (slug) => {
  return Tender.findOne({ slug, isActive: true }).populate('companyId', 'name playerType').populate('stateId', 'name');
};

const updateTenderById = async (tenderId, updateBody) => {
  const tender = await getTenderById(tenderId);
  if (!tender) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tender not found');
  }

  // Validate company if being updated
  if (updateBody.companyId && updateBody.companyId !== (tender.companyId && tender.companyId.toString())) {
    if (!(await Company.findById(updateBody.companyId))) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Company not found');
    }
  }

  // Validate state if being updated
  if (updateBody.stateId && updateBody.stateId !== (tender.stateId && tender.stateId.toString())) {
    if (!(await State.findById(updateBody.stateId))) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'State not found');
    }
  }

  Object.assign(tender, updateBody);
  await tender.save();
  return tender;
};

const deleteTenderById = async (tenderId) => {
  const tender = await getTenderById(tenderId);
  if (!tender) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tender not found');
  }
  await tender.deleteOne();
  return tender;
};

const getTendersByTechnology = async (technology) => {
  return Tender.find({ technology, isActive: true })
    .populate('companyId', 'name')
    .populate('stateId', 'name')
    .sort({ rfsIssueDate: -1 });
};

const getTendersByStatus = async (status) => {
  return Tender.find({ tenderStatus: status, isActive: true })
    .populate('companyId', 'name')
    .populate('stateId', 'name')
    .sort({ bidSubmissionDeadline: 1 });
};

module.exports = {
  createTender,
  queryTenders,
  getTenderById,
  getTenderBySlug,
  updateTenderById,
  deleteTenderById,
  getTendersByTechnology,
  getTendersByStatus,
};
