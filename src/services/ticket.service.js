const { Ticket, User, UserRole, HelpDeskMapping } = require('../models');

const getTicketsByUserRole = async (user, filter = {}, options = {}) => {
  const query = {};

  if (filter.status) query.status = filter.status;
  if (filter.priority) query.priority = filter.priority;
  if (filter.issueType) query.issueType = filter.issueType;

  if (user.userType === 'super_admin') {
    // Super admin: all tickets
  } else if (user.userType === 'custom') {
    // Custom user: tickets based on role and category mapping
    const userRoles = await UserRole.find({ userId: user._id }).select('roleId');
    const roleIds = userRoles.map((ur) => ur.roleId);

    if (roleIds.length > 0) {
      const mappings = await HelpDeskMapping.find({ roleRef: { $in: roleIds } }).select('categoryId');
      const categoryIds = mappings.map((m) => m.categoryId);

      if (categoryIds.length > 0) {
        query.categoryId = { $in: categoryIds };
      } else {
        query._id = null;
      }
    } else {
      query._id = null;
    }
  } else if (user.userType === 'main_dealer') {
    const dealers = await User.find({ mainDealerRef: user._id, userType: 'dealer' }).select('_id');
    const dealerIds = dealers.map((d) => d._id);
    const dealerUsers = await User.find({ dealerRef: { $in: dealerIds } }).select('_id');
    const userIds = dealerUsers.map((u) => u._id);
    query.$or = [{ createdBy: user._id }, { createdBy: { $in: dealerIds } }, { createdBy: { $in: userIds } }];
  } else if (user.userType === 'dealer') {
    const dealerUsers = await User.find({ dealerRef: user._id }).select('_id');
    const userIds = dealerUsers.map((u) => u._id);
    query.$or = [{ createdBy: user._id }, { createdBy: { $in: userIds } }];
  } else {
    query.createdBy = user._id;
  }

  const page = parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const limit = parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const skip = (page - 1) * limit;

  const sort = options.sortBy
    ? { [options.sortBy.split(':')[0]]: options.sortBy.split(':')[1] === 'desc' ? -1 : 1 }
    : { createdAt: -1 };

  const totalResults = await Ticket.countDocuments(query);

  const tickets = await Ticket.find(query)
    .populate({
      path: 'createdBy',
      select: 'name email userType mainDealerRef contactPersonMobile',
      populate: { path: 'mainDealerRef', select: 'name email userType' },
    })
    .populate('assignedTo', 'name email userType')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return { results: tickets, page, limit, totalResults };
};

module.exports = { getTicketsByUserRole };
