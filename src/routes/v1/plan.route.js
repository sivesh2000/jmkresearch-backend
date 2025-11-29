const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const planValidation = require('../../validations/plan.validation');
const planController = require('../../controllers/plan.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(planValidation.createPlan), planController.createPlan)
  .get(auth('getUsers'), validate(planValidation.getPlans), planController.getPlans);

router
  .route('/:planId')
  .get(auth('getUsers'), validate(planValidation.getPlan), planController.getPlan)
  .patch(auth('manageUsers'), validate(planValidation.updatePlan), planController.updatePlan)
  .delete(auth('manageUsers'), validate(planValidation.deletePlan), planController.deletePlan);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Master plan management (Super Admin only)
 */

/**
 * @swagger
 * /plans:
 *   post:
 *     summary: Create a master plan
 *     description: Only super admin can create master plans without pricing
 *     tags: [Plans]
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
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *             example:
 *               name: "Basic Plan"
 *               code: "BASIC"
 *               description: "Basic insurance plan"
 *               features: ["Coverage A", "Coverage B"]
 *               isActive: true
 *     responses:
 *       "201":
 *         description: Created
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all master plans
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Plan name
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Plan code
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Plan status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of plans
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
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /plans/{id}:
 *   get:
 *     summary: Get a master plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan id
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a master plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               planFeatures:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of plan feature IDs
 *               isActive:
 *                 type: boolean
 *             example:
 *               name: "Premium Plan"
 *               planFeatures: ["507f1f77bcf86cd799439011"]
 *               isActive: true
 *
 *   delete:
 *     summary: Delete a master plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
