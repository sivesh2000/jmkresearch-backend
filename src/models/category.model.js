const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true },
    icon: { type: String, trim: true },
    color: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

categorySchema.plugin(toJSON);
categorySchema.plugin(paginate);

categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1, isActive: 1 });

categorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.isModified('slug')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

categorySchema.statics.getCategoryTree = async function () {
  const categories = await this.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();

  const categoryMap = {};
  const rootCategories = [];

  categories.forEach((category) => {
    categoryMap[category._id] = { ...category, children: [] };
  });

  categories.forEach((category) => {
    if (category.parentId && categoryMap[category.parentId]) {
      categoryMap[category.parentId].children.push(categoryMap[category._id]);
    } else {
      rootCategories.push(categoryMap[category._id]);
    }
  });

  return rootCategories;
};

module.exports = mongoose.model('Category', categorySchema);
