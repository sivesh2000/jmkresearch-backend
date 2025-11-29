const express = require('express');
const auth = require('../../middlewares/auth');
const stateController = require('../../controllers/state.controller');

const router = express.Router();

router.route('/all').get(auth('getUsers'), stateController.getAllStates);

router.route('/').get(auth(), stateController.getStates).post(auth('getUsers'), stateController.createState);

router
  .route('/:id')
  .put(auth('getUsers'), stateController.updateState)
  .delete(auth('getUsers'), stateController.deleteState);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: States
 *   description: State management
 */

/**
 * @swagger
 * /states/all:
 *   get:
 *     summary: Get all states
 *     description: Retrieve all active states with name and code
 *     tags: [States]
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
 *                     example: "Maharashtra"
 *                   code:
 *                     type: string
 *                     example: "MH"
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
 * /states:
 *   get:
 *     summary: Get all states
 *     tags: [States]
 *     responses:
 *       "200":
 *         description: OK
 *   post:
 *     summary: Create a state
 *     tags: [States]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Maharashtra"
 *               code:
 *                 type: string
 *                 example: "MH"
 *     responses:
 *       "201":
 *         description: Created
 */

/**
 * @swagger
 * /states/{id}:
 *   put:
 *     summary: Update a state
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: State ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         description: State not found
 *   delete:
 *     summary: Delete a state (soft delete)
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: State ID
 *     responses:
 *       "204":
 *         description: No Content
 *       "404":
 *         description: State not found
 */
