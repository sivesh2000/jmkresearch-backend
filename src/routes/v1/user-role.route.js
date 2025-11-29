const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userRoleValidation = require('../../validations/user-role.validation');
const userRoleController = require('../../controllers/user-role.controller');

const router = express.Router();

router.post(
  '/assign',
  auth('manageUsers'),
  validate(userRoleValidation.assignRolesToUser),
  userRoleController.assignRolesToUser
);

router.post(
  '/remove',
  auth('manageUsers'),
  validate(userRoleValidation.removeRolesFromUser),
  userRoleController.removeRolesFromUser
);

router.post(
  '/toggle',
  auth('manageUsers'),
  validate(userRoleValidation.toggleUserRoles),
  userRoleController.toggleUserRoles
);

router.get(
  '/:userId/roles-permissions',
  auth('getUsers'),
  validate(userRoleValidation.getUserRolesAndPermissions),
  userRoleController.getUserRolesAndPermissions
);

module.exports = router;
/**
 * @swagger
 * tags:
 *   name: UserRole
 *   description: User role assignment management
 */

/**
 * @swagger
 * /user-role/assign:
 *   post:
 *     summary: Assign roles to user
 *     tags: [UserRole]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleIds
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of role IDs to assign
 *             example:
 *               userId: "507f1f77bcf86cd799439011"
 *               roleIds: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 *     responses:
 *       "201":
 *         description: Roles assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: number
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /user-role/remove:
 *   post:
 *     summary: Remove roles from user
 *     tags: [UserRole]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleIds
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of role IDs to remove
 *             example:
 *               userId: "507f1f77bcf86cd799439011"
 *               roleIds: ["507f1f77bcf86cd799439012"]
 *     responses:
 *       "200":
 *         description: Roles removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /user-role/toggle:
 *   post:
 *     summary: Toggle user roles (add if not assigned, remove if assigned)
 *     tags: [UserRole]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleIds
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of role IDs to toggle
 *             example:
 *               userId: "507f1f77bcf86cd799439011"
 *               roleIds: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 *     responses:
 *       "200":
 *         description: Roles toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 added:
 *                   type: number
 *                 removed:
 *                   type: number
 */

/**
 * @swagger
 * /user-role/{userId}/roles-permissions:
 *   get:
 *     summary: Get user roles and permissions
 *     tags: [UserRole]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       "200":
 *         description: User roles and permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       roleId:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       domain:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                       actions:
 *                         type: string
 *                       description:
 *                         type: string
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
