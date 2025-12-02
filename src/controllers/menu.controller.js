const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { menuService } = require('../services');

const createMenu = catchAsync(async (req, res) => {
  const menu = await menuService.createMenu(req.body);
  res.status(httpStatus.CREATED).send(menu);
});

const getMenus = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'parentId', 'isActive']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!options.sortBy) options.sortBy = 'order:asc,title:asc';

  const result = await menuService.queryMenus(filter, options);
  res.send(result);
});

const getMenu = catchAsync(async (req, res) => {
  const menu = await menuService.getMenuById(req.params.menuId);
  if (!menu) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Menu not found');
  }
  res.send(menu);
});

const getMenuBySlug = catchAsync(async (req, res) => {
  const menu = await menuService.getMenuBySlug(req.params.slug);
  if (!menu) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Menu not found');
  }
  res.send(menu);
});

const updateMenu = catchAsync(async (req, res) => {
  const menu = await menuService.updateMenuById(req.params.menuId, req.body);
  res.send(menu);
});

const deleteMenu = catchAsync(async (req, res) => {
  await menuService.deleteMenuById(req.params.menuId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getMenuTree = catchAsync(async (req, res) => {
  const menuTree = await menuService.getMenuTree();
  res.send(menuTree);
});

const reorderMenus = catchAsync(async (req, res) => {
  const result = await menuService.reorderMenus(req.body.menuOrders);
  res.send(result);
});

module.exports = {
  createMenu,
  getMenus,
  getMenu,
  getMenuBySlug,
  updateMenu,
  deleteMenu,
  getMenuTree,
  reorderMenus,
};
