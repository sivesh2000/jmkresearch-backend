const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { ticketResponseValidation } = require('../../validations');
const { ticketResponseController } = require('../../controllers');

const router = express.Router();

router.route('/').post(auth(), validate(ticketResponseValidation.addResponse), ticketResponseController.addResponse);

router.route('/').get(auth(), ticketResponseController.getAllResponses);

router
  .route('/ticket/:ticketId')
  .get(auth(), validate(ticketResponseValidation.getResponses), ticketResponseController.getResponsesByTicket);

router.route('/:responseId/attachment/:num').get(ticketResponseController.downloadResponseAttachment);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Ticket Responses
 *   description: Ticket response management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TicketResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         ticketRef:
 *           type: string
 *         userRef:
 *           type: string
 *         message:
 *           type: string
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *         isInternal:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /ticket-responses:
 *   post:
 *     summary: Add response to ticket
 *     description: Add a new response to an existing ticket
 *     tags: [Ticket Responses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - ticketRef
 *               - message
 *             properties:
 *               ticketRef:
 *                 type: string
 *               message:
 *                 type: string
 *               isInternal:
 *                 type: boolean
 *                 default: false
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TicketResponse'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: Get all responses
 *     description: Retrieve all ticket responses with pagination
 *     tags: [Ticket Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TicketResponse'
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /ticket-responses/ticket/{ticketId}:
 *   get:
 *     summary: Get responses by ticket
 *     description: Retrieve all responses for a specific ticket
 *     tags: [Ticket Responses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TicketResponse'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /ticket-responses/{responseId}/attachment/{num}:
 *   get:
 *     summary: Download response attachment
 *     description: Download a specific attachment from a ticket response
 *     tags: [Ticket Responses]
 *     parameters:
 *       - in: path
 *         name: responseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: num
 *         required: true
 *         schema:
 *           type: integer
 *         description: Attachment number (0-based index)
 *     responses:
 *       "200":
 *         description: File download
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
