const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const permissionValidation = require('../../validations/permission.validation');
const permissionController = require('../../controllers/permission.controller');

const router = express.Router();

// Domains (only GET)
router.get('/domains/list', auth('getUsers'), permissionController.getDomains);

router
  .route('/')
  .post(auth('manageUsers'), validate(permissionValidation.createPermission), permissionController.createPermission)
  .get(auth('getUsers'), validate(permissionValidation.getPermissions), permissionController.getPermissions);

router
  .route('/:permissionId')
  .get(auth('getUsers'), validate(permissionValidation.getPermission), permissionController.getPermission)
  .patch(auth('manageUsers'), validate(permissionValidation.updatePermission), permissionController.updatePermission)
  .delete(auth('manageUsers'), validate(permissionValidation.deletePermission), permissionController.deletePermission);

router
  .route('/custom-roles')
  .post(auth('manageUsers'), validate(permissionValidation.createCustomRole), permissionController.createCustomRole)
  .get(auth('getUsers'), validate(permissionValidation.getCustomRoles), permissionController.getCustomRoles);

router
  .route('/custom-roles/:roleId')
  .get(auth('getUsers'), validate(permissionValidation.getCustomRole), permissionController.getCustomRole)
  .patch(auth('manageUsers'), validate(permissionValidation.updateCustomRole), permissionController.updateCustomRole)
  .delete(auth('manageUsers'), validate(permissionValidation.deleteCustomRole), permissionController.deleteCustomRole);

router
  .route('/assign-role')
  .post(auth('manageUsers'), validate(permissionValidation.assignRoleToUser), permissionController.assignRoleToUser);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Permission and custom role management
 */

/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: Create a permission
 *     description: Only super admin can create permissions
 *     tags: [Permissions]
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
 *               - module
 *             properties:
 *               name:
 *                 type: string
 *               module:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               name: "manageUsers"
 *               module: "User"
 *               description: "Allows managing users"
 *     responses:
 *       "201":
 *         description: Created
 *       "403":
 *         description: Forbidden
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
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
 * /permissions/{permissionId}:
 *   get:
 *     summary: Get a permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         description: Not found
 *   patch:
 *     summary: Update a permission
 *     description: Only super admin can update permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
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
 *               module:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 *   delete:
 *     summary: Delete a permission
 *     description: Only super admin can delete permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
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

/**
 * @swagger
 * /custom-roles:
 *   post:
 *     summary: Create a custom role
 *     description: Only super admin can create custom roles
 *     tags: [Permissions]
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
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               name: "Manager"
 *               permissions: ["manageUsers", "viewReports"]
 *     responses:
 *       "201":
 *         description: Created
 *       "403":
 *         description: Forbidden
 *   get:
 *     summary: Get all custom roles
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
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
 * /custom-roles/{roleId}:
 *   get:
 *     summary: Get a custom role
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         description: Not found
 *   patch:
 *     summary: Update a custom role
 *     description: Only super admin can update custom roles
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
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
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 *   delete:
 *     summary: Delete a custom role
 *     description: Only super admin can delete custom roles
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
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

/**
 * @swagger
 * /assign-role:
 *   post:
 *     summary: Assign a custom role to a user
 *     description: Only super admin can assign roles
 *     tags: [Permissions]
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
 *               - customRoleId
 *             properties:
 *               userId:
 *                 type: string
 *               customRoleId:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               userId: "60f7c2b8e1d3c2a5b4e8f123"
 *               customRoleId: "60f7c2b8e1d3c2a5b4e8f456"
 *               permissions: ["manageUsers"]
 *     responses:
 *       "200":
 *         description: OK
 *       "403":
 *         description: Forbidden
 *       "404":
 *         description: Not found
 */
