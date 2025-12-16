const httpStatus = require('http-status');
const ExcelJS = require('exceljs');
const moment = require('moment');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { tenderService } = require('../services');
const { Tender, Company } = require('../models');
const { State } = require('../models/geographic.model');

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

  const rows = [];
  const errors = [];

  const parseDate = (val) => {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
      const mIso = moment(val, moment.ISO_8601, true);
      if (mIso.isValid()) return mIso.toDate();
      const mDmy = moment(val, 'DD/MM/YYYY', true);
      if (mDmy.isValid()) return mDmy.toDate();
      return undefined;
    }
    if (typeof val === 'number') {
      // Excel serial date number -> JS Date
      return new Date(Math.round((val - 25569) * 86400 * 1000));
    }
    if (typeof val === 'object' && val.text) {
      const m = moment(val.text, ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'], true);
      if (m.isValid()) return m.toDate();
    }
    return undefined;
  };

  // iterate rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const tenderName = row.getCell(1).value && String(row.getCell(1).value).trim();
    const tenderNumber = row.getCell(2).value && String(row.getCell(2).value).trim();
    const technology = row.getCell(3).value && String(row.getCell(3).value).trim();
    const companyName = row.getCell(4).value && String(row.getCell(4).value).trim();
    const stateName = row.getCell(5).value && String(row.getCell(5).value).trim();
    const tenderCapacityMW = row.getCell(6).value || 0;
    const tenderStatus = row.getCell(7).value || 'Open';
    const rfsIssueDate = parseDate(row.getCell(8).value);
    const bidSubmissionDeadline = parseDate(row.getCell(9).value);
    const location = row.getCell(10).value && String(row.getCell(10).value).trim();

    if (!tenderName || !technology) {
      errors.push(`Row ${rowNumber}: missing required field(s) (tenderName, technology)`);
      return;
    }

    rows.push({
      rowNumber,
      tenderName,
      tenderNumber,
      technology,
      companyName,
      stateName,
      tenderCapacityMW,
      tenderStatus,
      rfsIssueDate,
      bidSubmissionDeadline,
      location,
    });
  });

  // Fetch existing tenders for dedupe
  const existingTenders = await Tender.find({}, 'tenderNumber tenderName').lean();
  const existingNumbers = new Set(existingTenders.map((t) => t.tenderNumber).filter(Boolean));
  const existingNames = new Set(existingTenders.map((t) => t.tenderName));

  // Prefetch companies and states referenced in the file to avoid await in loop
  const companyNames = Array.from(new Set(rows.map((r) => r.companyName).filter(Boolean)));
  const stateNames = Array.from(new Set(rows.map((r) => r.stateName).filter(Boolean)));

  const companies = companyNames.length ? await Company.find({ name: { $in: companyNames } }).lean() : [];
  const states = stateNames.length ? await State.find({ name: { $in: stateNames } }).lean() : [];

  const companyMap = new Map(companies.map((c) => [c.name, c._id]));
  const stateMap = new Map(states.map((s) => [s.name, s._id]));

  const toInsert = [];

  rows.forEach((r) => {
    if (r.tenderNumber && existingNumbers.has(r.tenderNumber)) {
      errors.push(`Row ${r.rowNumber}: duplicate tenderNumber ${r.tenderNumber}`);
      return;
    }
    if (existingNames.has(r.tenderName)) {
      errors.push(`Row ${r.rowNumber}: duplicate tenderName ${r.tenderName}`);
      return;
    }

    if (!r.companyName) {
      errors.push(`Row ${r.rowNumber}: missing Company`);
      return;
    }
    const companyId = companyMap.get(r.companyName);
    if (!companyId) {
      errors.push(`Row ${r.rowNumber}: company not found (${r.companyName})`);
      return;
    }

    if (!r.stateName) {
      errors.push(`Row ${r.rowNumber}: missing State`);
      return;
    }
    const stateId = stateMap.get(r.stateName);
    if (!stateId) {
      errors.push(`Row ${r.rowNumber}: state not found (${r.stateName})`);
      return;
    }

    toInsert.push({
      tenderName: r.tenderName,
      tenderNumber: r.tenderNumber,
      technology: r.technology,
      companyId,
      stateId,
      tenderCapacityMW: r.tenderCapacityMW,
      tenderStatus: r.tenderStatus,
      rfsIssueDate: r.rfsIssueDate,
      bidSubmissionDeadline: r.bidSubmissionDeadline,
      location: r.location,
    });
  });

  let created = 0;
  if (toInsert.length > 0) {
    await Tender.insertMany(toInsert);
    created = toInsert.length;
  }

  res.send({ created, errors, skipped: rows.length - toInsert.length });
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
