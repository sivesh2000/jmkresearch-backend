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
  return Company.find({ playerType: { $in: Array.isArray(playerType) ? playerType : [playerType] }, isActive: true }).sort({
    name: 1,
  });
};

const importCompaniesFromCSV = async (csvData) => {
  const results = {
    success: 0,
    failed: 0,
    errors: [],
  };

  const processRow = async (row, index) => {
    try {
      // Parse playerType - handle both single and multiple values
      let playerTypes = [];
      if (row.playerType) {
        playerTypes = row.playerType
          .split(',')
          .map((type) => type.trim())
          .filter((type) => type);
      }

      // Parse certifications and tags
      const certifications = row.certifications
        ? row.certifications
            .split(',')
            .map((cert) => cert.trim())
            .filter((cert) => cert)
        : [];
      const tags = row.tags
        ? row.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [];

      // Build company object
      const companyData = {
        name: row.name ? row.name.trim() : '',
        playerType: playerTypes,
        description: row.description ? row.description.trim() : '',
        website: row.website ? row.website.trim() : '',
        logoUrl: row.logoUrl ? row.logoUrl.trim() : '',
        contactInfo: {
          email: row.contactEmail ? row.contactEmail.trim() : '',
          phone: row.contactPhone ? row.contactPhone.trim() : '',
          address: row.contactAddress ? row.contactAddress.trim() : '',
          city: row.contactCity ? row.contactCity.trim() : '',
          state: row.contactState ? row.contactState.trim() : '',
          country: row.contactCountry ? row.contactCountry.trim() : 'India',
          pincode: row.contactPincode ? row.contactPincode.trim() : '',
        },
        socialLinks: {
          linkedin: row.linkedinUrl ? row.linkedinUrl.trim() : '',
          twitter: row.twitterUrl ? row.twitterUrl.trim() : '',
          facebook: row.facebookUrl ? row.facebookUrl.trim() : '',
        },
        businessDetails: {
          establishedYear: row.establishedYear ? parseInt(row.establishedYear, 10) : null,
          employeeCount: row.employeeCount ? row.employeeCount.trim() : '',
          revenue: row.revenue ? row.revenue.trim() : '',
          certifications,
        },
        tags,
        isActive: row.isActive === 'true' || row.isActive === true,
        isVerified: row.isVerified === 'true' || row.isVerified === true,
      };

      // Validate required fields
      if (!companyData.name || playerTypes.length === 0) {
        return {
          success: false,
          error: `Row ${index + 2}: Missing required fields (name or playerType)`,
        };
      }

      // Check if company already exists
      const existingCompany = await Company.findOne({ name: companyData.name });
      if (existingCompany) {
        return {
          success: false,
          error: `Row ${index + 2}: Company "${companyData.name}" already exists`,
        };
      }

      await Company.create(companyData);
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

const exportCompaniesToCSV = async (filter = {}) => {
  const companies = await Company.find(filter).sort({ name: 1 }).lean();

  const csvData = companies.map((company) => ({
    name: company.name || '',
    playerType: Array.isArray(company.playerType) ? company.playerType.join(', ') : company.playerType || '',
    description: company.description || '',
    website: company.website || '',
    logoUrl: company.logoUrl || '',
    contactEmail: company.contactInfo && company.contactInfo.email ? company.contactInfo.email : '',
    contactPhone: company.contactInfo && company.contactInfo.phone ? company.contactInfo.phone : '',
    contactAddress: company.contactInfo && company.contactInfo.address ? company.contactInfo.address : '',
    contactCity: company.contactInfo && company.contactInfo.city ? company.contactInfo.city : '',
    contactState: company.contactInfo && company.contactInfo.state ? company.contactInfo.state : '',
    contactCountry: company.contactInfo && company.contactInfo.country ? company.contactInfo.country : '',
    contactPincode: company.contactInfo && company.contactInfo.pincode ? company.contactInfo.pincode : '',
    linkedinUrl: company.socialLinks && company.socialLinks.linkedin ? company.socialLinks.linkedin : '',
    twitterUrl: company.socialLinks && company.socialLinks.twitter ? company.socialLinks.twitter : '',
    facebookUrl: company.socialLinks && company.socialLinks.facebook ? company.socialLinks.facebook : '',
    establishedYear:
      company.businessDetails && company.businessDetails.establishedYear ? company.businessDetails.establishedYear : '',
    employeeCount:
      company.businessDetails && company.businessDetails.employeeCount ? company.businessDetails.employeeCount : '',
    revenue: company.businessDetails && company.businessDetails.revenue ? company.businessDetails.revenue : '',
    certifications:
      company.businessDetails && company.businessDetails.certifications
        ? company.businessDetails.certifications.join(', ')
        : '',
    tags: company.tags ? company.tags.join(', ') : '',
    isActive: company.isActive,
    isVerified: company.isVerified,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  }));

  return csvData;
};

module.exports = {
  createCompany,
  queryCompanies,
  getCompanyById,
  getCompanyBySlug,
  updateCompanyById,
  deleteCompanyById,
  getCompaniesByPlayerType,
  importCompaniesFromCSV,
  exportCompaniesToCSV,
};
