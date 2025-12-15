const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const assetSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    s3Key: { type: String, required: true },
    s3Url: { type: String, required: true },

    category: {
      type: String,
      enum: ['document', 'image', 'logo', 'banner', 'icon', 'other'],
      default: 'other',
    },

    tags: [{ type: String }],
    alt: { type: String },
    description: { type: String },

    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'PageContent' },

    isPublic: { type: Boolean, default: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

assetSchema.index({ category: 1, status: 1 });
assetSchema.index({ companyId: 1 });
assetSchema.index({ pageId: 1 });
assetSchema.index({ tags: 1 });

assetSchema.plugin(toJSON);
assetSchema.plugin(paginate);

module.exports = mongoose.model('Asset', assetSchema);
