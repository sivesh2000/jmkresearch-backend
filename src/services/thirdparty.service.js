// src/services/thirdparty.service.js
const axios = require('axios');
const httpStatus = require('http-status');
const { Certificate, ThirdPartyLog } = require('../models');
const ApiError = require('../utils/ApiError');

const sendCertificateKeyologicData = async (certificateId) => {
  const certificate = await Certificate.findById(certificateId).populate([
    {
      path: 'userRef',
      populate: {
        path: 'locationRef',
        select: 'authToken apiKey isApiCall',
      },
    },
    'planRef',
    'executiveRef',
    'stateRef',
    'cityRef',
    'districtRef',
    'vehicleBrandRef',
    'vehicleModelRef',
    'insurerRef',
    'financerRef',
  ]);

  if (!certificate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Certificate not found');
  }

  // Check if API call is enabled for this location
  if (!certificate.userRef || !certificate.userRef.locationRef || !certificate.userRef.locationRef.isApiCall) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'API call disabled for this location');
  }

  const { authToken, apiKey } = certificate.userRef.locationRef;
  if (!authToken || !apiKey) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Auth token or API key not configured for location');
  }

  const payload = {
    executiveName: certificate.executiveRef ? certificate.executiveRef.name : '',
    ownershipType: certificate.ownershipType || 'INDIVIDUAL',
    salutation: certificate.salutation || '',
    firstName: certificate.firstName,
    lastName: certificate.lastName || '',
    dob: certificate.dateOfBirth ? certificate.dateOfBirth.toLocaleDateString('en-GB').replace(/\//g, '-') : '',
    mobile: certificate.mobileNumber,
    houseNo: certificate.houseNo || '',
    street: certificate.apartment || '',
    city: certificate.cityRef ? certificate.cityRef.name : '',
    district: certificate.districtRef ? certificate.districtRef.name : '',
    state: certificate.stateRef ? certificate.stateRef.name : '',
    pincode: certificate.pincode || '',
    repRelationType: certificate.repRelation || '',
    representedBy: certificate.repName || '',
    nomineeName: certificate.nomineeFullName || '',
    nomineeRelation: certificate.nomineeRelation || '',
    nomineeAge: certificate.nomineeAge || 0,
    insurerName: certificate.insurerRef ? certificate.insurerRef.name : '',
    purchaseType: certificate.purchaseType || '',
    financierName: certificate.financerRef ? certificate.financerRef.name : '',
    chasisNo: certificate.chassisNumber,
    engineNo: certificate.engineNo || '',
    batteryInfo: certificate.batteryNo || '',
    vehicleModel: certificate.vehicleBrandRef ? certificate.vehicleBrandRef.name : '',
    vehicleVariant: certificate.vehicleModelRef ? certificate.vehicleModelRef.name : '',
    vehicleColor: certificate.vehicleColor || '',
    finBranch: certificate.financerBranch || '',
    altMobileNo: certificate.alternateMobileNo || '',
    schemeName: certificate.planRef ? certificate.planRef.name : '',
    discount: certificate.exShowroomDiscount || 0,
    poNumber: certificate.poNumber || '',
    poDate: certificate.poDate ? certificate.poDate.toLocaleDateString('en-GB').replace(/\//g, '-') : '',
    poComments: certificate.poComments || '',
    orderNo: certificate.orderNumber || '',
  };

  const requestUrl = 'https://app.keyologic.com/api/f56customerDataDump/f121UploadData';
  const headers = {
    'x-auth-token': authToken,
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  };

  let logData = {
    provider: 'Keyologic',
    certificateRef: certificateId,
    requestUrl,
    method: 'POST',
    headers,
    payload,
  };

  try {
    const response = await axios.post(requestUrl, payload, { headers });

    logData = {
      ...logData,
      response: response.data,
      statusCode: response.status,
      success: true,
    };

    await ThirdPartyLog.create(logData);
    return response.data;
  } catch (error) {
    logData = {
      ...logData,
      response: error.response ? error.response.data : {},
      statusCode: error.response ? error.response.status : 0,
      success: false,
      errorMessage: error.message,
    };

    await ThirdPartyLog.create(logData);
    throw new ApiError(httpStatus.BAD_REQUEST, `Third-party API error: ${error.message}`);
  }
};

const queryThirdPartyLogs = async (filter, options) => {
  const logs = await ThirdPartyLog.paginate(filter, {
    ...options,
    populate: 'certificateRef',
  });

  // Convert objects to JSON strings and limit certificate data
  logs.results = logs.results.map((log) => {
    const logObj = log.toObject();
    return {
      ...logObj,
      certificateRef: logObj.certificateRef ? { certificateNumber: logObj.certificateRef.certificateNumber } : null,
      headers: JSON.stringify(logObj.headers),
      payload: JSON.stringify(logObj.payload),
      response: JSON.stringify(logObj.response),
    };
  });

  return logs;
};

const getThirdPartyLogById = async (id) => {
  const log = await ThirdPartyLog.findById(id).populate('certificateRef');

  if (log) {
    const logObj = log.toObject();
    return {
      ...logObj,
      certificateRef: logObj.certificateRef ? { certificateNumber: logObj.certificateRef.certificateNumber } : null,
      headers: JSON.stringify(logObj.headers),
      payload: JSON.stringify(logObj.payload),
      response: JSON.stringify(logObj.response),
    };
  }

  return log;
};

const retryFailedApiCall = async (certificateId) => {
  // Find the latest failed log for this certificate
  const failedLog = await ThirdPartyLog.findOne({
    certificateRef: certificateId,
    success: false,
    statusCode: { $ne: 200 },
  }).sort({ createdAt: -1 });

  if (!failedLog) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No failed API call found for this certificate');
  }

  const { requestUrl, method, headers, payload } = failedLog;

  let logData = {
    provider: failedLog.provider,
    certificateRef: certificateId,
    requestUrl,
    method,
    headers,
    payload,
  };

  try {
    let response;
    if (method === 'POST') {
      response = await axios.post(requestUrl, payload, { headers });
    } else if (method === 'GET') {
      response = await axios.get(requestUrl, { headers });
    } else if (method === 'PUT') {
      response = await axios.put(requestUrl, payload, { headers });
    }

    logData = {
      ...logData,
      response: response.data,
      statusCode: response.status,
      success: true,
    };

    await ThirdPartyLog.create(logData);

    // Update certificate thirdPartyStatus to success
    await Certificate.findByIdAndUpdate(certificateId, { thirdPartyStatus: 'success' });

    return { success: true, data: response.data };
  } catch (error) {
    logData = {
      ...logData,
      response: error.response ? error.response.data : {},
      statusCode: error.response ? error.response.status : 0,
      success: false,
      errorMessage: error.message,
    };

    await ThirdPartyLog.create(logData);

    // Update certificate thirdPartyStatus to failed
    await Certificate.findByIdAndUpdate(certificateId, { thirdPartyStatus: 'failed' });

    return { success: false, error: error.message };
  }
};

