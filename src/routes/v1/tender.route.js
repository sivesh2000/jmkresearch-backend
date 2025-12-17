const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const tenderValidation = require('../../validations/tender.validation');
const tenderController = require('../../controllers/tender.controller');
const csvUpload = require('../../middlewares/csvUpload');

const router = express.Router();

router.route('/export/columns').get(tenderController.getExportColumns);

router.route('/export').get(auth('manageUsers'), validate(tenderValidation.exportTenders), tenderController.exportTenders);

router
  .route('/import')
  .post(
    auth('manageUsers'),
    csvUpload.single('file'),
    validate(tenderValidation.importTenders),
    tenderController.importTenders
  );

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
 * /tenders/export/columns:
 *   get:
 *     summary: Get available export columns for tenders
 *     tags: [Tenders]
 *     responses:
 *       "200":
 *         description: List of available export columns
 */

/**
 * @swagger
 * /tenders/export:
 *   get:
 *     summary: Export tenders to CSV
 *     tags: [Tenders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: technology
 *         schema:
 *           type: string
 *         description: Filter by technology
 *       - in: query
 *         name: tenderStatus
 *         schema:
 *           type: string
 *         description: Filter by tender status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: columns
 *         schema:
 *           type: string
 *         description: Comma-separated list of columns to export
 *         example: "tenderName,technology,tenderCapacityMW,tenderStatus"
 *     responses:
 *       "200":
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */

/**
 * @swagger
 * /tenders/import:
 *   post:
 *     summary: Import tenders from CSV
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
 *                 description: CSV file with tender data (must have .csv extension)
 *     responses:
 *       "200":
 *         description: Import results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: number
 *                   description: Number of tenders successfully imported
 *                 failed:
 *                   type: number
 *                   description: Number of tenders that failed to import
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of error messages for failed imports
 */
