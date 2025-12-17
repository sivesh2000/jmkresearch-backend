const httpStatus = require('http-status');
const moment = require('moment');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { parseCSV, generateCSV } = require('../utils/csvParser');
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

const getExportColumns = catchAsync(async (req, res) => {
  const columns = [
    { key: 'tenderName', label: 'Tender Name', description: 'Name of the tender' },
    { key: 'tenderNumber', label: 'Tender Number', description: 'Unique tender number/ID' },
    { key: 'slug', label: 'Slug', description: 'URL-friendly identifier' },
    { key: 'rfsIssueDate', label: 'RFS Issue Date', description: 'Request for Selection issue date' },
    { key: 'bidSubmissionDeadline', label: 'Bid Submission Deadline', description: 'Last date for bid submission' },
    { key: 'technology', label: 'Technology', description: 'Technology type (Solar, Wind, etc.)' },
    { key: 'tenderingAuthority', label: 'Tendering Authority', description: 'Organization issuing the tender' },
    { key: 'tenderScope', label: 'Tender Scope', description: 'Scope of the tender (EPC, Project Development, etc.)' },
    { key: 'tenderCapacityMW', label: 'Tender Capacity (MW)', description: 'Total capacity being tendered' },
    { key: 'allottedCapacityMW', label: 'Allotted Capacity (MW)', description: 'Capacity actually allotted' },
    { key: 'ceilingTariffINR', label: 'Ceiling Tariff (INR)', description: 'Maximum tariff allowed' },
    {
      key: 'commissioningTimelineMonths',
      label: 'Commissioning Timeline (Months)',
      description: 'Time allowed for commissioning',
    },
    {
      key: 'expectedCommissioningDate',
      label: 'Expected Commissioning Date',
      description: 'Expected date of commissioning',
    },
    { key: 'tenderStatus', label: 'Tender Status', description: 'Current status of the tender' },
    { key: 'lowestTariffQuoted', label: 'Lowest Tariff Quoted', description: 'Lowest tariff bid received' },
    { key: 'storageComponent', label: 'Storage Component', description: 'Energy storage requirements' },
    { key: 'notes', label: 'Notes', description: 'Additional notes and comments' },
    { key: 'winnersDetails', label: 'Winners Details', description: 'Details of winning bidders' },
    { key: 'ppaSigningDate', label: 'PPA Signing Date', description: 'Power Purchase Agreement signing date' },
    { key: 'location', label: 'Location', description: 'Project location' },
    { key: 'resultAnnouncedDate', label: 'Result Announced Date', description: 'Date when results were announced' },
    { key: 'companyName', label: 'Company Name', description: 'Associated company name' },
    { key: 'stateName', label: 'State Name', description: 'State where project is located' },
    { key: 'isActive', label: 'Is Active', description: 'Whether tender is active' },
    { key: 'createdAt', label: 'Created At', description: 'Date tender was added' },
    { key: 'updatedAt', label: 'Updated At', description: 'Date tender was last updated' },
  ];

  res.send({
    availableColumns: columns,
    usage: {
      example: '/tenders/export?columns=tenderName,technology,tenderCapacityMW,tenderStatus',
      description: 'Use comma-separated column keys to specify which columns to export',
    },
  });
});

const exportTenders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['technology', 'tenderStatus', 'companyId', 'stateId']);

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

  const csvData = await tenderService.exportTendersToCSV(filter);

  // Define all available columns
  const allHeaders = [
    'tenderName',
    'tenderNumber',
    'slug',
    'rfsIssueDate',
    'bidSubmissionDeadline',
    'technology',
    'tenderingAuthority',
    'tenderScope',
    'tenderCapacityMW',
    'allottedCapacityMW',
    'ceilingTariffINR',
    'commissioningTimelineMonths',
    'expectedCommissioningDate',
    'tenderStatus',
    'lowestTariffQuoted',
    'storageComponent',
    'notes',
    'winnersDetails',
    'ppaSigningDate',
    'location',
    'resultAnnouncedDate',
    'companyName',
    'stateName',
    'isActive',
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

  const fileName = `tenders_${moment().format('YYYY-MM-DD')}.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(csvContent);
});

const importTenders = catchAsync(async (req, res) => {
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

    const results = await tenderService.importTendersFromCSV(csvData);
    res.send(results);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, `CSV parsing error: ${error.message}`);
  }
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
  getExportColumns,
  exportTenders,
  importTenders,
};
