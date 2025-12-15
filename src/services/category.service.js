const httpStatus = require('http-status');
const { Category } = require('../models');
const ApiError = require('../utils/ApiError');

const createCategory = async (categoryBody) => {
  if (await Category.findOne({ slug: categoryBody.slug })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already exists');
  }

  if (categoryBody.parentId && !(await Category.findById(categoryBody.parentId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Parent category not found');
  }

  return Category.create(categoryBody);
};

const queryCategories = async (filter = {}, options = {}) => {
  // Work on a copy to avoid mutating the caller's object
  const query = { ...filter };

  // If caller provided a `search` param, convert to partial-match filter
  if (typeof query.search === 'string' && query.search.trim() !== '') {
    const term = query.search.trim();
    delete query.search;
    query.$or = [
      { name: { $regex: term, $options: 'i' } },
      { slug: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
    ];
    // keep only active categories for searches by default
    if (query.isActive === undefined) query.isActive = true;
  }

  // Ensure numeric pagination options and safe spread
  const opts = { ...options };
  const page = Number.parseInt(opts.page, 10);
  const limit = Number.parseInt(opts.limit, 10);
  const paginateOptions = {
    ...opts,
    populate: 'parentId',
    ...(Number.isInteger(page) && { page }),
    ...(Number.isInteger(limit) && { limit }),
  };

  const result = await Category.paginate(query, paginateOptions);

  // Add displayName and normalize parentId to only include name & slug
  result.results = result.results.map((cat) => {
    const obj = typeof cat.toObject === 'function' ? cat.toObject() : cat;
    const parent = obj.parentId ? { name: obj.parentId.name, slug: obj.parentId.slug } : null;
    return {
      ...obj,
      parentId: parent,
      displayName: parent ? `${parent.name} > ${obj.name}` : obj.name,
    };
  });

  return result;
};

const searchCategories = async (searchTerm, options = {}) => {
  const term = (searchTerm || '').trim();
  const limit = Number.parseInt(options.limit, 10);
  const finalLimit = Number.isInteger(limit) ? limit : 50;

  const searchFilter = {
    $or: [
      { name: { $regex: term, $options: 'i' } },
      { slug: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
    ],
    isActive: true,
  };

  const categories = await Category.find(searchFilter)
    .populate('parentId', 'name slug')
    .sort({ order: 1, name: 1 })
    .limit(finalLimit);

  // Add parent name to display
  const results = categories.map((cat) => ({
    ...cat.toObject(),
    displayName: cat.parentId ? `${cat.parentId.name} > ${cat.name}` : cat.name,
  }));

  return results;
};

const getCategoryById = async (id) => {
  return Category.findById(id).populate('parentId', 'name slug');
};

const getCategoryBySlug = async (slug) => {
  return Category.findOne({ slug, isActive: true }).populate('parentId', 'name slug');
};

const updateCategoryById = async (categoryId, updateBody) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  if (updateBody.slug && updateBody.slug !== category.slug) {
    if (await Category.findOne({ slug: updateBody.slug, _id: { $ne: categoryId } })) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already exists');
    }
  }

  if (updateBody.parentId && updateBody.parentId !== (category.parentId && category.parentId.toString())) {
    if (!(await Category.findById(updateBody.parentId))) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Parent category not found');
    }
    if (updateBody.parentId === categoryId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category cannot be parent of itself');
    }
  }

  Object.assign(category, updateBody);
  await category.save();
  return category;
};

const deleteCategoryById = async (categoryId) => {
  const category = await getCategoryById(categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const childCategories = await Category.find({ parentId: categoryId });
  if (childCategories.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete category with child categories');
  }

  await category.deleteOne();
  return category;
};

const getCategoryTree = async () => {
  return Category.getCategoryTree();
};

const reorderCategories = async (categoryOrders) => {
  const bulkOps = categoryOrders.map(({ id, order }) => ({
    updateOne: {
      filter: { _id: id },
      update: { order },
    },
  }));

  await Category.bulkWrite(bulkOps);
  return { message: 'Category order updated successfully' };
};

module.exports = {
  createCategory,
  queryCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategoryById,
  deleteCategoryById,
  getCategoryTree,
  reorderCategories,
  searchCategories,
};
