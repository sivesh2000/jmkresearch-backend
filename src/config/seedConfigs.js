const { Config } = require('../models');

const defaultConfigs = [
  {
    key: 'company_player_types',
    value: ['Project Developer', 'Module Supplier', 'EPC Contractor', 'O&M Provider', 'Investor', 'Consultant'],
    category: 'company_enums',
    dataType: 'array',
    description: 'Available company player types',
    isEditable: true,
  },
  {
    key: 'company_employee_count',
    value: ['1-10', '11-50', '51-200', '201-500', '500+'],
    category: 'company_enums',
    dataType: 'array',
    description: 'Employee count ranges for companies',
    isEditable: true,
  },
  {
    key: 'company_revenue_ranges',
    value: ['<1Cr', '1-10Cr', '10-50Cr', '50-100Cr', '100Cr+'],
    category: 'company_enums',
    dataType: 'array',
    description: 'Revenue ranges for companies',
    isEditable: true,
  },
  {
    key: 'tender_technologies',
    value: ['Solar', 'Wind', 'Hybrid', 'Green Hydrogen', 'Battery Storage', 'Pumped Hydro'],
    category: 'tender_enums',
    dataType: 'array',
    description: 'Available tender technologies',
    isEditable: true,
  },
  {
    key: 'tender_statuses',
    value: ['Open', 'Closed', 'Awarded', 'Cancelled', 'Under Evaluation'],
    category: 'tender_enums',
    dataType: 'array',
    description: 'Tender status options',
    isEditable: true,
  },
];

const seedConfigs = async () => {
  try {
    const existingKeys = await Config.find({}, 'key').lean();
    const existingKeySet = new Set(existingKeys.map((config) => config.key));

    const newConfigs = defaultConfigs.filter((config) => !existingKeySet.has(config.key));

    if (newConfigs.length > 0) {
      await Config.insertMany(newConfigs);
    }
  } catch (error) {
    // Silent error handling
  }
};

module.exports = { seedConfigs };
