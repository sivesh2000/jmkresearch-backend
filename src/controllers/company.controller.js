const httpStatus = require('http-status');
const ExcelJS = require('exceljs');
const moment = require('moment');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { companyService } = require('../services');
const { Company } = require('../models');

const createCompany = catchAsync(async (req, res) => {
  const company = await companyService.createCompany(req.body);
  res.status(httpStatus.CREATED).send(company);
});

const getCompanies = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'playerType', 'isActive', 'isVerified']);

  if (req.query.search) {
    const searchTerm = req.query.search.trim();
    if (searchTerm) {
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      ];
    }
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!options.sortBy) options.sortBy = 'name:asc';

  const result = await companyService.queryCompanies(filter, options);
  res.send(result);
});

const getCompany = catchAsync(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.companyId);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
  }
  res.send(company);
});

const getCompanyBySlug = catchAsync(async (req, res) => {
  const company = await companyService.getCompanyBySlug(req.params.slug);
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
  }
  res.send(company);
});

const updateCompany = catchAsync(async (req, res) => {
  const company = await companyService.updateCompanyById(req.params.companyId, req.body);
  res.send(company);
});

const deleteCompany = catchAsync(async (req, res) => {
  await companyService.deleteCompanyById(req.params.companyId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getCompaniesByPlayerType = catchAsync(async (req, res) => {
  const companies = await companyService.getCompaniesByPlayerType(req.params.playerType);
  res.send(companies);
});

const exportCompanies = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['playerType', 'isActive', 'isVerified']);

  if (req.query.search) {
    const searchTerm = req.query.search.trim();
    if (searchTerm) {
      filter.$or = [{ name: { $regex: searchTerm, $options: 'i' } }, { description: { $regex: searchTerm, $options: 'i' } }];
    }
  }

  const companies = await Company.find(filter).sort({ createdAt: -1 }).lean();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Companies');
  worksheet.columns = [
    { header: 'Company Name', key: 'name', width: 30 },
    { header: 'Player Type', key: 'playerType', width: 20 },
    { header: 'Website', key: 'website', width: 30 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'City', key: 'city', width: 15 },
    { header: 'State', key: 'state', width: 15 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];

  companies.forEach((company) => {
    worksheet.addRow({
      name: company.name || '',
      playerType: company.playerType || '',
      website: company.website || '',
      email: (company.contactInfo && company.contactInfo.email) || '',
      phone: (company.contactInfo && company.contactInfo.phone) || '',
      city: (company.contactInfo && company.contactInfo.city) || '',
      state: (company.contactInfo && company.contactInfo.state) || '',
      status: company.isActive ? 'Active' : 'Inactive',
      createdAt: company.createdAt ? moment(company.createdAt).format('DD/MM/YYYY HH:mm') : '',
    });
  });

  const fileName = `companies_${moment().format('YYYY-MM-DD')}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  await workbook.xlsx.write(res);
  res.end();
});

const importCompanies = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Excel file is required');
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const worksheet = workbook.getWorksheet(1);

  const companies = [];
  const errors = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    try {
      const companyData = {
        name: row.getCell(1).value,
        playerType: row.getCell(2).value,
        website: row.getCell(3).value,
        contactInfo: {
          email: row.getCell(4).value,
          phone: row.getCell(5).value,
          city: row.getCell(6).value,
          state: row.getCell(7).value,
        },
        isActive: row.getCell(8).value === 'Active',
      };

      if (companyData.name && companyData.playerType) {
        companies.push(companyData);
      }
    } catch (error) {
      errors.push(`Row ${rowNumber}: ${error.message}`);
    }
  });

  const results = { created: 0, errors: [] };

  const existingCompanies = await Company.find({}, 'name').lean();
  const existingNames = new Set(existingCompanies.map((c) => c.name));

  const newCompanies = companies.filter((company) => !existingNames.has(company.name));

  if (newCompanies.length > 0) {
    await Company.insertMany(newCompanies);
    results.created = newCompanies.length;
  }

  results.errors = errors;
  results.skipped = companies.length - newCompanies.length;

  res.send(results);
});

module.exports = {
  createCompany,
  getCompanies,
  getCompany,
  getCompanyBySlug,
  updateCompany,
  deleteCompany,
  getCompaniesByPlayerType,
  exportCompanies,
  importCompanies,
};
