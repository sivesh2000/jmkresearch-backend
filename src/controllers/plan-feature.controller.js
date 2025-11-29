const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const PlanFeature = require('../models/plan-feature.model');

const createPlanFeature = catchAsync(async (req, res) => {
  // Only super admin can create plan features
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can create plan features');
  }

  const planFeature = await PlanFeature.create(req.body);
  res.status(httpStatus.CREATED).send(planFeature);
});

const getPlanFeatures = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!options.sortBy) options.sortBy = 'title:asc';
  const result = await PlanFeature.paginate(filter, options);
  res.send(result);
});

const getPlanFeature = catchAsync(async (req, res) => {
  const planFeature = await PlanFeature.findById(req.params.planFeatureId);
  if (!planFeature) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Plan feature not found');
  }
  res.send(planFeature);
});

const updatePlanFeature = catchAsync(async (req, res) => {
  // Only super admin can update plan features
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can update plan features');
  }

  const planFeature = await PlanFeature.findByIdAndUpdate(req.params.planFeatureId, req.body, { new: true });
  if (!planFeature) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Plan feature not found');
  }
  res.send(planFeature);
});

const deletePlanFeature = catchAsync(async (req, res) => {
  // Only super admin can delete plan features
  if (req.user.userType !== 'super_admin' && req.user.userType !== 'custom') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only super admin can delete plan features');
  }

  const planFeature = await PlanFeature.findByIdAndDelete(req.params.planFeatureId);
  if (!planFeature) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Plan feature not found');
  }
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createPlanFeature,
  getPlanFeatures,
  getPlanFeature,
  updatePlanFeature,
  deletePlanFeature,
};
