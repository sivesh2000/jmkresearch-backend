const httpStatus = require('http-status');
const { Role } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a role
 * @param {Object} roleBody
 * @returns {Promise<Role>}
 */
const createRole = async (roleBody) => {
  const existing = await Role.findOne({ title: roleBody.title });
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Role title already exists');
  }
  return Role.create(roleBody);
};

const queryRoles = async (filter) => {
  const roles = await Role.find(filter).sort({ createdAt: -1 });
  return roles;
};

/**
 * Get role by id
 * @param {ObjectId} id
 * @returns {Promise<Role>}
 */
const getRoleById = async (id) => {
  return Role.findById(id);
};

/**
 * Update role by id
 * @param {ObjectId} roleId
 * @param {Object} updateBody
 * @returns {Promise<Role>}
 */
const updateRoleById = async (roleId, updateBody) => {
  const role = await getRoleById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  // Prevent duplicate title
  if (updateBody.title) {
    const existing = await Role.findOne({ title: updateBody.title, _id: { $ne: roleId } });
    if (existing) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Role title already exists');
    }
  }

  Object.assign(role, updateBody);
  await role.save();
  return role;
};

/**
 * Delete role by id
 * @param {ObjectId} roleId
 * @returns {Promise<Role>}
 */
const deleteRoleById = async (roleId) => {
  const role = await getRoleById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  await role.remove();
  return role;
};

module.exports = {
  createRole,
  queryRoles,
  getRoleById,
  updateRoleById,
  deleteRoleById,
};
