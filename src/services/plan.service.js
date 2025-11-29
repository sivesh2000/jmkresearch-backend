const httpStatus = require('http-status');
const { Plan } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a plan (master plan by super admin)
 * @param {Object} planBody
 * @returns {Promise<Plan>}
 */
const createPlan = async (planBody) => {
  return Plan.create(planBody);
};

/**
 * Query for plans
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryPlans = async (filter, options) => {
  return Plan.paginate(filter, {
    ...options,
    populate: 'planFeatures',
  });
};

/**
 * Get plan by id
 * @param {ObjectId} id
 * @returns {Promise<Plan>}
 */
const getPlanById = async (id) => {
  return Plan.findById(id).populate('planFeatures');
};

/**
 * Update plan by id
 * @param {ObjectId} planId
 * @param {Object} updateBody
 * @returns {Promise<Plan>}
 */
const updatePlanById = async (planId, updateBody) => {
  const plan = await getPlanById(planId);
  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Plan not found');
  }
  Object.assign(plan, updateBody);
  await plan.save();
  return plan.populate('planFeatures');
};

/**
 * Delete plan by id
 * @param {ObjectId} planId
 * @returns {Promise<Plan>}
 */
const deletePlanById = async (planId) => {
  const plan = await getPlanById(planId);
  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Plan not found');
  }
  await plan.remove();
  return plan;
};

module.exports = {
  createPlan,
  queryPlans,
  getPlanById,
  updatePlanById,
  deletePlanById,
};
