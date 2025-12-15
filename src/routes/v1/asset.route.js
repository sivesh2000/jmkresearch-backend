const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const assetValidation = require('../../validations/asset.validation');
const assetController = require('../../controllers/asset.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: File and asset management
 */

/**
 * @swagger
 * /assets/upload:
 *   post:
 *     summary: Upload file to S3
 *     tags: [Assets]
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
 *               category:
 *                 type: string
 *                 enum: [document, image, logo, banner, icon, other]
 *               description:
 *                 type: string
 *               alt:
 *                 type: string
 *               companyId:
 *                 type: string
 *               pageId:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /assets:
 *   get:
 *     summary: Get all assets
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
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
 *                     $ref: '#/components/schemas/Asset'
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
 */

router.post('/upload', auth(), validate(assetValidation.uploadAsset), assetController.uploadAsset);

router.route('/').get(auth(), validate(assetValidation.getAssets), assetController.getAssets);

router
  .route('/:assetId')
  .get(auth(), validate(assetValidation.getAsset), assetController.getAsset)
  .patch(auth(), validate(assetValidation.updateAsset), assetController.updateAsset)
  .delete(auth(), validate(assetValidation.deleteAsset), assetController.deleteAsset);

router.get('/category/:category', auth(), assetController.getAssetsByCategory);
router.get('/company/:companyId', auth(), assetController.getCompanyAssets);

module.exports = router;
