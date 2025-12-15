const httpStatus = require('http-status');
const multer = require('multer');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { assetService } = require('../services');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new ApiError(httpStatus.BAD_REQUEST, 'Invalid file type'));
  },
});

const uploadAsset = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  const asset = await assetService.uploadAsset(req.file, req.body, req.user.id);
  res.status(httpStatus.CREATED).send(asset);
});

const getAssets = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['category', 'companyId', 'pageId', 'tags', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await assetService.queryAssets(filter, options);
  res.send(result);
});

const getAsset = catchAsync(async (req, res) => {
  const asset = await assetService.getAssetById(req.params.assetId);
  res.send(asset);
});

const updateAsset = catchAsync(async (req, res) => {
  const asset = await assetService.updateAssetById(req.params.assetId, req.body, req.user.id);
  res.send(asset);
});

const deleteAsset = catchAsync(async (req, res) => {
  await assetService.deleteAssetById(req.params.assetId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getAssetsByCategory = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await assetService.getAssetsByCategory(req.params.category, options);
  res.send(result);
});

const getCompanyAssets = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await assetService.getCompanyAssets(req.params.companyId, options);
  res.send(result);
});

module.exports = {
  uploadAsset: [upload.single('file'), uploadAsset],
  getAssets,
  getAsset,
  updateAsset,
  deleteAsset,
  getAssetsByCategory,
  getCompanyAssets,
};
