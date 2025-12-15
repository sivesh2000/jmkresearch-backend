const httpStatus = require('http-status');
const ExcelJS = require('exceljs');
const moment = require('moment');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { tenderService } = require('../services');
const { Tender } = require('../models');

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

  const tenders = await Tender.find(filter)
    .populate('companyId', 'name')
    .populate('stateId', 'name')
    .sort({ rfsIssueDate: -1 })
    .lean();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Tenders');
  worksheet.columns = [
    { header: 'Tender Name', key: 'tenderName', width: 40 },
    { header: 'Tender Number', key: 'tenderNumber', width: 20 },
    { header: 'Technology', key: 'technology', width: 15 },
    { header: 'Company', key: 'company', width: 30 },
    { header: 'State', key: 'state', width: 15 },
    { header: 'Capacity (MW)', key: 'capacity', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'RfS Issue Date', key: 'rfsDate', width: 15 },
    { header: 'Bid Deadline', key: 'bidDeadline', width: 15 },
    { header: 'Location', key: 'location', width: 20 },
  ];

  tenders.forEach((tender) => {
    worksheet.addRow({
      tenderName: tender.tenderName || '',
      tenderNumber: tender.tenderNumber || '',
      technology: tender.technology || '',
      company: (tender.companyId && tender.companyId.name) || '',
      state: (tender.stateId && tender.stateId.name) || '',
      capacity: tender.tenderCapacityMW || 0,
      status: tender.tenderStatus || '',
      rfsDate: tender.rfsIssueDate ? moment(tender.rfsIssueDate).format('DD/MM/YYYY') : '',
      bidDeadline: tender.bidSubmissionDeadline ? moment(tender.bidSubmissionDeadline).format('DD/MM/YYYY') : '',
      location: tender.location || '',
    });
  });

  const fileName = `tenders_${moment().format('YYYY-MM-DD')}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  await workbook.xlsx.write(res);
  res.end();
});

const importTenders = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Excel file is required');
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const worksheet = workbook.getWorksheet(1);

  const tenders = [];
  const errors = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    try {
      const tenderData = {
        tenderName: row.getCell(1).value,
        tenderNumber: row.getCell(2).value,
        technology: row.getCell(3).value,
        tenderCapacityMW: row.getCell(6).value || 0,
        tenderStatus: row.getCell(7).value || 'Open',
        rfsIssueDate: row.getCell(8).value,
        bidSubmissionDeadline: row.getCell(9).value,
        location: row.getCell(10).value,
      };

      if (tenderData.tenderName && tenderData.technology) {
        tenders.push(tenderData);
      }
    } catch (error) {
      errors.push(`Row ${rowNumber}: ${error.message}`);
    }
  });

  const results = { created: 0, errors: [] };

  const existingTenders = await Tender.find({}, 'tenderNumber tenderName').lean();
  const existingNumbers = new Set(existingTenders.map((t) => t.tenderNumber).filter(Boolean));
  const existingNames = new Set(existingTenders.map((t) => t.tenderName));

  const newTenders = tenders.filter(
    (tender) => !existingNumbers.has(tender.tenderNumber) && !existingNames.has(tender.tenderName)
  );

  if (newTenders.length > 0) {
    await Tender.insertMany(newTenders);
    results.created = newTenders.length;
  }

  results.errors = errors;
  results.skipped = tenders.length - newTenders.length;

  res.send(results);
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
  exportTenders,
  importTenders,
};
