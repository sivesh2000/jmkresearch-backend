const express = require('express');
const auth = require('../../middlewares/auth');
const makeController = require('../../controllers/make.controller');

const router = express.Router();

router.route('/all').get(auth('getUsers'), makeController.getAllMakes);

router.route('/').get(auth(), makeController.getMakes).post(auth('getUsers'), makeController.createMake);

router.route('/:id').put(auth('getUsers'), makeController.updateMake).delete(auth('getUsers'), makeController.deleteMake);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Makes
 *   description: Vehicle make management
 */

/**
 * @swagger
 * /makes/all:
 *   get:
 *     summary: Get all vehicle makes
 *     description: Retrieve all active vehicle makes
 *     tags: [Makes]
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
 * /makes:
 *   get:
 *     summary: Get all makes
 *     tags: [Makes]
 *     responses:
 *       "200":
 *         description: OK
 *   post:
 *     summary: Create a make
 *     tags: [Makes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Honda"
 *     responses:
 *       "201":
 *         description: Created
 */

/**
 * @swagger
 * /makes/{id}:
 *   put:
 *     summary: Update a make
 *     tags: [Makes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Make ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         description: Make not found
 *   delete:
 *     summary: Delete a make (soft delete)
 *     tags: [Makes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Make ID
 *     responses:
 *       "204":
 *         description: No Content
 *       "404":
 *         description: Make not found
 */
