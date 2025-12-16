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

const importTendersFromCSV = async (csvData) => {
  const results = {
    success: 0,
    failed: 0,
    errors: [],
  };

  const processRow = async (row, index) => {
    try {
      // Parse dates
      const parseDate = (dateStr) => {
        if (!dateStr || dateStr.trim() === '') return null;
        const date = new Date(dateStr);
        return Number.isNaN(date.getTime()) ? null : date;
      };

      // Find company by name
      let companyId = null;
      if (row.companyName && row.companyName.trim()) {
        const company = await Company.findOne({ name: { $regex: new RegExp(row.companyName.trim(), 'i') } });
        if (company) {
          companyId = company._id;
        } else {
          return {
            success: false,
            error: `Row ${index + 2}: Company "${row.companyName}" not found`,
          };
        }
      }

      // Find state by name
      let stateId = null;
      if (row.stateName && row.stateName.trim()) {
        const state = await State.findOne({ name: { $regex: new RegExp(row.stateName.trim(), 'i') } });
        if (state) {
          stateId = state._id;
        } else {
          return {
            success: false,
            error: `Row ${index + 2}: State "${row.stateName}" not found`,
          };
        }
      }

      // Build tender object
      const tenderData = {
        tenderName: row.tenderName ? row.tenderName.trim() : '',
        tenderNumber: row.tenderNumber ? row.tenderNumber.trim() : '',
        rfsIssueDate: parseDate(row.rfsIssueDate),
        bidSubmissionDeadline: parseDate(row.bidSubmissionDeadline),
        technology: row.technology ? row.technology.trim() : '',
        tenderingAuthority: row.tenderingAuthority ? row.tenderingAuthority.trim() : '',
        tenderScope: row.tenderScope ? row.tenderScope.trim() : '',
        tenderCapacityMW: row.tenderCapacityMW ? parseFloat(row.tenderCapacityMW) : null,
        allottedCapacityMW: row.allottedCapacityMW ? parseFloat(row.allottedCapacityMW) : null,
        ceilingTariffINR: row.ceilingTariffINR ? parseFloat(row.ceilingTariffINR) : null,
        commissioningTimelineMonths: row.commissioningTimelineMonths ? parseInt(row.commissioningTimelineMonths, 10) : null,
        expectedCommissioningDate: parseDate(row.expectedCommissioningDate),
        tenderStatus: row.tenderStatus ? row.tenderStatus.trim() : 'Open',
        lowestTariffQuoted: row.lowestTariffQuoted ? parseFloat(row.lowestTariffQuoted) : null,
        storageComponent: row.storageComponent ? row.storageComponent.trim() : '',
        notes: row.notes ? row.notes.trim() : '',
        winnersDetails: row.winnersDetails ? row.winnersDetails.trim() : '',
        ppaSigningDate: parseDate(row.ppaSigningDate),
        location: row.location ? row.location.trim() : '',
        resultAnnouncedDate: parseDate(row.resultAnnouncedDate),
        companyId,
        stateId,
        isActive: row.isActive !== 'false',
      };

      // Validate required fields
      if (!tenderData.tenderName || !tenderData.technology || !companyId || !stateId) {
        return {
          success: false,
          error: `Row ${index + 2}: Missing required fields (tenderName, technology, companyName, or stateName)`,
        };
      }

      // Check if tender already exists
      if (tenderData.tenderNumber) {
        const existingTender = await Tender.findOne({ tenderNumber: tenderData.tenderNumber });
        if (existingTender) {
          return {
            success: false,
            error: `Row ${index + 2}: Tender number "${tenderData.tenderNumber}" already exists`,
          };
        }
      }

      await Tender.create(tenderData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Row ${index + 2}: ${error.message}`,
      };
    }
  };

  // Process rows sequentially to avoid database conflicts
  const processSequentially = async () => {
    for (let i = 0; i < csvData.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const result = await processRow(csvData[i], i);
      if (result.success) {
        results.success += 1;
      } else {
        results.failed += 1;
        results.errors.push(result.error);
      }
    }
  };

  await processSequentially();
  return results;
};

const exportTendersToCSV = async (filter = {}) => {
  const tenders = await Tender.find(filter)
    .populate('companyId', 'name')
    .populate('stateId', 'name')
    .sort({ rfsIssueDate: -1 })
    .lean();

  const csvData = tenders.map((tender) => ({
    tenderName: tender.tenderName || '',
    tenderNumber: tender.tenderNumber || '',
    slug: tender.slug || '',
    rfsIssueDate: tender.rfsIssueDate ? tender.rfsIssueDate.toISOString().split('T')[0] : '',
    bidSubmissionDeadline: tender.bidSubmissionDeadline ? tender.bidSubmissionDeadline.toISOString().split('T')[0] : '',
    technology: tender.technology || '',
    tenderingAuthority: tender.tenderingAuthority || '',
    tenderScope: tender.tenderScope || '',
    tenderCapacityMW: tender.tenderCapacityMW || '',
    allottedCapacityMW: tender.allottedCapacityMW || '',
    ceilingTariffINR: tender.ceilingTariffINR || '',
    commissioningTimelineMonths: tender.commissioningTimelineMonths || '',
    expectedCommissioningDate: tender.expectedCommissioningDate
      ? tender.expectedCommissioningDate.toISOString().split('T')[0]
      : '',
    tenderStatus: tender.tenderStatus || '',
    lowestTariffQuoted: tender.lowestTariffQuoted || '',
    storageComponent: tender.storageComponent || '',
    notes: tender.notes || '',
    winnersDetails: tender.winnersDetails || '',
    ppaSigningDate: tender.ppaSigningDate ? tender.ppaSigningDate.toISOString().split('T')[0] : '',
    location: tender.location || '',
    resultAnnouncedDate: tender.resultAnnouncedDate ? tender.resultAnnouncedDate.toISOString().split('T')[0] : '',
    companyName: tender.companyId && tender.companyId.name ? tender.companyId.name : '',
    stateName: tender.stateId && tender.stateId.name ? tender.stateId.name : '',
    isActive: tender.isActive,
    createdAt: tender.createdAt ? tender.createdAt.toISOString().split('T')[0] : '',
    updatedAt: tender.updatedAt ? tender.updatedAt.toISOString().split('T')[0] : '',
  }));

  return csvData;
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
  importTendersFromCSV,
  exportTendersToCSV,
};
