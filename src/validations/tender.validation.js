const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTender = {
  body: Joi.object().keys({
    tenderName: Joi.string().required().trim(),
    tenderNumber: Joi.string().trim().allow(''),
    rfsIssueDate: Joi.date(),
    bidSubmissionDeadline: Joi.date(),
    technology: Joi.string().required().trim(),
    tenderingAuthority: Joi.string().trim().allow(''),
    tenderScope: Joi.string().trim().allow(''),
    tenderCapacityMW: Joi.number().min(0),
    allottedCapacityMW: Joi.number().min(0),
    ceilingTariffINR: Joi.number().min(0),
    commissioningTimelineMonths: Joi.number().min(0),
    expectedCommissioningDate: Joi.date(),
    tenderStatus: Joi.string().trim().default('Open'),
    lowestTariffQuoted: Joi.number().min(0),
    storageComponent: Joi.string().trim().allow(''),
    notes: Joi.string().trim().allow(''),
    winnersDetails: Joi.string().trim().allow(''),
    ppaSigningDate: Joi.date(),
    location: Joi.string().trim().allow(''),
    resultAnnouncedDate: Joi.date(),
    companyId: Joi.string().custom(objectId).required(),
    stateId: Joi.string().custom(objectId).required(),
    tenderDocuments: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().trim(),
        url: Joi.string().trim(),
      })
    ),
    isActive: Joi.boolean().default(true),
  }),
};

const getTenders = {
  query: Joi.object().keys({
    tenderName: Joi.string().trim(),
    technology: Joi.string().trim(),
    tenderStatus: Joi.string().trim(),
    companyId: Joi.string().custom(objectId),
    stateId: Joi.string().custom(objectId),
    search: Joi.string().trim(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

const getTender = {
  params: Joi.object().keys({
    tenderId: Joi.string().custom(objectId),
  }),
};

const getTenderBySlug = {
  params: Joi.object().keys({
    slug: Joi.string().required().trim(),
  }),
};

const updateTender = {
  params: Joi.object().keys({
    tenderId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      tenderName: Joi.string().trim(),
      tenderNumber: Joi.string().trim().allow(''),
      rfsIssueDate: Joi.date(),
      bidSubmissionDeadline: Joi.date(),
      technology: Joi.string().trim(),
      tenderingAuthority: Joi.string().trim().allow(''),
      tenderScope: Joi.string().trim().allow(''),
      tenderCapacityMW: Joi.number().min(0),
      allottedCapacityMW: Joi.number().min(0),
      ceilingTariffINR: Joi.number().min(0),
      commissioningTimelineMonths: Joi.number().min(0),
      expectedCommissioningDate: Joi.date(),
      tenderStatus: Joi.string().trim(),
      lowestTariffQuoted: Joi.number().min(0),
      storageComponent: Joi.string().trim().allow(''),
      notes: Joi.string().trim().allow(''),
      winnersDetails: Joi.string().trim().allow(''),
      ppaSigningDate: Joi.date(),
      location: Joi.string().trim().allow(''),
      resultAnnouncedDate: Joi.date(),
      companyId: Joi.string().custom(objectId),
      stateId: Joi.string().custom(objectId),
      isActive: Joi.boolean(),
    })
    .min(1),
};

const deleteTender = {
  params: Joi.object().keys({
    tenderId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createTender,
  getTenders,
  getTender,
  getTenderBySlug,
  updateTender,
  deleteTender,
};
