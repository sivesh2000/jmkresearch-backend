const multer = require('multer');
const ApiError = require('../utils/ApiError');

const storage = multer.memoryStorage();

const csvFileFilter = (_req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.mimetype === 'application/csv') {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only CSV files are allowed'), false);
  }
};

const csvUpload = multer({
  storage,
  fileFilter: csvFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = csvUpload;
