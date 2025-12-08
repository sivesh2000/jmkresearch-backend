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

const queryCategories = async (filter, options) => {
  return Category.paginate(filter, options);
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
};
