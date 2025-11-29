const express = require('express');
const Joi = require('joi');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const districtController = require('../../controllers/district.controller');
const { objectId } = require('../../validations/custom.validation');

const router = express.Router();

const districtValidation = {
  getDistricts: {
    query: Joi.object().keys({
      stateId: Joi.string().custom(objectId),
    }),
  },
  createDistrict: {
    body: Joi.object().keys({
      name: Joi.string().required(),
      stateId: Joi.string().custom(objectId).required(),
    }),
  },
  updateDistrict: {
    params: Joi.object().keys({
      id: Joi.string().custom(objectId),
    }),
    body: Joi.object()
      .keys({
        name: Joi.string(),
        isActive: Joi.boolean(),
      })
      .min(1),
  },
  deleteDistrict: {
    params: Joi.object().keys({
      id: Joi.string().custom(objectId),
    }),
  },
};

router
  .route('/')
  .get(validate(districtValidation.getDistricts), districtController.getDistricts)
  .post(auth('manageUsers'), validate(districtValidation.createDistrict), districtController.createDistrict);

router.route('/all').get(districtController.getAllDistrictsWithState);

router
  .route('/:id')
  .patch(auth('manageUsers'), validate(districtValidation.updateDistrict), districtController.updateDistrict)
  .delete(auth('manageUsers'), validate(districtValidation.deleteDistrict), districtController.deleteDistrict);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Districts
 *   description: District management
 */

/**
 * @swagger
 * /districts:
 *   get:
 *     summary: Get districts
 *     tags: [Districts]
 *     parameters:
 *       - in: query
 *         name: stateId
 *         schema:
 *           type: string
 *         description: Filter by state ID
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
 *                   stateId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       code:
 *                         type: string
 *   post:
 *     summary: Create district
 *     tags: [Districts]
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
 *               - stateId
 *             properties:
 *               name:
 *                 type: string
 *               stateId:
 *                 type: string
 *             example:
 *               name: "Mumbai"
 *               stateId: "507f1f77bcf86cd799439011"
 *     responses:
 *       "201":
 *         description: Created
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /districts/all:
 *   get:
 *     summary: Get all districts with state info
 *     tags: [Districts]
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /districts/{id}:
 *   patch:
 *     summary: Update district
 *     tags: [Districts]
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
 *               name:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Delete district
 *     tags: [Districts]
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
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
