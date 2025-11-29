const express = require('express');
const auth = require('../../middlewares/auth');
const modelController = require('../../controllers/model.controller');

const router = express.Router();

router.route('/all').get(auth('getUsers'), modelController.getAllModelsWithMake);

router.route('/').get(auth(), modelController.getModels).post(auth('getUsers'), modelController.createModel);

router
  .route('/:id')
  .put(auth('getUsers'), modelController.updateModel)
  .delete(auth('getUsers'), modelController.deleteModel);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Models
 *   description: Vehicle model management
 */

/**
 * @swagger
 * /models/all:
 *   get:
 *     summary: Get all vehicle models with make information
 *     description: Retrieve all active vehicle models along with their associated make details
 *     tags: [Models]
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
 *                   makeId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   isActive:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 */

/**
 * @swagger
 * /models:
 *   get:
 *     summary: Get models with optional filtering
 *     tags: [Models]
 *     parameters:
 *       - in: query
 *         name: makeId
 *         schema:
 *           type: string
 *         description: Filter models by make ID
 *     responses:
 *       "200":
 *         description: OK
 *   post:
 *     summary: Create a model
 *     tags: [Models]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - makeId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Civic"
 *               makeId:
 *                 type: string
 *                 example: "60f1b2b3c4d5e6f7g8h9i0j1"
 *     responses:
 *       "201":
 *         description: Created
 */

/**
 * @swagger
 * /models/{id}:
 *   put:
 *     summary: Update a model
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Model ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               makeId:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         description: Model not found
 *   delete:
 *     summary: Delete a model (soft delete)
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Model ID
 *     responses:
 *       "204":
 *         description: No Content
 *       "404":
 *         description: Model not found
 */
