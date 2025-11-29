const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const { UserRole, RolePermission } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  try {
    const user = await userService.getUserByEmail(email);
    if (!user || !(await user.isPasswordMatch(password))) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }

    // Return user with populated dealer information
    return userService.getUserById(user._id);
  } catch (error) {
    // Handle database connection errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Database connection error. Please try again.');
    }
    throw error;
  }
};

const getUserWithRolesAndPermissions = async (userId) => {
  const userRoles = await UserRole.find({ userId }).populate('roleId', 'title');
  const roleIds = userRoles.map((ur) => ur.roleId._id);
  const rolePermissions = await RolePermission.find({ roleId: { $in: roleIds } }).populate('permissionId');

  return {
    roles: userRoles.map((ur) => ur.roleId),
    permissions: [...new Set(rolePermissions.map((rp) => rp.permissionId))],
  };
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Change password
 * @param {ObjectId} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise}
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await userService.getUserByEmail(await userService.getUserById(userId).then((u) => u.email));
  if (!user || !(await user.isPasswordMatch(oldPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect old password');
  }
  await userService.updateUserById(userId, { password: newPassword });
};

/**
 * Update user profile
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateProfile = async (userId, updateBody) => {
  // Remove sensitive fields that shouldn't be updated via profile
  const { password, role, userType, isEmailVerified, ...profileData } = updateBody;
  return userService.updateUserById(userId, profileData);
};

module.exports = {
  loginUserWithEmailAndPassword,
  getUserWithRolesAndPermissions,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  changePassword,
  updateProfile,
};
