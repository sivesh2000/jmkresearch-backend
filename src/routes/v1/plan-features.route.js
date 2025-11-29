const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const planFeatureValidation = require('../../validations/plan-feature.validation');
const planFeatureController = require('../../controllers/plan-feature.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(planFeatureValidation.createPlanFeature), planFeatureController.createPlanFeature)
  .get(auth('getUsers'), validate(planFeatureValidation.getPlanFeatures), planFeatureController.getPlanFeatures);

router
  .route('/:planFeatureId')
  .get(auth('getUsers'), validate(planFeatureValidation.getPlanFeature), planFeatureController.getPlanFeature)
  .patch(auth('manageUsers'), validate(planFeatureValidation.updatePlanFeature), planFeatureController.updatePlanFeature)
  .delete(auth('manageUsers'), validate(planFeatureValidation.deletePlanFeature), planFeatureController.deletePlanFeature);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: PlanFeatures
 *   description: Plan features management
 */

/**
 * @swagger
 * /plan-features:
 *   post:
 *     summary: Create a plan feature
 *     description: Only super admin can create plan features
 *     tags: [PlanFeatures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               desc:
 *                 type: string
 *                 description: HTML content from rich text editor
 *               note:
 *                 type: string
 *               status:
 *                 type: boolean
 *               example:
 *                 title: "Premium Coverage"
 *                 desc: "<p>This feature provides <strong>comprehensive coverage</strong> including:</p><ul><li>Accident protection</li><li>Theft coverage</li></ul>"
 *                 note: "Available for premium plans only"
 *                 status: true
 *     responses:
 *       "201":
 *         description: Created
 *       "403":
 *         description: Forbidden
 *   get:
 *     summary: Get all plan features
 *     tags: [PlanFeatures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /plan-features/{id}:
 *   get:
 *     summary: Get a plan feature
 *     tags: [PlanFeatures]
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
 *       "404":
 *         description: Not found
 *   patch:
 *     summary: Update a plan feature
 *     description: Only super admin can update plan features
 *     tags: [PlanFeatures]
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
 *               title:
 *                 type: string
 *               desc:
 *                 type: string
 *               note:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       "200":
 *         description: OK
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 *   delete:
 *     summary: Delete a plan feature
 *     description: Only super admin can delete plan features
 *     tags: [PlanFeatures]
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
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 */
