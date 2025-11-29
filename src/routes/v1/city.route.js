const express = require('express');
const auth = require('../../middlewares/auth');
const cityController = require('../../controllers/city.controller');

const router = express.Router();

router.route('/all').get(auth('getUsers'), cityController.getAllCitiesWithState);
router.route('/').get(auth(), cityController.getCities).post(auth('getUsers'), cityController.createCity);

router.route('/:id').put(auth('getUsers'), cityController.updateCity).delete(auth('getUsers'), cityController.deleteCity);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Cities
 *   description: City management
 */

/**
 * @swagger
 * /cities/all:
 *   get:
 *     summary: Get all cities with state information
 *     description: Retrieve all cities along with their associated state details
 *     tags: [Cities]
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
 * /cities:
 *   get:
 *     summary: Get cities with optional filtering
 *     tags: [Cities]
 *     parameters:
 *       - in: query
 *         name: stateId
 *         schema:
 *           type: string
 *         description: Filter cities by state ID
 *     responses:
 *       "200":
 *         description: OK
 *   post:
 *     summary: Create a city
 *     tags: [Cities]
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
 *     responses:
 *       "201":
 *         description: Created
 */

/**
 * @swagger
 * /cities/{id}:
 *   put:
 *     summary: Update a city
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: City ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               stateId:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         description: City not found
 *   delete:
 *     summary: Delete a city (soft delete)
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: City ID
 *     responses:
 *       "204":
 *         description: No Content
 *       "404":
 *         description: City not found
 */
