const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const helpDeskMappingValidation = require('../../validations/help-desk-mapping.validation');
const helpDeskMappingController = require('../../controllers/help-desk-mapping.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageUsers'),
    validate(helpDeskMappingValidation.createHelpDeskMapping),
    helpDeskMappingController.createHelpDeskMapping
  )
  .get(
    auth('getUsers'),
    validate(helpDeskMappingValidation.getHelpDeskMappings),
    helpDeskMappingController.getHelpDeskMappings
  );

router
  .route('/:helpDeskMappingId')
  .get(
    auth('getUsers'),
    validate(helpDeskMappingValidation.getHelpDeskMapping),
    helpDeskMappingController.getHelpDeskMapping
  )
  .patch(
    auth('manageUsers'),
    validate(helpDeskMappingValidation.updateHelpDeskMapping),
    helpDeskMappingController.updateHelpDeskMapping
  )
  .delete(
    auth('manageUsers'),
    validate(helpDeskMappingValidation.deleteHelpDeskMapping),
    helpDeskMappingController.deleteHelpDeskMapping
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: HelpDeskMapping
 *   description: Help desk category and subcategory mapping management
 */

/**
 * @swagger
 * /help-desk-mapping:
 *   post:
 *     summary: Create a help desk mapping
 *     tags: [HelpDeskMapping]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryId
 *               - categoryName
 *               - subcategoryId
 *               - subcategoryName
 *               - email
 *               - phone
 *             properties:
 *               roleRef:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               categoryName:
 *                 type: string
 *               subcategoryId:
 *                 type: string
 *               subcategoryName:
 *                 type: string
 *               email:
 *                 type: array
 *                 items:
 *                   type: string
 *               phone:
 *                 type: string
 *               alternativePhone:
 *                 type: string
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
 *     summary: Get all help desk mappings
 *     tags: [HelpDeskMapping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roleRef
 *         schema:
 *           type: string
 *         description: Role ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Category ID
 *       - in: query
 *         name: subcategoryId
 *         schema:
 *           type: string
 *         description: Subcategory ID
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
 *         description: Maximum number of help desk mappings
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
 * /help-desk-mapping/{id}:
 *   get:
 *     summary: Get a help desk mapping
 *     tags: [HelpDeskMapping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Help desk mapping id
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
 *     summary: Update a help desk mapping
 *     tags: [HelpDeskMapping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Help desk mapping id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               categoryName:
 *                 type: string
 *               subcategoryId:
 *                 type: string
 *               subcategoryName:
 *                 type: string
 *               email:
 *                 type: array
 *                 items:
 *                   type: string
 *               phone:
 *                 type: string
 *               alternativePhone:
 *                 type: string
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
 *     summary: Delete a help desk mapping
 *     tags: [HelpDeskMapping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Help desk mapping id
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
