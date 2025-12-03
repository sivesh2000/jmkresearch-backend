const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    logoUrl: { type: String, trim: true },
    description: { type: String, trim: true },
    playerType: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    contactInfo: {
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, default: 'India', trim: true },
      pincode: { type: String, trim: true },
    },
    socialLinks: {
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      facebook: { type: String, trim: true },
    },
    businessDetails: {
      establishedYear: { type: Number },
      employeeCount: { type: String, trim: true },
      revenue: { type: String, trim: true },
      certifications: [String],
    },
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

companySchema.plugin(toJSON);
companySchema.plugin(paginate);

companySchema.index({ name: 1 });
companySchema.index({ slug: 1 });
companySchema.index({ playerType: 1, isActive: 1 });

companySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.isModified('slug')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
