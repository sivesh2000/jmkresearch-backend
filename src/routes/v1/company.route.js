const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const upload = require('../../middlewares/upload');
const companyValidation = require('../../validations/company.validation');
const companyController = require('../../controllers/company.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(companyValidation.createCompany), companyController.createCompany)
  .get(validate(companyValidation.getCompanies), companyController.getCompanies);

router.route('/player-type/:playerType').get(companyController.getCompaniesByPlayerType);

router
  .route('/export')
  .get(auth('manageUsers'), validate(companyValidation.exportCompanies), companyController.exportCompanies);

router
  .route('/import')
  .post(
    auth('manageUsers'),
    upload.single('file'),
    validate(companyValidation.importCompanies),
    companyController.importCompanies
  );

router.route('/slug/:slug').get(validate(companyValidation.getCompanyBySlug), companyController.getCompanyBySlug);

router
  .route('/:companyId')
  .get(validate(companyValidation.getCompany), companyController.getCompany)
  .patch(auth('manageUsers'), validate(companyValidation.updateCompany), companyController.updateCompany)
  .delete(auth('manageUsers'), validate(companyValidation.deleteCompany), companyController.deleteCompany);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Company management
 */

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - playerType
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Adani Green Energy"
 *               playerType:
 *                 type: string
 *                 enum: [Project Developer, Module Supplier, EPC Contractor, O&M Provider, Investor, Consultant]
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: playerType
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
 * /companies/{companyId}:
 *   get:
 *     summary: Get a company
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *   patch:
 *     summary: Update a company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *   delete:
 *     summary: Delete a company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: No Content
 */

/**
 * @swagger
 * /companies/export:
 *   get:
 *     summary: Export companies to CSV
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: playerType
 *         schema:
 *           type: string
 *         description: Filter by player type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verified status
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
 * /companies/import:
 *   post:
 *     summary: Import companies from CSV
 *     tags: [Companies]
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
 *                 description: CSV file with company data (must have .csv extension)
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
 *                   description: Number of companies successfully imported
 *                 failed:
 *                   type: number
 *                   description: Number of companies that failed to import
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of error messages for failed imports
 */
