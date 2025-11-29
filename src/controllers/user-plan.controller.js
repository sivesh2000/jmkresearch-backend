const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userPlanService } = require('../services');

const assignPlanToUser = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const userPlan = await userPlanService.assignPlanToUser(req.body, userId);
  res.status(httpStatus.CREATED).send(userPlan);
});

const getUserPlans = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['planRef', 'userRef', 'isActive', 'assignedBy']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userPlanService.queryUserPlans(filter, options);
  res.send(result);
});

const getUserPlan = catchAsync(async (req, res) => {
  const userPlan = await userPlanService.getUserPlanById(req.params.userPlanId);
  if (!userPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User plan not found');
  }
  res.send(userPlan);
});

const updateUserPlan = catchAsync(async (req, res) => {
  const userPlan = await userPlanService.updateUserPlanById(req.params.userPlanId, req.body);
  res.send(userPlan);
});

const deleteUserPlan = catchAsync(async (req, res) => {
  await userPlanService.deleteUserPlanById(req.params.userPlanId);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Main dealer assigns plan to user
 */
const assignPlanByMainDealer = catchAsync(async (req, res) => {
  const mainDealerId = req.user.id;
  const userPlan = await userPlanService.assignPlanToUserByMainDealer(mainDealerId, req.body);
  res.status(httpStatus.CREATED).send(userPlan);
});

/**
 * Get available plans for main dealer
 */
const getAvailablePlans = catchAsync(async (req, res) => {
  const mainDealerId = req.user.id;
  const plans = await userPlanService.getMainDealerAvailablePlans(mainDealerId);
  res.send(plans);
});

/**
 * Get users under main dealer
 */
const getMyUsers = catchAsync(async (req, res) => {
  const mainDealerId = req.user.id;
  const users = await userPlanService.getMainDealerUsers(mainDealerId);
  res.send(users);
});

/**
 * Update MRP edit permission
 */
const updateMRPPermission = catchAsync(async (req, res) => {
  const mainDealerId = req.user.id;
  const { userPlanId } = req.params;
  const { canEditMRP } = req.body;

  const userPlan = await userPlanService.updateMRPEditPermission(mainDealerId, userPlanId, canEditMRP);
  res.send(userPlan);
});

/**
 * Get assigned users by plan
 */
const getAssignedUsersByPlan = catchAsync(async (req, res) => {
  const mainDealerId = req.user.id;
  const userType = req.user && req.user.userType;
  const { planRef } = req.params;
  const users = await userPlanService.getAssignedUsersByPlan(mainDealerId, planRef, userType);
  res.send(users);
});

const updateUserPlanStatus = catchAsync(async (req, res) => {
  const { isActive } = req.body;
  const userPlan = await userPlanService.updateUserPlanStatus(req.user, req.params.userPlanId, isActive);
  res.send(userPlan);
});

module.exports = {
  assignPlanToUser,
  assignPlanByMainDealer,
  getAvailablePlans,
  getMyUsers,
  getAssignedUsersByPlan,
  updateMRPPermission,
  getUserPlans,
  getUserPlan,
  updateUserPlan,
  deleteUserPlan,
  updateUserPlanStatus,
};
