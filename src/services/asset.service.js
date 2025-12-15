const httpStatus = require('http-status');
const { Asset } = require('../models');
const ApiError = require('../utils/ApiError');
const s3Service = require('./s3.service');

const uploadAsset = async (file, assetData, userId) => {
  const folder = assetData.category || 'uploads';
  const s3Result = await s3Service.uploadFile(file, folder);

  const asset = await Asset.create({
    ...assetData,
    originalName: file.originalname,
    fileName: file.filename || file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    s3Key: s3Result.key,
    s3Url: s3Result.url,
    createdBy: userId,
    updatedBy: userId,
  });

  return asset;
};

const queryAssets = async (filter, options) => {
  return Asset.paginate(filter, options);
};

const getAssetById = async (id) => {
  const asset = await Asset.findById(id);
  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Asset not found');
  }
  return asset;
};

const updateAssetById = async (assetId, updateBody, userId) => {
  const asset = await getAssetById(assetId);
  Object.assign(asset, { ...updateBody, updatedBy: userId });
  await asset.save();
  return asset;
};

const deleteAssetById = async (assetId) => {
  const asset = await getAssetById(assetId);
  await s3Service.deleteFile(asset.s3Key);
  await asset.remove();
  return asset;
};

const getAssetsByCategory = async (category, options = {}) => {
  return Asset.paginate({ category, status: 'Active' }, options);
};

const getCompanyAssets = async (companyId, options = {}) => {
  return Asset.paginate({ companyId, status: 'Active' }, options);
};

module.exports = {
  uploadAsset,
  queryAssets,
  getAssetById,
  updateAssetById,
  deleteAssetById,
  getAssetsByCategory,
  getCompanyAssets,
};
