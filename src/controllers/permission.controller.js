const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { Permission, CustomRole, User, Domain } = require('../models');

const createPermission = catchAsync(async (req, res) => {
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can create permissions');
  }

  // Create permission
  const permission = await Permission.create(req.body);

  // Populate the domain details
  const populatedPermission = await permission.populate('domain', 'title description');

  // Construct a clean message
  const domainTitle = (populatedPermission.domain && populatedPermission.domain.title) || 'Unknown domain';

  res.status(httpStatus.CREATED).send({
    success: true,
    message: `Permission for domain '${domainTitle}' created successfully`,
    data: populatedPermission,
  });
});

const getPermissions = catchAsync(async (req, res) => {
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can view permissions');
  }

  const permissions = await Permission.find().populate('domain', 'title description').sort({ createdAt: -1 });

  res.send({
    success: true,
    message: `${permissions.length} permissions fetched successfully`,
    data: permissions,
  });
});

const getPermission = catchAsync(async (req, res) => {
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can view permissions');
  }
  const permission = await Permission.findById(req.params.permissionId).populate('domain', 'title description');
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }
  res.send(permission);
});

const updatePermission = catchAsync(async (req, res) => {
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can update permissions');
  }

  const permission = await Permission.findByIdAndUpdate(req.params.permissionId, req.body, { new: true }).populate(
    'domain',
    'title description'
  );
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }

  const domainTitle = (permission.domain && permission.domain.title) || 'Unknown domain';

  res.send({
    success: true,
    message: `Permission for domain '${domainTitle}' updated successfully`,
    data: permission,
  });
});

const deletePermission = catchAsync(async (req, res) => {
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can delete permissions');
  }

  const permission = await Permission.findById(req.params.permissionId).populate('domain', 'title');
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permission not found');
  }

  const domainTitle = (permission.domain && permission.domain.title) || 'Unknown domain';
  await Permission.findByIdAndDelete(req.params.permissionId);

  res.send({
    success: true,
    message: `Permission for domain '${domainTitle}' deleted successfully`,
  });
});

//  Get all domains (only API for Domain)
const getDomains = catchAsync(async (req, res) => {
  const domains = await Domain.find().sort({ title: 1 });
  res.send({
    success: true,
    message: `${domains.length} domains fetched successfully`,
    data: domains,
  });
});

const createCustomRole = catchAsync(async (req, res) => {
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can create custom roles');
  }
  const roleData = { ...req.body, createdBy: req.user.id };
  const customRole = await CustomRole.create(roleData);
  await customRole.populate('permissions');
  res.status(httpStatus.CREATED).send(customRole);
});

const getCustomRoles = catchAsync(async (req, res) => {
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can view custom roles');
  }
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  options.populate = 'permissions';
  const result = await CustomRole.paginate(filter, options);
  res.send(result);
});

const getCustomRole = catchAsync(async (req, res) => {
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can view custom roles');
  }
  const customRole = await CustomRole.findById(req.params.roleId).populate('permissions');
  if (!customRole) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Custom role not found');
  }
  res.send(customRole);
});

const updateCustomRole = catchAsync(async (req, res) => {
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can update custom roles');
  }
  const customRole = await CustomRole.findByIdAndUpdate(req.params.roleId, req.body, { new: true }).populate('permissions');
  if (!customRole) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Custom role not found');
  }
  res.send(customRole);
});

const deleteCustomRole = catchAsync(async (req, res) => {
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can delete custom roles');
  }
  const customRole = await CustomRole.findByIdAndDelete(req.params.roleId);
  if (!customRole) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Custom role not found');
  }
  res.status(httpStatus.NO_CONTENT).send();
});

const assignRoleToUser = catchAsync(async (req, res) => {
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can assign roles');
  }
  const { userId, customRoleId, permissions } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.userType = 'custom';
  user.customRoleRef = customRoleId;
  user.permissions = permissions || [];
  await user.save();
  res.send(user);
});

module.exports = {
  createPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
  getDomains,
  createCustomRole,
  getCustomRoles,
  getCustomRole,
  updateCustomRole,
  deleteCustomRole,
  assignRoleToUser,
};
