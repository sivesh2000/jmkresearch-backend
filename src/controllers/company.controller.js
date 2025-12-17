const httpStatus = require('http-status');
const moment = require('moment');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { parseCSV, generateCSV } = require('../utils/csvParser');
const { companyService } = require('../services');

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

const getExportColumns = catchAsync(async (req, res) => {
  const columns = [
    { key: 'name', label: 'Company Name', description: 'Name of the company' },
    { key: 'playerType', label: 'Player Type', description: 'Type of business (e.g., Project Developer, Module Supplier)' },
    { key: 'description', label: 'Description', description: 'Company description' },
    { key: 'website', label: 'Website', description: 'Company website URL' },
    { key: 'logoUrl', label: 'Logo URL', description: 'Company logo image URL' },
    { key: 'contactEmail', label: 'Contact Email', description: 'Primary contact email' },
    { key: 'contactPhone', label: 'Contact Phone', description: 'Primary contact phone number' },
    { key: 'contactAddress', label: 'Contact Address', description: 'Street address' },
    { key: 'contactCity', label: 'Contact City', description: 'City' },
    { key: 'contactState', label: 'Contact State', description: 'State or province' },
    { key: 'contactCountry', label: 'Contact Country', description: 'Country' },
    { key: 'contactPincode', label: 'Contact Pincode', description: 'Postal or ZIP code' },
    { key: 'linkedinUrl', label: 'LinkedIn URL', description: 'LinkedIn company page' },
    { key: 'twitterUrl', label: 'Twitter URL', description: 'Twitter profile' },
    { key: 'facebookUrl', label: 'Facebook URL', description: 'Facebook page' },
    { key: 'establishedYear', label: 'Established Year', description: 'Year company was founded' },
    { key: 'employeeCount', label: 'Employee Count', description: 'Number of employees' },
    { key: 'revenue', label: 'Revenue', description: 'Company revenue range' },
    { key: 'certifications', label: 'Certifications', description: 'Company certifications' },
    { key: 'tags', label: 'Tags', description: 'Category tags' },
    { key: 'isActive', label: 'Is Active', description: 'Whether company is active' },
    { key: 'isVerified', label: 'Is Verified', description: 'Whether company is verified' },
    { key: 'createdAt', label: 'Created At', description: 'Date company was added' },
    { key: 'updatedAt', label: 'Updated At', description: 'Date company was last updated' },
  ];

  res.send({
    availableColumns: columns,
    usage: {
      example: '/companies/export?columns=name,playerType,contactEmail,contactPhone',
      description: 'Use comma-separated column keys to specify which columns to export',
    },
  });
});

const exportCompanies = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['playerType', 'isActive', 'isVerified']);

  if (req.query.search) {
    const searchTerm = req.query.search.trim();
    if (searchTerm) {
      filter.$or = [{ name: { $regex: searchTerm, $options: 'i' } }, { description: { $regex: searchTerm, $options: 'i' } }];
    }
  }

  const csvData = await companyService.exportCompaniesToCSV(filter);

  // Define all available columns
  const allHeaders = [
    'name',
    'playerType',
    'description',
    'website',
    'logoUrl',
    'contactEmail',
    'contactPhone',
    'contactAddress',
    'contactCity',
    'contactState',
    'contactCountry',
    'contactPincode',
    'linkedinUrl',
    'twitterUrl',
    'facebookUrl',
    'establishedYear',
    'employeeCount',
    'revenue',
    'certifications',
    'tags',
    'isActive',
    'isVerified',
    'createdAt',
    'updatedAt',
  ];

  // Parse requested columns from query parameter
  let headers = allHeaders;
  if (req.query.columns) {
    const requestedColumns = req.query.columns
      .split(',')
      .map((col) => col.trim())
      .filter((col) => col);
    // Filter to only include valid column names
    headers = requestedColumns.filter((col) => allHeaders.includes(col));

    // If no valid columns specified, use all headers
    if (headers.length === 0) {
      headers = allHeaders;
    }
  }

  const csvContent = generateCSV(csvData, headers);

  const fileName = `companies_${moment().format('YYYY-MM-DD')}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(csvContent);
});

const importCompanies = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'CSV file is required');
  }

  // Check if file is CSV
  if (!req.file.originalname.toLowerCase().endsWith('.csv')) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Only CSV files are allowed');
  }

  try {
    const csvContent = req.file.buffer.toString('utf8');
    const csvData = parseCSV(csvContent);

    const results = await companyService.importCompaniesFromCSV(csvData);
    res.send(results);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, `CSV parsing error: ${error.message}`);
  }
});

module.exports = {
  createCompany,
  getCompanies,
  getCompany,
  getCompanyBySlug,
  updateCompany,
  deleteCompany,
  getCompaniesByPlayerType,
  getExportColumns,
  exportCompanies,
  importCompanies,
};
