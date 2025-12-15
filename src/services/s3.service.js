const AWS = require('aws-sdk');
const config = require('../config/config');

const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

const uploadFile = async (file, folder = 'uploads') => {
  const key = `${folder}/${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: config.aws.s3Bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  const result = await s3.upload(params).promise();

  return {
    key: result.Key,
    url: result.Location,
    bucket: result.Bucket,
  };
};

const deleteFile = async (key) => {
  const params = {
    Bucket: config.aws.s3Bucket,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};

const getSignedUrl = (key, expires = 3600) => {
  return s3.getSignedUrl('getObject', {
    Bucket: config.aws.s3Bucket,
    Key: key,
    Expires: expires,
  });
};

module.exports = {
  uploadFile,
  deleteFile,
  getSignedUrl,
};
