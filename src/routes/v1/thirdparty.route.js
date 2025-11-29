const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const thirdpartyValidation = require('../../validations/thirdparty.validation');
const thirdpartyController = require('../../controllers/thirdparty.controller');

const router = express.Router();

router.post(
  '/send-certificate-data',
  auth(),
  validate(thirdpartyValidation.sendCertificateKeyologicData),
  thirdpartyController.sendCertificateKeyologicData
);

router.get('/', auth(), validate(thirdpartyValidation.getThirdPartyLogs), thirdpartyController.getThirdPartyLogs);

// Move retry route BEFORE the /:logId route
router.post('/retry/:certificateId', auth(), thirdpartyController.retryFailedApiCall);

// Keep /:logId route last
router.get('/:logId', auth(), validate(thirdpartyValidation.getThirdPartyLog), thirdpartyController.getThirdPartyLog);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: ThirdParty
 *   description: Third party log management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ThirdPartyLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         provider:
 *           type: string
 *         certificateRef:
 *           type: string
 *         requestUrl:
 *           type: string
 *         method:
 *           type: string
 *           enum: [GET, POST, PUT, DELETE, PATCH]
 *         headers:
 *           type: object
 *         payload:
 *           type: object
 *         response:
 *           type: object
 *         statusCode:
 *           type: number
 *         success:
 *           type: boolean
 *         errorMessage:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 5ebac534954b54139806c112
 *         provider: keyologic
 *         certificateRef: 5ebac534954b54139806c113
 *         requestUrl: https://api.keyologic.com/certificate
 *         method: POST
 *         headers: {}
 *         payload: {}
 *         response: {}
 *         statusCode: 200
 *         success: true
 *         errorMessage: null
 *         createdAt: 2020-05-12T16:18:04.793Z
 *         updatedAt: 2020-05-12T16:18:04.793Z
 */

/**
 * @swagger
 * /thirdparty:
 *   get:
 *     summary: Get third party logs
 *     description: Retrieve third party logs with filtering and pagination
 *     tags: [ThirdParty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *         description: Filter by provider
 *       - in: query
 *         name: certificateRef
 *         schema:
 *           type: string
 *         description: Filter by certificate reference
 *       - in: query
 *         name: success
 *         schema:
 *           type: boolean
 *         description: Filter by success status
 *       - in: query
 *         name: statusCode
 *         schema:
 *           type: number
 *         description: Filter by HTTP status code
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. createdAt:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of logs
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ThirdPartyLog'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /thirdparty/{logId}:
 *   get:
 *     summary: Get a third party log
 *     description: Retrieve a third party log by ID
 *     tags: [ThirdParty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: logId
 *         required: true
 *         schema:
 *           type: string
 *         description: Third party log id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ThirdPartyLog'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /thirdparty/send-certificate-data:
 *   post:
 *     summary: Send certificate data to third party
 *     description: Send certificate data to Keyologic third party service
 *     tags: [ThirdParty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - certificateId
 *             properties:
 *               certificateId:
 *                 type: string
 *                 description: Certificate ID to send data for
 *             example:
 *               certificateId: 5ebac534954b54139806c113
 *     responses:
 *       "200":
 *         description: Data sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *             example:
 *               message: Data sent successfully
 *               result: {}
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
/**
 * @swagger
 * /thirdparty/retry/{certificateId}:
 *   post:
 *     summary: Retry failed third party API call
 *     description: Retry the last failed third party API call for a specific certificate
 *     tags: [ThirdParty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Certificate ID to retry failed API call for
 *     responses:
 *       "200":
 *         description: API retry successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *             example:
 *               message: API retry successful
 *               data: {}
 *       "400":
 *         description: API retry failed or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *             example:
 *               message: API retry failed
 *               error: Connection timeout
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         description: No failed API call found for this certificate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               code: 404
 *               message: No failed API call found for this certificate
 */
