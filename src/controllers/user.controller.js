const httpStatus = require('http-status');
const ExcelJS = require('exceljs');
const moment = require('moment');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { User } = require('../models');
const pick = require('../utils/pick');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const rawFilter = pick(req.query, [
    'name',
    'role',
    'userType',
    'mainDealerRef',
    'dealerRef',
    'locationRef',
    'oemRef',
    'search',
  ]);

  // sanitize: remove empty string / null / undefined values
  const filter = {};
  Object.keys(rawFilter).forEach((k) => {
    const v = rawFilter[k];
    if (v === undefined || v === null) return;
    if (typeof v === 'string' && v.trim() === '') return;
    filter[k] = v;
  });

  // handle search separately only when present and non-empty
  if (filter.search) {
    const s = String(filter.search).trim();
    if (s.length) {
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { code: { $regex: s, $options: 'i' } },
        { mobileNumber: { $regex: s, $options: 'i' } },
      ];
    }
    delete filter.search;
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!options.sortBy) options.sortBy = 'name:asc';

  const userContext = req.user; // Current logged-in user
  const result = await userService.queryUsers(filter, options, userContext);
  res.send(result);
});

const getUsersByType = catchAsync(async (req, res) => {
  const { userType } = req.params;
  const filter = pick(req.query, ['mainDealerRef', 'dealerRef', 'locationRef']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!options.sortBy) options.sortBy = 'name:asc';
  const result = await userService.getUsersByType(userType, filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const exportUsers = catchAsync(async (req, res) => {
  const rawFilter = pick(req.query, ['userType', 'mainDealerRef', 'search']);

  // sanitize: remove empty string / null / undefined values
  const filter = {};
  Object.keys(rawFilter).forEach((k) => {
    const v = rawFilter[k];
    if (v === undefined || v === null) return;
    if (typeof v === 'string' && v.trim() === '') return;
    filter[k] = v;
  });

  // handle search separately only when present and non-empty
  if (filter.search) {
    const s = String(filter.search).trim();
    if (s.length) {
      filter.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { code: { $regex: s, $options: 'i' } },
        { mobileNumber: { $regex: s, $options: 'i' } },
      ];
    }
    delete filter.search;
  }

  // now safe to query - empty mainDealerRef won't be present
  const users = await User.find(filter)
    .populate('mainDealerRef', 'name')
    .populate('dealerRef', 'name')
    .populate('stateRef', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Users');
  worksheet.columns = [
    { header: 'Master Dealer Name', key: 'mainDealer', width: 30 },
    { header: 'User Name', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Mobile', key: 'mobile', width: 18 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];

  users.forEach((u) => {
    worksheet.addRow({
      mainDealer: u.mainDealerRef ? u.mainDealerRef.name : '',
      name: u.name || '',
      email: u.email || '',
      mobile: u.mobileNumber || u.mobile || '',
      status: u.status || '',
      createdAt: u.createdAt ? moment(u.createdAt).format('DD/MM/YYYY HH:mm') : '',
    });
  });

  const fileName = `users_${moment().format('YYYY-MM-DD')}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = {
  createUser,
  getUsers,
  getUsersByType,
  getUser,
  updateUser,
  deleteUser,
  exportUsers,
};
