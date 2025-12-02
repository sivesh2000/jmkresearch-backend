const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const menuValidation = require('../../validations/menu.validation');
const menuController = require('../../controllers/menu.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageMenus'), validate(menuValidation.createMenu), menuController.createMenu)
  .get(validate(menuValidation.getMenus), menuController.getMenus);

router.route('/tree').get(menuController.getMenuTree);

router.route('/reorder').patch(auth('manageMenus'), validate(menuValidation.reorderMenus), menuController.reorderMenus);

router.route('/slug/:slug').get(validate(menuValidation.getMenuBySlug), menuController.getMenuBySlug);

router
  .route('/:menuId')
  .get(validate(menuValidation.getMenu), menuController.getMenu)
  .patch(auth('manageMenus'), validate(menuValidation.updateMenu), menuController.updateMenu)
  .delete(auth('manageMenus'), validate(menuValidation.deleteMenu), menuController.deleteMenu);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Menu management
 */

/**
 * @swagger
 * /menus:
 *   post:
 *     summary: Create a menu
 *     tags: [Menus]
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
 *               - slug
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Home"
 *               slug:
 *                 type: string
 *                 example: "home"
 *               parentId:
 *                 type: string
 *               order:
 *                 type: number
 *                 example: 0
 *     responses:
 *       "201":
 *         description: Created
 *   get:
 *     summary: Get all menus
 *     tags: [Menus]
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /menus/tree:
 *   get:
 *     summary: Get menu tree structure
 *     tags: [Menus]
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /menus/{menuId}:
 *   get:
 *     summary: Get a menu
 *     tags: [Menus]
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         description: Menu not found
 *   patch:
 *     summary: Update a menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *   delete:
 *     summary: Delete a menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: No Content
 */
