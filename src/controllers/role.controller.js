const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { roleService } = require('../services');

// Create a new role
const createRole = catchAsync(async (req, res) => {
  const role = await roleService.createRole(req.body);
  res.status(httpStatus.CREATED).send({
    success: true,
    message: `${role.title} role created successfully`,
    data: role,
  });
});

// Get all roles

const getRoles = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'status']);
  const roles = await roleService.queryRoles(filter);
  res.status(200).send({
    success: true,
    message: `${roles.length} roles fetched successfully`,
    data: roles,
  });
});

// Get a single role by ID

const getRole = catchAsync(async (req, res) => {
  const role = await roleService.getRoleById(req.params.roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  res.status(httpStatus.OK).send({
    success: true,
    message: `${role.title} role fetched successfully`,
    data: role,
  });
});

// Update a role by ID

const updateRole = catchAsync(async (req, res) => {
  const role = await roleService.updateRoleById(req.params.roleId, req.body);

  res.status(httpStatus.OK).send({
    success: true,
    message: `${role.title} role updated successfully`,
    data: role,
  });
});

// Delete a role by ID

const deleteRole = catchAsync(async (req, res) => {
  const deletedRole = await roleService.deleteRoleById(req.params.roleId);

  res.status(httpStatus.OK).send({
    success: true,
    message: `${deletedRole.title} role deleted successfully`,
  });
});

module.exports = {
  createRole,
  getRoles,
  getRole,
  updateRole,
  deleteRole,
};
