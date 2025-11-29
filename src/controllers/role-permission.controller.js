const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { RolePermission, Permission } = require('../models');

const addPermissionsToRole = catchAsync(async (req, res) => {
  const { roleId, permissionIds } = req.body;

  const mappings = permissionIds.map((permissionId) => ({
    roleId,
    permissionId,
  }));

  // Use insertMany with ordered: false to continue on duplicates
  const result = await RolePermission.insertMany(mappings, { ordered: false });
  res.status(httpStatus.CREATED).send({ message: 'Permissions added to role', count: result.length });
});

const removePermissionsFromRole = catchAsync(async (req, res) => {
  const { roleId, permissionIds } = req.body;

  const result = await RolePermission.deleteMany({
    roleId,
    permissionId: { $in: permissionIds },
  });

  res.send({ message: 'Permissions removed from role', deletedCount: result.deletedCount });
});

const getRolePermissions = catchAsync(async (req, res) => {
  const { roleId } = req.params;

  const rolePermissions = await RolePermission.find({ roleId }).populate({
    path: 'permissionId',
    select: 'domain actions description',
    populate: {
      path: 'domain',
      select: 'title',
    },
  });

  res.send(rolePermissions);
});

const getAvailablePermissions = catchAsync(async (req, res) => {
  const { roleId } = req.params;

  // Get permissions already assigned to this role
  const assignedPermissions = await RolePermission.find({ roleId }).select('permissionId');
  const assignedIds = assignedPermissions.map((rp) => rp.permissionId);

  // Get permissions not assigned to this role
  const availablePermissions = await Permission.find({
    _id: { $nin: assignedIds },
    isActive: true,
  }).populate('domain', 'title');

  res.send(availablePermissions);
});

module.exports = {
  addPermissionsToRole,
  removePermissionsFromRole,
  getRolePermissions,
  getAvailablePermissions,
};
