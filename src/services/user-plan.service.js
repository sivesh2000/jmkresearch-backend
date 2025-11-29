const httpStatus = require('http-status');
const { UserPlan, User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Assign plan to user
 * @param {Object} userPlanBody
 * @returns {Promise<UserPlan>}
 */
const assignPlanToUser = async (userPlanBody, userId) => {
  const userPlanData = {
    ...userPlanBody,
    assignedBy: userId,
  };
  return UserPlan.create(userPlanData);
};

/**
 * Query for user plans
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryUserPlans = async (filter, options) => {
  const result = await UserPlan.paginate(filter, {
    ...options,
    populate: 'userRef planRef',
  });

  // Populate planFeatures separately
  await UserPlan.populate(result.results, {
    path: 'planRef.planFeatures',
    model: 'PlanFeature',
  });

  return result;
};

/**
 * Get user plan by id
 * @param {ObjectId} id
 * @returns {Promise<UserPlan>}
 */
const getUserPlanById = async (id) => {
  return UserPlan.findById(id)
    .populate({
      path: 'planRef',
      populate: {
        path: 'planFeatures',
        model: 'PlanFeature',
      },
    })
    .populate('userRef');
};

/**
 * Update user plan by id
 * @param {ObjectId} userPlanId
 * @param {Object} updateBody
 * @returns {Promise<UserPlan>}
 */
const updateUserPlanById = async (userPlanId, updateBody) => {
  const userPlan = await getUserPlanById(userPlanId);
  if (!userPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User plan not found');
  }

  // Check if dlp, mrp, or status is being updated
  const shouldCascade = updateBody.dlp !== undefined || updateBody.mrp !== undefined || updateBody.isActive !== undefined;

  if (shouldCascade) {
    // Get all user plans assigned by this user
    const assignedPlans = await UserPlan.find({ assignedBy: userPlan.userRef, planRef: userPlan.planRef });

    if (assignedPlans.length > 0) {
      // Prepare cascade update object
      const cascadeUpdate = {};
      if (updateBody.dlp !== undefined) cascadeUpdate.dlp = updateBody.dlp;
      if (updateBody.mrp !== undefined) cascadeUpdate.mrp = updateBody.mrp;
      if (updateBody.isActive !== undefined) cascadeUpdate.isActive = updateBody.isActive;

      // Update all assigned plans
      await UserPlan.updateMany({ assignedBy: userPlan.userRef, planRef: userPlan.planRef }, cascadeUpdate);
    }
  }

  Object.assign(userPlan, updateBody);
  await userPlan.save();
  return userPlan;
};

/**
 * Delete user plan by id
 * @param {ObjectId} userPlanId
 * @returns {Promise<UserPlan>}
 */
const deleteUserPlanById = async (userPlanId) => {
  const userPlan = await getUserPlanById(userPlanId);
  if (!userPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User plan not found');
  }
  await userPlan.remove();
  return userPlan;
};

/**
 * Main dealer assigns plan to user
 * @param {ObjectId} mainDealerId
 * @param {Object} assignmentData
 * @returns {Promise<UserPlan>}
 */
const assignPlanToUserByMainDealer = async (mainDealerId, assignmentData) => {
  const { userRef, planRef, mrp, dlp, canEditMRP } = assignmentData;

  // Verify main dealer exists and has correct role
  const mainDealer = await User.findById(mainDealerId);
  if (!mainDealer || mainDealer.userType !== 'main_dealer') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only main dealers can assign plans');
  }

  // Verify user belongs to this main dealer
  const user = await User.findById(userRef);
  if (!user || (user.mainDealerRef && user.mainDealerRef.toString() !== mainDealerId.toString())) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User does not belong to this main dealer');
  }

  // Check if main dealer has access to this plan
  const mainDealerPlan = await UserPlan.findOne({
    userRef: mainDealerId,
    planRef,
    isActive: true,
  });
  if (!mainDealerPlan) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Main dealer does not have access to this plan');
  }

  const userPlanData = {
    planRef,
    userRef,
    assignedBy: mainDealerId,
    mrp,
    dlp,
    canEditMRP: canEditMRP || false,
    isActive: true,
  };

  return UserPlan.create(userPlanData);
};

/**
 * Get plans available to main dealer for assignment
 * @param {ObjectId} mainDealerId
 * @returns {Promise<Array>}
 */
const getMainDealerAvailablePlans = async (mainDealerId) => {
  return UserPlan.find({
    userRef: mainDealerId,
    isActive: true,
  }).populate({
    path: 'planRef',
    populate: {
      path: 'planFeatures',
      model: 'PlanFeature',
    },
  });
};

/**
 * Get users under main dealer
 * @param {ObjectId} mainDealerId
 * @returns {Promise<Array>}
 */
const getMainDealerUsers = async (mainDealerId) => {
  return User.find({
    mainDealerRef: mainDealerId,
    status: true,
  }).select('-password');
};

/**
 * Update user plan MRP edit permission
 * @param {ObjectId} mainDealerId
 * @param {ObjectId} userPlanId
 * @param {Boolean} canEditMRP
 * @returns {Promise<UserPlan>}
 */
const updateMRPEditPermission = async (mainDealerId, userPlanId, canEditMRP) => {
  const userPlan = await UserPlan.findOne({
    _id: userPlanId,
    assignedBy: mainDealerId,
  });

  if (!userPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User plan not found or not assigned by you');
  }

  userPlan.canEditMRP = canEditMRP;
  await userPlan.save();
  return userPlan;
};

/**
 * Get assigned users by main dealer for specific plan
 * @param {ObjectId} mainDealerId
 * @param {ObjectId} planRef
 * @param {String} userType - User type making the request
 * @returns {Promise<Array>}
 */
const getAssignedUsersByPlan = async (mainDealerId, planRef, userType) => {
  const filter = {
    assignedBy: mainDealerId,
    planRef,
  };

  // If user type is main_dealer, show both active and inactive records
  // If user type is regular user, only show active records
  if (userType !== 'main_dealer') {
    filter.isActive = true;
  }

  return UserPlan.find(filter)
    .populate('userRef')
    .populate({
      path: 'planRef',
      populate: {
        path: 'planFeatures',
        model: 'PlanFeature',
      },
    });
};

/**
 * Update user plan status by super admin or main dealer
 * @param {Object} user - Current user
 * @param {ObjectId} userPlanId
 * @param {Boolean} isActive
 * @returns {Promise<UserPlan>}
 */
const updateUserPlanStatus = async (user, userPlanId, isActive) => {
  const userPlan = await UserPlan.findById(userPlanId).populate('userRef');
  if (!userPlan) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User plan not found');
  }

  // Check permissions
  if (user.userType === 'super_admin' || user.userType === 'custom') {
    // Super admin can update any user plan status
  } else if (user.userType === 'main_dealer') {
    // Main dealer can only update status for users under them
    if (userPlan.userRef.mainDealerRef && userPlan.userRef.mainDealerRef.toString() !== user._id.toString()) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You can only update status for users under you');
    }
  } else {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin and main dealer can update user plan status');
  }

  userPlan.isActive = isActive;
  await userPlan.save();
  return userPlan;
};

module.exports = {
  assignPlanToUser,
  assignPlanToUserByMainDealer,
  getMainDealerAvailablePlans,
  getMainDealerUsers,
  getAssignedUsersByPlan,
  updateMRPEditPermission,
  queryUserPlans,
  getUserPlanById,
  updateUserPlanById,
  deleteUserPlanById,
  updateUserPlanStatus,
};
