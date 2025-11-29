const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const rolePermissionValidation = require('../../validations/role-permission.validation');
const rolePermissionController = require('../../controllers/role-permission.controller');

const router = express.Router();

router.post(
  '/add',
  auth('manageUsers'),
  validate(rolePermissionValidation.addPermissionsToRole),
  rolePermissionController.addPermissionsToRole
);

router.post(
  '/remove',
  auth('manageUsers'),
  validate(rolePermissionValidation.removePermissionsFromRole),
  rolePermissionController.removePermissionsFromRole
);

router.get(
  '/:roleId/permissions',
  auth('getUsers'),
  validate(rolePermissionValidation.getRolePermissions),
  rolePermissionController.getRolePermissions
);

router.get(
  '/:roleId/available',
  auth('getUsers'),
  validate(rolePermissionValidation.getAvailablePermissions),
  rolePermissionController.getAvailablePermissions
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: RolePermission
 *   description: Role permission mapping management
 */

/**
 * @swagger
 * /role-permission/add:
 *   post:
 *     summary: Add permissions to role
 *     tags: [RolePermission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - permissionIds
 *             properties:
 *               roleId:
 *                 type: string
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       "201":
 *         description: Created
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *
 * /role-permission/remove:
 *   post:
 *     summary: Remove permissions from role
 *     tags: [RolePermission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - permissionIds
 *             properties:
 *               roleId:
 *                 type: string
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       "200":
 *         description: OK
 */
