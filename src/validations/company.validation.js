const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCompany = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    slug: Joi.string().required().trim(),
    logoUrl: Joi.string().trim().allow(''),
    description: Joi.string().trim().allow(''),
    playerType: Joi.alternatives().try(Joi.string().trim(), Joi.array().items(Joi.string().trim()).min(1)).required(),
    website: Joi.string().trim().allow(''),
    contactInfo: Joi.object().keys({
      email: Joi.string().email().allow(''),
      phone: Joi.string().trim().allow(''),
      address: Joi.string().trim().allow(''),
      city: Joi.string().trim().allow(''),
      state: Joi.string().trim().allow(''),
      country: Joi.string().trim().allow(''),
      pincode: Joi.string().trim().allow(''),
    }),
    socialLinks: Joi.object().keys({
      linkedin: Joi.string().trim().allow(''),
      twitter: Joi.string().trim().allow(''),
      facebook: Joi.string().trim().allow(''),
    }),
    businessDetails: Joi.object().keys({
      establishedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()),
      employeeCount: Joi.string().trim().allow(''),
      revenue: Joi.string().trim().allow(''),
      certifications: Joi.array().items(Joi.string().trim()),
    }),
    tags: Joi.array().items(Joi.string().trim()),
    isActive: Joi.boolean().default(true),
    isVerified: Joi.boolean().default(false),
  }),
};

const getCompanies = {
  query: Joi.object().keys({
    name: Joi.string().trim(),
    playerType: Joi.string().trim(),
    isActive: Joi.boolean(),
    isVerified: Joi.boolean(),
    search: Joi.string().trim(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  }),
};

const getCompany = {
  params: Joi.object().keys({
    companyId: Joi.string().custom(objectId),
  }),
};

const getCompanyBySlug = {
  params: Joi.object().keys({
    slug: Joi.string().required().trim(),
  }),
};

const updateCompany = {
  params: Joi.object().keys({
    companyId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      slug: Joi.string().trim(),
      logoUrl: Joi.string().trim().allow(''),
      description: Joi.string().trim().allow(''),
      playerType: Joi.alternatives().try(Joi.string().trim(), Joi.array().items(Joi.string().trim()).min(1)),
      website: Joi.string().trim().allow(''),
      contactInfo: Joi.object().keys({
        email: Joi.string().email().allow(''),
        phone: Joi.string().trim().allow(''),
        address: Joi.string().trim().allow(''),
        city: Joi.string().trim().allow(''),
        state: Joi.string().trim().allow(''),
        country: Joi.string().trim().allow(''),
        pincode: Joi.string().trim().allow(''),
      }),
      businessDetails: Joi.object().keys({
        establishedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()),
        employeeCount: Joi.string().trim().allow(''),
        revenue: Joi.string().trim().allow(''),
        certifications: Joi.array().items(Joi.string().trim()),
      }),
      tags: Joi.array().items(Joi.string().trim()),
      isActive: Joi.boolean(),
      isVerified: Joi.boolean(),
    })
    .min(1),
};

const deleteCompany = {
  params: Joi.object().keys({
    companyId: Joi.string().custom(objectId),
  }),
};

const exportCompanies = {
  query: Joi.object().keys({
    playerType: Joi.alternatives().try(Joi.string().trim(), Joi.array().items(Joi.string().trim())),
    isActive: Joi.boolean(),
    isVerified: Joi.boolean(),
    search: Joi.string().trim(),
    columns: Joi.string().trim().description('Comma-separated list of columns to export'),
  }),
};

const importCompanies = {
  // File validation will be handled in controller
};

module.exports = {
  createCompany,
  getCompanies,
  getCompany,
  getCompanyBySlug,
  updateCompany,
  deleteCompany,
  exportCompanies,
  importCompanies,
};
