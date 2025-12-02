const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const pageContentSchema = new mongoose.Schema(
  {
    menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    content: { type: String }, // HTML or Markdown content
    excerpt: { type: String, trim: true }, // Short description
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: { type: Date },
    seoMeta: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [{ type: String, trim: true }],
      ogImage: { type: String, trim: true },
      canonicalUrl: { type: String, trim: true },
    },
    featuredImage: { type: String, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String, trim: true }],
    viewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugins
pageContentSchema.plugin(toJSON);
pageContentSchema.plugin(paginate);

// Indexes
pageContentSchema.index({ menuId: 1, status: 1 });
pageContentSchema.index({ slug: 1 });
pageContentSchema.index({ status: 1, publishedAt: -1 });

// Pre-save middleware
pageContentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  // Auto-generate slug from title if not provided
  if (this.isModified('title') && !this.isModified('slug')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Static method to get published content
pageContentSchema.statics.getPublishedContent = function (filter = {}) {
  return this.find({
    ...filter,
    status: 'published',
    isActive: true,
    publishedAt: { $lte: new Date() },
  })
    .populate('menuId', 'title slug')
    .populate('author', 'name email');
};

module.exports = mongoose.model('PageContent', pageContentSchema);
