const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const menuSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    url: { type: String, trim: true }, // External URL if needed
    icon: { type: String, trim: true }, // Icon class or URL
    description: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugins
menuSchema.plugin(toJSON);
menuSchema.plugin(paginate);

// Pre-save middleware to update slug and updatedAt
menuSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (this.isModified('title') && !this.isModified('slug')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Static method to get menu tree
menuSchema.statics.getMenuTree = async function () {
  const menus = await this.find({ isActive: true }).sort({ order: 1, title: 1 }).lean();

  const menuMap = {};
  const rootMenus = [];

  menus.forEach((menu) => {
    menuMap[menu._id] = { ...menu, children: [] };
  });

  menus.forEach((menu) => {
    if (menu.parentId && menuMap[menu.parentId]) {
      menuMap[menu.parentId].children.push(menuMap[menu._id]);
    } else {
      rootMenus.push(menuMap[menu._id]);
    }
  });

  return rootMenus;
};

module.exports = mongoose.model('Menu', menuSchema);
