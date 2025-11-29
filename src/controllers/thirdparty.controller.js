const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const thirdpartyService = require('../services/thirdparty.service');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const sendCertificateKeyologicData = catchAsync(async (req, res) => {
  const { certificateId } = req.body;
  const result = await thirdpartyService.sendCertificateKeyologicData(certificateId);
  res.status(httpStatus.OK).send({ message: 'Data sent successfully', result });
});

const getThirdPartyLogs = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['provider', 'certificateRef', 'success', 'statusCode']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  if (!options.sortBy) options.sortBy = 'createdAt:desc';
  const result = await thirdpartyService.queryThirdPartyLogs(filter, options);
  res.send(result);
});

const getThirdPartyLog = catchAsync(async (req, res) => {
  const log = await thirdpartyService.getThirdPartyLogById(req.params.logId);
  if (!log) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Third party log not found');
  }
  res.send(log);
});

const retryFailedApiCall = catchAsync(async (req, res) => {
  const { certificateId } = req.params;
  const result = await thirdpartyService.retryFailedApiCall(certificateId);

  if (result.success) {
    res.status(httpStatus.OK).send({ message: 'API retry successful', data: result.data });
  } else {
    res.status(httpStatus.BAD_REQUEST).send({ message: 'API retry failed', error: result.error });
  }
});
const sendCertificateEuroData = catchAsync(async (req, res) => {
  const { certificateId } = req.body;
  const result = await thirdpartyService.sendCertificateEuroData(certificateId);
  res.status(httpStatus.OK).send({ message: 'Data sent successfully', result });
});

module.exports = {
  sendCertificateKeyologicData,
  getThirdPartyLogs,
  getThirdPartyLog,
  retryFailedApiCall,
  sendCertificateEuroData,
};
