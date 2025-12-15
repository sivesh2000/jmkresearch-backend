const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const chartValidation = require('../../validations/chart.validation');
const chartController = require('../../controllers/chart.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Charts
 *   description: Chart management
 */

/**
 * @swagger
 * /charts/datasets/upload:
 *   post:
 *     summary: Upload CSV dataset
 *     tags: [Charts]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChartDataset'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

// Dataset routes
router.post('/datasets/upload', auth(), chartController.uploadDataset);
router.post('/datasets', auth(), validate(chartValidation.createDataset), chartController.createDataset);

/**
 * @swagger
 * /charts:
 *   post:
 *     summary: Create a chart
 *     tags: [Charts]
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
 *               - chartType
 *               - datasetId
 *             properties:
 *               name:
 *                 type: string
 *               titleFrontend:
 *                 type: string
 *               chartType:
 *                 type: string
 *                 enum: [line, bar, stackedBar, area, pie, donut, scatter, table]
 *               datasetId:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChartMaster'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *   get:
 *     summary: Get all charts
 *     tags: [Charts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: chartType
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
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
 *                     $ref: '#/components/schemas/ChartMaster'
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

// Chart routes
router
  .route('/')
  .post(auth(), validate(chartValidation.createChart), chartController.createChart)
  .get(auth(), validate(chartValidation.getCharts), chartController.getCharts);

/**
 * @swagger
 * /charts/{id}:
 *   get:
 *     summary: Get a chart
 *     tags: [Charts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChartMaster'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Update a chart
 *     tags: [Charts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               titleFrontend:
 *                 type: string
 *               chartType:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChartMaster'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Delete a chart
 *     tags: [Charts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

router
  .route('/:chartId')
  .get(auth(), validate(chartValidation.getChart), chartController.getChart)
  .patch(auth(), validate(chartValidation.updateChart), chartController.updateChart)
  .delete(auth(), validate(chartValidation.deleteChart), chartController.deleteChart);

router.post('/:chartId/data', auth(), chartController.getChartData);

// Placement routes
router.post('/placements', auth(), validate(chartValidation.createPlacement), chartController.createPlacement);
router.get('/pages/:pageId/charts', auth(), chartController.getPageCharts);

/**
 * @swagger
 * /charts/quick-setup:
 *   post:
 *     summary: Quick setup - create dataset, chart and placement in one call
 *     tags: [Charts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - datasetName
 *               - chartName
 *               - chartType
 *               - csvData
 *             properties:
 *               datasetName:
 *                 type: string
 *               chartName:
 *                 type: string
 *               chartType:
 *                 type: string
 *                 enum: [line, bar, stackedBar, area, pie, donut, scatter, table]
 *               csvData:
 *                 type: string
 *               pageId:
 *                 type: string
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 dataset:
 *                   $ref: '#/components/schemas/ChartDataset'
 *                 chart:
 *                   $ref: '#/components/schemas/ChartMaster'
 *                 placement:
 *                   $ref: '#/components/schemas/PageChartPlacement'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

// Quick setup for non-technical users
router.post('/quick-setup', auth(), chartController.quickSetup);

module.exports = router;
