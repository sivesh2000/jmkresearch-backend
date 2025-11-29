const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userPlanValidation = require('../../validations/user-plan.validation');
const userPlanController = require('../../controllers/user-plan.controller');

const router = express.Router();

router
  .route('/main-dealer/assigned-users/:planRef')
  .get(auth('getUsers'), validate(userPlanValidation.getAssignedUsersByPlan), userPlanController.getAssignedUsersByPlan);

router
  .route('/main-dealer/assign')
  .post(auth('manageUsers'), validate(userPlanValidation.assignPlanByMainDealer), userPlanController.assignPlanByMainDealer);

router.route('/main-dealer/available-plans').get(auth('getUsers'), userPlanController.getAvailablePlans);

router.route('/main-dealer/users').get(auth('getUsers'), userPlanController.getMyUsers);

router
  .route('/main-dealer/mrp-permission/:userPlanId')
  .patch(auth('manageUsers'), validate(userPlanValidation.updateMRPPermission), userPlanController.updateMRPPermission);

router
  .route('/')
  .post(auth('manageUsers'), validate(userPlanValidation.assignPlanToUser), userPlanController.assignPlanToUser)
  .get(auth(), validate(userPlanValidation.getUserPlans), userPlanController.getUserPlans);

router
  .route('/:userPlanId')
  .get(auth(), validate(userPlanValidation.getUserPlan), userPlanController.getUserPlan)
  .patch(auth('manageUsers'), validate(userPlanValidation.updateUserPlan), userPlanController.updateUserPlan)
  .delete(auth('manageUsers'), validate(userPlanValidation.deleteUserPlan), userPlanController.deleteUserPlan);

router
  .route('/:userPlanId/status')
  .patch(auth('manageUsers'), validate(userPlanValidation.updateUserPlanStatus), userPlanController.updateUserPlanStatus);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: UserPlans
 *   description: User plan assignment management
 */

/**
 * @swagger
 * /user-plans:
 *   post:
 *     summary: Assign plan to user
 *     description: Assign a master plan to user with specific pricing
 *     tags: [UserPlans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planRef
 *               - userRef
 *               - duration
 *               - mrp
 *               - dlp
 *             properties:
 *               planRef:
 *                 type: string
 *                 description: Master plan reference
 *               userRef:
 *                 type: string
 *                 description: User reference
 *               duration:
 *                 type: integer
 *                 description: Duration in months
 *               mrp:
 *                 type: number
 *                 description: Maximum Retail Price
 *               dlp:
 *                 type: number
 *                 description: Dealer Landing Price
 *               isActive:
 *                 type: boolean
 *             example:
 *               planRef: "507f1f77bcf86cd799439011"
 *               userRef: "507f1f77bcf86cd799439012"
 *               duration: 12
 *               mrp: 5000
 *               dlp: 4500
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
 *     summary: Get all user plan assignments
 *     tags: [UserPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: planRef
 *         schema:
 *           type: string
 *         description: Filter by plan reference
 *       - in: query
 *         name: userRef
 *         schema:
 *           type: string
 *         description: Filter by user reference
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by status
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
 *         description: Maximum number of user plans
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
 * /user-plans/{id}:
 *   get:
 *     summary: Get a user plan assignment
 *     tags: [UserPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User plan id
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
 *     summary: Update a user plan assignment
 *     tags: [UserPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User plan id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration:
 *                 type: integer
 *               mrp:
 *                 type: number
 *               dlp:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *             example:
 *               mrp: 5500
 *               dlp: 5000
 *               isActive: true
 *     responses:
 *       "200":
 *         description: OK
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a user plan assignment
 *     tags: [UserPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User plan id
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
/**
 * @swagger
 * /user-plans/main-dealer/assign:
 *   post:
 *     summary: Main dealer assigns plan to user
 *     description: Main dealer assigns a plan to their user with MRP edit permission control
 *     tags: [UserPlans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planRef
 *               - userRef
 *               - mrp
 *               - dlp
 *             properties:
 *               planRef:
 *                 type: string
 *                 description: Plan reference ID
 *               userRef:
 *                 type: string
 *                 description: User reference ID
 *               mrp:
 *                 type: number
 *                 description: Maximum Retail Price
 *               dlp:
 *                 type: number
 *                 description: Dealer Landing Price
 *               canEditMRP:
 *                 type: boolean
 *                 description: Allow user to edit MRP
 *             example:
 *               planRef: "507f1f77bcf86cd799439011"
 *               userRef: "507f1f77bcf86cd799439012"
 *               mrp: 5000
 *               dlp: 4500
 *               canEditMRP: true
 *     responses:
 *       "201":
 *         description: Plan assigned successfully
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /user-plans/main-dealer/available-plans:
 *   get:
 *     summary: Get available plans for main dealer
 *     description: Get all plans assigned to the main dealer that can be assigned to users
 *     tags: [UserPlans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   planRef:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                   mrp:
 *                     type: number
 *                   dlp:
 *                     type: number
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /user-plans/main-dealer/users:
 *   get:
 *     summary: Get users under main dealer
 *     description: Get all active users belonging to the main dealer
 *     tags: [UserPlans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   userType:
 *                     type: string
 *                   status:
 *                     type: boolean
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /user-plans/main-dealer/assigned-users/{planRef}:
 *   get:
 *     summary: Get users assigned to a specific plan
 *     description: Get all users assigned to a specific plan by the main dealer
 *     tags: [UserPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planRef
 *         required: true
 *         schema:
 *           type: string
 *         description: Plan reference ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   userRef:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   planRef:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *                   mrp:
 *                     type: number
 *                   dlp:
 *                     type: number
 *                   canEditMRP:
 *                     type: boolean
 *                   isActive:
 *                     type: boolean
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /user-plans/main-dealer/mrp-permission/{userPlanId}:
 *   patch:
 *     summary: Update MRP edit permission
 *     description: Update whether a user can edit MRP for their assigned plan
 *     tags: [UserPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userPlanId
 *         required: true
 *         schema:
 *           type: string
 *         description: User plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - canEditMRP
 *             properties:
 *               canEditMRP:
 *                 type: boolean
 *                 description: Allow or disallow MRP editing
 *             example:
 *               canEditMRP: false
 *     responses:
 *       "200":
 *         description: Permission updated successfully
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
 * /user-plans/{id}/status:
 *   patch:
 *     summary: Update user plan status
 *     description: Only super admin and main dealer can update user plan status. Main dealer can only update status for users under them.
 *     tags: [UserPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User plan id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Active status of the user plan
 *             example:
 *               isActive: false
 *     responses:
 *       "200":
 *         description: OK
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