const sendCertificateEuropAssistanceData = async (certificateId) => {
  const certificate = await Certificate.findById(certificateId).populate([
    'userRef',
    'planRef',
    'stateRef',
    'cityRef',
    'districtRef',
    'vehicleBrandRef',
    'vehicleModelRef',
  ]);

  if (!certificate) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Certificate not found');
  }

  const baseUrl = 'https://ts-stage-api.europassistance.in';

  // Helper function to calculate end date
  const calculateEndDate = (startDate) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(start.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    return end.toISOString().split('T')[0];
  };

  // Helper function to determine nominee gender based on relation
  const getNomineeGender = (relation) => {
    if (!relation) return 'M';
    const femaleRelations = [
      'spouse',
      'wife',
      'mother',
      'daughter',
      'sister',
      'grand daughter',
      'grand mother',
      'mother-in-law',
      'daughter-in-law',
      'sister-in-law',
      'aunt',
      'niece',
    ];
    return femaleRelations.includes(relation.toLowerCase()) ? 'F' : 'M';
  };

  // Add this helper function after the getNomineeGender function
  const getCustomerGender = (gender) => {
    if (gender === 'male') return 'M';
    if (gender === 'female') return 'F';
    return 'O';
  };

  // Step 1: Generate Token
  const tokenPayload = {
    email: 'Nyom.test@yopmail.com',
    user_access_key: 'NYOM_123',
  };

  let tokenLogData = {
    provider: 'Europ Assistance',
    certificateRef: certificateId,
    requestUrl: `${baseUrl}/api/nyom/generateToken`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    payload: tokenPayload,
  };

  let authToken;
  try {
    const tokenResponse = await axios.post(`${baseUrl}/api/nyom/generateToken`, tokenPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    tokenLogData = {
      ...tokenLogData,
      response: tokenResponse.data,
      statusCode: tokenResponse.status,
      success: true,
    };
    await ThirdPartyLog.create(tokenLogData);

    const responseData = tokenResponse.data;
    authToken =
      responseData.AuthorisationToken ||
      (responseData.data && responseData.data.AuthorisationToken) ||
      (responseData.result && responseData.result.AuthorisationToken);

    if (!authToken) {
      throw new Error('AuthorisationToken not found in response');
    }
  } catch (error) {
    tokenLogData = {
      ...tokenLogData,
      response: error.response ? error.response.data : {},
      statusCode: error.response ? error.response.status : 0,
      success: false,
      errorMessage: error.message,
    };
    await ThirdPartyLog.create(tokenLogData);
    throw new ApiError(httpStatus.BAD_REQUEST, `Token generation failed: ${error.message}`);
  }

  // Step 2: Create Policy with generated token
  const startDate = certificate.serviceStartDate || certificate.createdAt;

  const policyPayload = {
    yek_ku76H6felco7: '#$x82kc6&m*E',
    mode: 'payload',
    data: {
      customer: {
        title: (certificate.salutation || 'Mr').substring(0, 20),
        first_name: certificate.firstName.substring(0, 100),
        last_name: (certificate.lastName || '').substring(0, 100),
        address1: (certificate.apartment || '').substring(0, 200),
        address2: (certificate.houseNo || '').substring(0, 200),
        city: certificate.cityRef ? certificate.cityRef.name.substring(0, 100) : '',
        state: certificate.stateRef ? certificate.stateRef.name.substring(0, 100) : '',
        pin_code: (certificate.pincode || '').substring(0, 12),
        email: (certificate.emailAddress || '').substring(0, 150),
        mobile: certificate.mobileNumber.substring(0, 20),
        gender: getCustomerGender(certificate.gender),
        dob: certificate.dateOfBirth ? certificate.dateOfBirth.toISOString().split('T')[0] : null,
      },
      vehicle: {
        vehicle_type: 'Two Wheeler'.substring(0, 50),
        make: certificate.vehicleBrandRef ? certificate.vehicleBrandRef.name.substring(0, 100) : '',
        model: certificate.vehicleModelRef ? certificate.vehicleModelRef.name.substring(0, 100) : '',
        variant:
          certificate.vehicleModelRef && certificate.vehicleModelRef.variant
            ? certificate.vehicleModelRef.variant.substring(0, 100)
            : '',
        fuel_type:
          certificate.vehicleModelRef && certificate.vehicleModelRef.fuelType
            ? certificate.vehicleModelRef.fuelType.substring(0, 30)
            : null,
        registration_number: certificate.registrationNo.substring(0, 50),
        first_registration_date: certificate.serviceStartDate
          ? certificate.serviceStartDate.toISOString().split('T')[0]
          : null,
        engine_number: certificate.engineNo ? certificate.engineNo.substring(0, 100) : null,
        chassis_number: certificate.chassisNumber.substring(0, 100),
        model_year: certificate.manufacturingYear || null,
        purchase_state: certificate.stateRef ? certificate.stateRef.name.substring(0, 100) : null,
        purchase_city: certificate.cityRef ? certificate.cityRef.name.substring(0, 100) : null,
      },
      policy: {
        policy_number: certificate.certificateNumber.substring(0, 100),
        issued_date: certificate.createdAt.toISOString().split('T')[0],
        start_date: startDate.toISOString().split('T')[0],
        end_date: calculateEndDate(startDate),
        insurer: 'NYOM Insurer'.substring(0, 150),
        policy_duration: '1 year'.substring(0, 50),
        product_details: certificate.planRef ? certificate.planRef.name.substring(0, 255) : '',
      },
      nominees: [
        {
          first_name: (certificate.nomineeFullName || '').substring(0, 100),
          last_name: '',
          gender: getNomineeGender(certificate.nomineeRelation),
          mobile: certificate.alternateMobileNo ? certificate.alternateMobileNo.substring(0, 20) : null,
          state: certificate.stateRef ? certificate.stateRef.name.substring(0, 100) : null,
          city: certificate.cityRef ? certificate.cityRef.name.substring(0, 100) : null,
          relation: certificate.nomineeRelation ? certificate.nomineeRelation.substring(0, 50) : '',
          age: certificate.nomineeAge || null,
          address: certificate.apartment ? certificate.apartment.substring(0, 200) : null,
          street: certificate.houseNo ? certificate.houseNo.substring(0, 200) : null,
        },
      ],
    },
  };

  const policyHeaders = {
    'Content-Type': 'application/json',
    Authorization: authToken,
  };

  let policyLogData = {
    provider: 'Europ Assistance',
    certificateRef: certificateId,
    requestUrl: `${baseUrl}/api/nyom/createPolicy`,
    method: 'POST',
    headers: policyHeaders,
    payload: policyPayload,
  };

  try {
    const policyResponse = await axios.post(`${baseUrl}/api/nyom/createPolicy`, policyPayload, { headers: policyHeaders });

    policyLogData = {
      ...policyLogData,
      response: policyResponse.data,
      statusCode: policyResponse.status,
      success: true,
    };
    await ThirdPartyLog.create(policyLogData);
    return policyResponse.data;
  } catch (error) {
    policyLogData = {
      ...policyLogData,
      response: error.response ? error.response.data : {},
      statusCode: error.response ? error.response.status : 0,
      success: false,
      errorMessage: error.message,
    };
    await ThirdPartyLog.create(policyLogData);
    throw new ApiError(httpStatus.BAD_REQUEST, `Policy creation failed: ${error.message}`);
  }
};

module.exports = {
  sendCertificateKeyologicData,
  queryThirdPartyLogs,
  getThirdPartyLogById,
  retryFailedApiCall,
  sendCertificateEuropAssistanceData,
};
