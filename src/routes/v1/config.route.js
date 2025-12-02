const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const configValidation = require('../../validations/config.validation');
const configController = require('../../controllers/config.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(configValidation.createConfig), configController.createConfig)
  .get(validate(configValidation.getConfigs), configController.getConfigs);

router.route('/key/:key').get(validate(configValidation.getConfigByKey), configController.getConfigByKey);

router
  .route('/category/:category')
  .get(validate(configValidation.getConfigsByCategory), configController.getConfigsByCategory);

router
  .route('/:configId')
  .get(validate(configValidation.getConfig), configController.getConfig)
  .patch(auth('manageUsers'), validate(configValidation.updateConfig), configController.updateConfig)
  .delete(auth('manageUsers'), validate(configValidation.deleteConfig), configController.deleteConfig);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Configs
 *   description: Configuration management
 */

/**
 * @swagger
 * /configs:
 *   post:
 *     summary: Create a config
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *               - category
 *             properties:
 *               key:
 *                 type: string
 *                 example: "date_format"
 *               value:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *                   - type: boolean
 *                   - type: object
 *                   - type: array
 *                 example: "DD/MM/YYYY"
 *               category:
 *                 type: string
 *                 example: "date_formats"
 *               dataType:
 *                 type: string
 *                 enum: [string, number, boolean, object, array]
 *     responses:
 *       "201":
 *         description: Created
 *   get:
 *     summary: Get all configs
 *     tags: [Configs]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /configs/key/{key}:
 *   get:
 *     summary: Get config by key
 *     tags: [Configs]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *       "404":
 *         description: Config not found
 */

/**
 * @swagger
 * /configs/category/{category}:
 *   get:
 *     summary: Get configs by category
 *     tags: [Configs]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 */

/**
 * @swagger
 * /configs/{configId}:
 *   get:
 *     summary: Get a config
 *     tags: [Configs]
 *     parameters:
 *       - in: path
 *         name: configId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *   patch:
 *     summary: Update a config
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: configId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *   delete:
 *     summary: Delete a config
 *     tags: [Configs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: configId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: No Content
 */
