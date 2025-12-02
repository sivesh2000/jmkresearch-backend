const httpStatus = require('http-status');
const { Menu } = require('../models');
const ApiError = require('../utils/ApiError');

const createMenu = async (menuBody) => {
  // Check if slug already exists
  if (await Menu.findOne({ slug: menuBody.slug })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already exists');
  }

  // Validate parent menu exists if parentId provided
  if (menuBody.parentId && !(await Menu.findById(menuBody.parentId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Parent menu not found');
  }

  return Menu.create(menuBody);
};

const queryMenus = async (filter, options) => {
  const menus = await Menu.paginate(filter, options);
  return menus;
};

const getMenuById = async (id) => {
  return Menu.findById(id).populate('parentId', 'title slug');
};

const getMenuBySlug = async (slug) => {
  return Menu.findOne({ slug, isActive: true }).populate('parentId', 'title slug');
};

const updateMenuById = async (menuId, updateBody) => {
  const menu = await getMenuById(menuId);
  if (!menu) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Menu not found');
  }

  // Check slug uniqueness if being updated
  if (updateBody.slug && updateBody.slug !== menu.slug) {
    if (await Menu.findOne({ slug: updateBody.slug, _id: { $ne: menuId } })) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Slug already exists');
    }
  }

  // Validate parent menu if being updated
  if (updateBody.parentId && updateBody.parentId !== (menu.parentId && menu.parentId.toString())) {
    if (!(await Menu.findById(updateBody.parentId))) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Parent menu not found');
    }
    // Prevent circular reference
    if (updateBody.parentId === menuId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Menu cannot be parent of itself');
    }
  }

  Object.assign(menu, updateBody);
  await menu.save();
  return menu;
};

const deleteMenuById = async (menuId) => {
  const menu = await getMenuById(menuId);
  if (!menu) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Menu not found');
  }

  // Check if menu has children
  const childMenus = await Menu.find({ parentId: menuId });
  if (childMenus.length > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete menu with child menus');
  }

  await menu.deleteOne();
  return menu;
};

const getMenuTree = async () => {
  return Menu.getMenuTree();
};

const reorderMenus = async (menuOrders) => {
  const bulkOps = menuOrders.map(({ id, order }) => ({
    updateOne: {
      filter: { _id: id },
      update: { order },
    },
  }));

  await Menu.bulkWrite(bulkOps);
  return { message: 'Menu order updated successfully' };
};

module.exports = {
  createMenu,
  queryMenus,
  getMenuById,
  getMenuBySlug,
  updateMenuById,
  deleteMenuById,
  getMenuTree,
  reorderMenus,
};
