const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const tenderValidation = require('../../validations/tender.validation');
const tenderController = require('../../controllers/tender.controller');
const upload = require('../../middlewares/upload');

const router = express.Router();

router.route('/export').get(auth('manageUsers'), tenderController.exportTenders);

router.route('/import').post(auth('manageUsers'), upload.single('file'), tenderController.importTenders);

router
  .route('/')
  .post(auth('manageUsers'), validate(tenderValidation.createTender), tenderController.createTender)
  .get(validate(tenderValidation.getTenders), tenderController.getTenders);

router.route('/technology/:technology').get(tenderController.getTendersByTechnology);

router.route('/status/:status').get(tenderController.getTendersByStatus);

router.route('/slug/:slug').get(validate(tenderValidation.getTenderBySlug), tenderController.getTenderBySlug);

router
  .route('/:tenderId')
  .get(validate(tenderValidation.getTender), tenderController.getTender)
  .patch(auth('manageUsers'), validate(tenderValidation.updateTender), tenderController.updateTender)
  .delete(auth('manageUsers'), validate(tenderValidation.deleteTender), tenderController.deleteTender);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Tenders
 *   description: Tender management
 */

/**
 * @swagger
 * /tenders:
 *   post:
 *     summary: Create a tender
 *     tags: [Tenders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenderName
 *               - technology
 *               - companyId
 *               - stateId
 *             properties:
 *               tenderName:
 *                 type: string
 *                 example: "Solar Park Development Tender"
 *               technology:
 *                 type: string
 *                 example: "Solar"
 *               tenderCapacityMW:
 *                 type: number
 *                 example: 500
 *               companyId:
 *                 type: string
 *               stateId:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 *   get:
 *     summary: Get all tenders
 *     tags: [Tenders]
 *     parameters:
 *       - in: query
 *         name: technology
 *         schema:
 *           type: string
 *       - in: query
 *         name: tenderStatus
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /tenders/{tenderId}:
 *   get:
 *     summary: Get a tender
 *     tags: [Tenders]
 *     parameters:
 *       - in: path
 *         name: tenderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *   patch:
 *     summary: Update a tender
 *     tags: [Tenders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *   delete:
 *     summary: Delete a tender
 *     tags: [Tenders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: No Content
 */
/**
 * @swagger
 * /tenders/export:
 *   get:
 *     summary: Export tenders to Excel
 *     tags: [Tenders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: technology
 *         schema:
 *           type: string
 *       - in: query
 *         name: tenderStatus
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Excel file download
 */

/**
 * @swagger
 * /tenders/import:
 *   post:
 *     summary: Import tenders from Excel
 *     tags: [Tenders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       "200":
 *         description: Import results
 */
