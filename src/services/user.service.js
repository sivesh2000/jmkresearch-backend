const httpStatus = require('http-status');
const { User } = require('../models');
const { Wallet } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Generate next main dealer code
 * @returns {Promise<string>}
 */
const generateMainDealerCode = async () => {
  const lastMainDealer = await User.findOne(
    { userType: 'main_dealer', code: { $regex: /^7\d{4}$/ } },
    {},
    { sort: { code: -1 } }
  );

  if (!lastMainDealer || !lastMainDealer.code) {
    return '70001';
  }

  const lastCode = parseInt(lastMainDealer.code, 10);
  const nextCode = lastCode + 1;
  return nextCode.toString();
};

/**
 * Get dealer IDs by main dealer
 * @param {ObjectId} mainDealerId
 * @returns {Promise<Array>}
 */
const getDealerIdsByMainDealer = async (mainDealerId) => {
  const dealers = await User.find({
    userType: 'dealer',
    mainDealerRef: mainDealerId,
  }).select('_id');
  return dealers.map((dealer) => dealer._id);
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Auto-generate code for main_dealer
  const userData = { ...userBody };
  if (userData.userType === 'main_dealer' && !userData.code) {
    userData.code = await generateMainDealerCode();
  }

  const user = await User.create(userData);

  // Auto-create wallet for main_dealer
  if (user.userType === 'main_dealer') {
    try {
      await Wallet.create({ mainDealerRef: user._id });
    } catch (error) {
      // Wallet creation failed - handled silently
    }
  }

  return user;
};

/**
 * Query for users with hierarchical filtering
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {Object} userContext - Current user context for filtering
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options, userContext = {}) => {
  const finalFilter = { ...filter };

  // Handle name search with case-insensitive regex
  if (filter.name) {
    finalFilter.name = { $regex: filter.name, $options: 'i' };
  }

  // Apply hierarchical filtering based on user type
  if (userContext.userType === 'super_admin' || userContext.userType === 'custom') {
    // Super admin can see all users with optional filters
    if (filter.userType) {
      finalFilter.userType = filter.userType;
    }
    if (filter.mainDealerRef) {
      finalFilter.mainDealerRef = filter.mainDealerRef;
    }
    if (filter.dealerRef) {
      finalFilter.dealerRef = filter.dealerRef;
    }
    if (filter.locationRef) {
      finalFilter.locationRef = filter.locationRef;
    }
    if (filter.oemRef) {
      finalFilter.oemRef = filter.oemRef;
    }
  } else if (userContext.userType === 'main_dealer') {
    // Main dealer can see their dealers and users
    finalFilter.$or = [
      { mainDealerRef: userContext._id },
      { dealerRef: { $in: await getDealerIdsByMainDealer(userContext._id) } },
    ];
  } else if (userContext.userType === 'dealer') {
    // Dealer can see only their users
    finalFilter.dealerRef = userContext._id;
  }

  const users = await User.paginate(finalFilter, {
    ...options,
    populate: 'mainDealerRef,dealerRef,locationRef,stateRef,oemRef',
  });
  return users;
};

/**
 * Get users by user type with filters
 * @param {string} userType
 * @param {Object} filters
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getUsersByType = async (userType, filters = {}, options = {}) => {
  const filter = { userType, ...filters };
  return User.paginate(filter, {
    ...options,
    populate: 'mainDealerRef,dealerRef,locationRef,stateRef',
  });
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id)
    .populate({
      path: 'mainDealerRef',
      select: 'name email code tradeName',
      populate: [
        { path: 'oemRef', select: 'name code' },
        { path: 'stateRef', select: 'name code' },
      ],
    })
    .populate('dealerRef', 'name email')
    .populate('oemRef', 'name code')
    .populate('stateRef', 'name code')
    .populate('locationRef', 'title code');
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUsersByType,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
};
