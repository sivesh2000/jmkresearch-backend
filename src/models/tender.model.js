const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const tenderSchema = new mongoose.Schema(
  {
    tenderName: { type: String, required: true, trim: true },
    tenderNumber: { type: String, unique: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    rfsIssueDate: { type: Date },
    bidSubmissionDeadline: { type: Date },
    technology: { type: String, required: true, trim: true },
    tenderingAuthority: { type: String, trim: true },
    tenderScope: { type: String, trim: true },
    tenderCapacityMW: { type: Number },
    allottedCapacityMW: { type: Number },
    ceilingTariffINR: { type: Number },
    commissioningTimelineMonths: { type: Number },
    expectedCommissioningDate: { type: Date },
    tenderStatus: { type: String, default: 'Open', trim: true },
    lowestTariffQuoted: { type: Number },
    storageComponent: { type: String, trim: true },
    notes: { type: String, trim: true },
    winnersDetails: { type: String, trim: true },
    ppaSigningDate: { type: Date },
    location: { type: String, trim: true },
    resultAnnouncedDate: { type: Date },

    // Relationships
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },

    // Documents
    tenderDocuments: [
      {
        name: String,
        url: String,
        uploadDate: { type: Date, default: Date.now },
      },
    ],

    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

tenderSchema.plugin(toJSON);
tenderSchema.plugin(paginate);

tenderSchema.index({ tenderNumber: 1 });
tenderSchema.index({ slug: 1 });
tenderSchema.index({ technology: 1, tenderStatus: 1 });
tenderSchema.index({ companyId: 1 });
tenderSchema.index({ stateId: 1 });

tenderSchema.pre('save', function (next) {
  if (this.isModified('tenderName') && !this.isModified('slug')) {
    this.slug = this.tenderName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

module.exports = mongoose.model('Tender', tenderSchema);
