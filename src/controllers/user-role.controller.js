const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { UserRole, RolePermission } = require('../models');

const assignRolesToUser = catchAsync(async (req, res) => {
  const { userId, roleIds } = req.body;

  const mappings = roleIds.map((roleId) => ({ userId, roleId }));

  const result = await UserRole.insertMany(mappings, { ordered: false });
  res.status(httpStatus.CREATED).send({ message: 'Roles assigned to user', count: result.length });
});

const removeRolesFromUser = catchAsync(async (req, res) => {
  const { userId, roleIds } = req.body;

  const result = await UserRole.deleteMany({
    userId,
    roleId: { $in: roleIds },
  });

  res.send({ message: 'Roles removed from user', deletedCount: result.deletedCount });
});

const toggleUserRoles = catchAsync(async (req, res) => {
  const { userId, roleIds } = req.body;

  // Delete all existing roles for the user
  const deleteResult = await UserRole.deleteMany({ userId });

  // Add new roles
  let addedCount = 0;
  if (roleIds.length > 0) {
    const mappings = roleIds.map((roleId) => ({ userId, roleId }));
    const result = await UserRole.insertMany(mappings, { ordered: false });
    addedCount = result.length;
  }

  res.send({
    message: 'User roles updated successfully',
    removed: deleteResult.deletedCount,
    added: addedCount,
  });
});

const getUserRolesAndPermissions = catchAsync(async (req, res) => {
  const { userId } = req.params;

  // Get user roles
  const userRoles = await UserRole.find({ userId }).populate('roleId', 'title description');

  // Get all permissions for these roles
  const roleIds = userRoles.map((ur) => ur.roleId._id);
  const rolePermissions = await RolePermission.find({ roleId: { $in: roleIds } }).populate({
    path: 'permissionId',
    populate: {
      path: 'domain',
      select: 'title',
    },
  });

  // Get unique permissions
  const permissions = rolePermissions.map((rp) => rp.permissionId);
  const uniquePermissions = permissions.filter(
    (permission, index, self) => index === self.findIndex((p) => p._id.toString() === permission._id.toString())
  );

  res.send({
    roles: userRoles,
    permissions: uniquePermissions,
  });
});

module.exports = {
  assignRolesToUser,
  removeRolesFromUser,
  toggleUserRoles,
  getUserRolesAndPermissions,
};
