const httpStatus = require('http-status');
const { Company } = require('../models');
const ApiError = require('../utils/ApiError');

const createCompany = async (companyBody) => {
  if (await Company.findOne({ name: companyBody.name })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Company name already exists');
  }
  return Company.create(companyBody);
};

const queryCompanies = async (filter, options) => {
  return Company.paginate(filter, options);
};

const getCompanyById = async (id) => {
  return Company.findById(id);
};

const getCompanyBySlug = async (slug) => {
  return Company.findOne({ slug, isActive: true });
};

const updateCompanyById = async (companyId, updateBody) => {
  const company = await getCompanyById(companyId);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
  }
  if (updateBody.name && updateBody.name !== company.name) {
    if (await Company.findOne({ name: updateBody.name, _id: { $ne: companyId } })) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Company name already exists');
    }
  }
  Object.assign(company, updateBody);
  await company.save();
  return company;
};

const deleteCompanyById = async (companyId) => {
  const company = await getCompanyById(companyId);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
  }
  await company.deleteOne();
  return company;
};

const getCompaniesByPlayerType = async (playerType) => {
  return Company.find({ playerType, isActive: true }).sort({ name: 1 });
};

module.exports = {
  createCompany,
  queryCompanies,
  getCompanyById,
  getCompanyBySlug,
  updateCompanyById,
  deleteCompanyById,
  getCompaniesByPlayerType,
};
