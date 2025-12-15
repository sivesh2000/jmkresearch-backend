const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const categoryValidation = require('../../validations/category.validation');
const categoryController = require('../../controllers/category.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(categoryValidation.createCategory), categoryController.createCategory)
  .get(validate(categoryValidation.getCategories), categoryController.getCategories);

router.route('/tree').get(categoryController.getCategoryTree);
router.route('/search').get(categoryController.searchCategories);

router
  .route('/reorder')
  .patch(auth('manageUsers'), validate(categoryValidation.reorderCategories), categoryController.reorderCategories);

router.route('/slug/:slug').get(validate(categoryValidation.getCategoryBySlug), categoryController.getCategoryBySlug);

router
  .route('/:categoryId')
  .get(validate(categoryValidation.getCategory), categoryController.getCategory)
  .patch(auth('manageUsers'), validate(categoryValidation.updateCategory), categoryController.updateCategory)
  .delete(auth('manageUsers'), validate(categoryValidation.deleteCategory), categoryController.deleteCategory);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a category
 *     tags: [Categories]
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
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Technology"
 *               slug:
 *                 type: string
 *                 example: "technology"
 *               parentId:
 *                 type: string
 *               order:
 *                 type: number
 *                 example: 0
 *     responses:
 *       "201":
 *         description: Created
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /categories/tree:
 *   get:
 *     summary: Get category tree structure
 *     tags: [Categories]
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /categories/search:
 *   get:
 *     summary: Search categories by name, slug, or description
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum results
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
 *                   slug:
 *                     type: string
 *                   displayName:
 *                     type: string
 *                     description: Category name with parent (e.g., "Technology > Software")
 *                   parentId:
 *                     type: object
 */

/**
 * @swagger
 * /categories/{categoryId}:
 *   get:
 *     summary: Get a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *   patch:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: No Content
 */
