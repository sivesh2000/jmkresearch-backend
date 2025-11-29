const mongoose = require('mongoose');

const masterDataSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    code: { type: String, required: true },
    version: String,
    lastUpdated: Date,
    manufacturingYears: [Number],
    customerTypes: [
      {
        id: String,
        name: String,
        description: String,
      },
    ],
    salutations: [
      {
        id: String,
        name: String,
        gender: String,
      },
    ],
    nomineeRelations: [
      {
        id: String,
        name: String,
        category: String,
      },
    ],
    documentTypes: [
      {
        id: String,
        name: String,
        category: String,
        required: Boolean,
      },
    ],
    insuranceTypes: [
      {
        id: String,
        name: String,
        description: String,
      },
    ],
    repRelations: [
      {
        id: String,
        name: String,
        code: String,
      },
    ],
    ownershipTypes: [
      {
        id: String,
        name: String,
        category: String,
      },
    ],
    purchaseTypes: [
      {
        id: String,
        name: String,
        description: String,
      },
    ],
    onlineChannels: [
      {
        id: String,
        name: String,
        platform: String,
      },
    ],
    financierPlans: [
      {
        id: String,
        name: String,
        code: String,
        description: String,
      },
    ],
    masterPolicyNumber: {
      type: String,
      trim: true,
    },
    insuranceCompanyName: {
      type: String,
      trim: true,
    },
    issueCategory: [
      {
        id: String,
        name: String,
        description: String,
        subCategory: [
          {
            id: String,
            issueCategoryId: String,
            name: String,
            description: String,
            priority: String,
          },
        ],
      },
    ],
  },
  {
    collection: 'master_data',
    timestamps: true,
  }
);

const MasterData = mongoose.model('MasterData', masterDataSchema);

module.exports = MasterData;
