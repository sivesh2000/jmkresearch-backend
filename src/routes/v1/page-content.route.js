const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const pageContentValidation = require('../../validations/page-content.validation');
const pageContentController = require('../../controllers/page-content.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageContent'), validate(pageContentValidation.createPageContent), pageContentController.createPageContent)
  .get(validate(pageContentValidation.getPageContents), pageContentController.getPageContents);

router.route('/search').get(validate(pageContentValidation.searchPageContents), pageContentController.searchPageContents);

router
  .route('/menu/:menuId')
  .get(validate(pageContentValidation.getPageContentsByMenu), pageContentController.getPageContentsByMenu);

router
  .route('/slug/:slug')
  .get(validate(pageContentValidation.getPageContentBySlug), pageContentController.getPageContentBySlug);

router
  .route('/:contentId/publish')
  .patch(
    auth('manageContent'),
    validate(pageContentValidation.publishPageContent),
    pageContentController.publishPageContent
  );

router
  .route('/:contentId')
  .get(validate(pageContentValidation.getPageContent), pageContentController.getPageContent)
  .patch(auth('manageContent'), validate(pageContentValidation.updatePageContent), pageContentController.updatePageContent)
  .delete(auth('manageContent'), validate(pageContentValidation.deletePageContent), pageContentController.deletePageContent);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: PageContents
 *   description: Page content management
 */

/**
 * @swagger
 * /page-contents:
 *   post:
 *     summary: Create page content
 *     tags: [PageContents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuId
 *               - title
 *               - slug
 *             properties:
 *               menuId:
 *                 type: string
 *               title:
 *                 type: string
 *                 example: "About Us"
 *               slug:
 *                 type: string
 *                 example: "about-us"
 *               content:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *     responses:
 *       "201":
 *         description: Created
 *   get:
 *     summary: Get all page contents
 *     tags: [PageContents]
 *     parameters:
 *       - in: query
 *         name: menuId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /page-contents/slug/{slug}:
 *   get:
 *     summary: Get page content by slug
 *     tags: [PageContents]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         description: Content not found
 */

/**
 * @swagger
 * /page-contents/{contentId}:
 *   get:
 *     summary: Get page content
 *     tags: [PageContents]
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *   patch:
 *     summary: Update page content
 *     tags: [PageContents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *   delete:
 *     summary: Delete page content
 *     tags: [PageContents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: No Content
 */
