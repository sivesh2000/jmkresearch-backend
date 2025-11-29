const express = require('express');
const auth = require('../../middlewares/auth');
const masterController = require('../../controllers/master.controller');

const router = express.Router();

router.route('/').get(auth(), masterController.getMasterData).put(auth('getUsers'), masterController.updateMasterData);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Master
 *   description: Master data management
 */

/**
 * @swagger
 * /master:
 *   get:
 *     summary: Get all master data
 *     description: Retrieve the complete master data document containing all reference data
 *     tags: [Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 manufacturingYears:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   example: [2020, 2021, 2022, 2023, 2024]
 *                 customerTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                 salutations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       gender:
 *                         type: string
 *                 nomineeRelations:
 *                   type: array
 *                   items:
 *                     type: object
 *                 occupation:
 *                   type: array
 *                   items:
 *                     type: object
 *                 documentTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                 insuranceTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *       "404":
 *         description: Master data not found
 *   put:
 *     summary: Update master data
 *     description: Update the complete master data document
 *     tags: [Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               manufacturingYears:
 *                 type: array
 *                 items:
 *                   type: integer
 *               customerTypes:
 *                 type: array
 *                 items:
 *                   type: object
 *               salutations:
 *                 type: array
 *                 items:
 *                   type: object
 *               nomineeRelations:
 *                 type: array
 *                 items:
 *                   type: object
 *               occupation:
 *                 type: array
 *                 items:
 *                   type: object
 *               documentTypes:
 *                 type: array
 *                 items:
 *                   type: object
 *               insuranceTypes:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       "200":
 *         description: OK
 */
