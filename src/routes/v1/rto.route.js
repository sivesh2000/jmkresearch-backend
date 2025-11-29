const express = require('express');
const auth = require('../../middlewares/auth');
const rtoController = require('../../controllers/rto.controller');

const router = express.Router();

router.route('/all').get(auth('getUsers'), rtoController.getAllRTO);
router.route('/').get(auth(), rtoController.getRTOs).post(auth('getUsers'), rtoController.createRTO);

router.route('/:id').put(auth('getUsers'), rtoController.updateRTO).delete(auth('getUsers'), rtoController.deleteRTO);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: RTO
 *   description: RTO management
 */

/**
 * @swagger
 * /rto/all:
 *   get:
 *     summary: Get all RTO offices
 *     description: Retrieve all active RTO offices with basic details
 *     tags: [RTO]
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
 *                   rtoNo:
 *                     type: string
 *                     example: "MH20"
 *                   rtoName:
 *                     type: string
 *                     example: "AURANGABAD"
 *                   cityCode:
 *                     type: string
 *                     example: "ABD"
 *                   cityName:
 *                     type: string
 *                     example: "AURANGABAD"
 *                   isActive:
 *                     type: boolean
 *                   effectiveStartDate:
 *                     type: string
 *                     format: date-time
 *                   effectiveEndDate:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 */

/**
 * @swagger
 * /rto:
 *   get:
 *     summary: Get RTOs with filtering
 *     tags: [RTO]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by RTO number, name, or city name
 *       - in: query
 *         name: cityCode
 *         schema:
 *           type: string
 *         description: Filter by city code
 *     responses:
 *       "200":
 *         description: OK
 *   post:
 *     summary: Create an RTO
 *     tags: [RTO]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rtoNo
 *               - rtoName
 *               - cityCode
 *               - cityName
 *             properties:
 *               rtoNo:
 *                 type: string
 *                 example: "MH20"
 *               rtoName:
 *                 type: string
 *                 example: "AURANGABAD"
 *               cityCode:
 *                 type: string
 *                 example: "ABD"
 *               cityName:
 *                 type: string
 *                 example: "AURANGABAD"
 *               effectiveStartDate:
 *                 type: string
 *                 format: date-time
 *               effectiveEndDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       "201":
 *         description: Created
 */

/**
 * @swagger
 * /rto/{id}:
 *   put:
 *     summary: Update an RTO
 *     tags: [RTO]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RTO ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rtoNo:
 *                 type: string
 *               rtoName:
 *                 type: string
 *               cityCode:
 *                 type: string
 *               cityName:
 *                 type: string
 *               effectiveStartDate:
 *                 type: string
 *                 format: date-time
 *               effectiveEndDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         description: RTO not found
 *   delete:
 *     summary: Delete an RTO (soft delete)
 *     tags: [RTO]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RTO ID
 *     responses:
 *       "204":
 *         description: No Content
 *       "404":
 *         description: RTO not found
 */
