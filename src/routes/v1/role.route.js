const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const roleValidation = require('../../validations/role.validation');
const roleController = require('../../controllers/role.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageUsers'), validate(roleValidation.createRole), roleController.createRole)
  .get(auth('getUsers'), validate(roleValidation.getRoles), roleController.getRoles);

router
  .route('/:roleId')
  .get(auth('getUsers'), validate(roleValidation.getRole), roleController.getRole)
  .patch(auth('manageUsers'), validate(roleValidation.updateRole), roleController.updateRole)
  .delete(auth('manageUsers'), validate(roleValidation.deleteRole), roleController.deleteRole);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management and retrieval
 */
