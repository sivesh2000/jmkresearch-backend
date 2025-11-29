const express = require('express');
const auth = require('../../middlewares/auth');
const ticketController = require('../../controllers/ticket.controller');

const router = express.Router();

// Authenticated routes
router.route('/').get(auth(), ticketController.getTickets).post(auth(), ticketController.createTicket);

router.route('/:ticketId').get(auth(), ticketController.getTicketById).patch(auth(), ticketController.updateTicket);

router.route('/:ticketId/attachment/:num').get(ticketController.downloadAttachment);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ticket:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         issueType:
 *           type: string
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         status:
 *           type: string
 *           enum: [open, in-progress, resolved, closed]
 *         userRef:
 *           type: string
 *         assignedTo:
 *           type: string
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /tickets/issue-types:
 *   get:
 *     summary: Get issue types
 *     description: Retrieve all available issue types for tickets
 *     tags: [Tickets]
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
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *       "500":
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get tickets
 *     description: Retrieve tickets with filtering and pagination
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in-progress, resolved, closed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: issueType
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
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   post:
 *     summary: Create ticket
 *     description: Create a new support ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - issueType
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               issueType:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
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
 *               $ref: '#/components/schemas/Ticket'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /tickets/{ticketId}:
 *   get:
 *     summary: Get ticket by ID
 *     description: Retrieve a specific ticket by its ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update ticket
 *     description: Update ticket status, priority, or assignment
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
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
 *               status:
 *                 type: string
 *                 enum: [open, in-progress, resolved, closed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               assignedTo:
 *                 type: string
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ticket'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /tickets/{ticketId}/attachment/{num}:
 *   get:
 *     summary: Download ticket attachment
 *     description: Download a specific attachment from a ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: ticketId
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
