const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.get('/export', auth(), userController.exportUsers);
router
  .route('/')
  .post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(auth('getUsers'), userController.getUsers);

router
  .route('/type/:userType')
  .get(auth('getUsers'), validate(userValidation.getUsersByType), userController.getUsersByType);

router
  .route('/:userId')
  .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         tradeName:
 *           type: string
 *         oemRef:
 *           type: string
 *           description: Reference to Make (Vehicle Brand/OEM)
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         userType:
 *           type: string
 *           enum: [super_admin, main_dealer, dealer, user]
 *         mainDealerRef:
 *           type: string
 *         dealerRef:
 *           type: string
 *         gstDetails:
 *           type: string
 *         contactPerson:
 *           type: string
 *         contactPersonMobile:
 *           type: string
 *         pan:
 *           type: string
 *         adhaar:
 *           type: string
 *         address:
 *           type: string
 *         locationRef:
 *            type: string
 *            description: Reference to Location *
 *         location:
 *           type: string
 *         accountHolderName:
 *           type: string
 *         ifscCode:
 *           type: string
 *         bankName:
 *           type: string
 *         accountNumber:
 *           type: string
 *         document:
 *           type: string
 *         status:
 *           type: boolean
 *         isEmailVerified:
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
 * /users:
 *   post:
 *     summary: Create a user
 *     description: Only admins can create other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *               - userType
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               tradeName:
 *                 type: string
 *               oemRef:
 *                 type: string
 *                 description: Reference to Make (Vehicle Brand/OEM)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               userType:
 *                 type: string
 *                 enum: [super_admin, main_dealer, dealer, user]
 *               mainDealerRef:
 *                 type: string
 *                 description: Reference to main dealer (for dealers and users)
 *               dealerRef:
 *                 type: string
 *                 description: Reference to dealer (for users)
 *               gstDetails:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               contactPersonMobile:
 *                 type: string
 *               pan:
 *                 type: string
 *               adhaar:
 *                 type: string
 *                 description: Adhaar card number
 *               address:
 *                 type: string
 *               location:
 *                 type: string
 *               accountHolderName:
 *                 type: string
 *                 description: Bank account holder name
 *               ifscCode:
 *                 type: string
 *                 description: Bank IFSC code
 *               bankName:
 *                 type: string
 *                 description: Bank name
 *               accountNumber:
 *                 type: string
 *                 description: Bank account number
 *               document:
 *                 type: string
 *                 description: Document reference/path
 *             example:
 *               name: "John Doe"
 *               code: "JD001"
 *               tradeName: "John's Motors"
 *               email: "john@example.com"
 *               password: "password123"
 *               role: "user"
 *               userType: "main_dealer"
 *               gstDetails: "GST123456789"
 *               contactPerson: "Jane Doe"
 *               contactPersonMobile: "9876543210"
 *               pan: "ABCDE1234F"
 *               adhaar: "123456789012"
 *               address: "123 Main St"
 *               location: "Mumbai"
 *               accountHolderName: "John Doe"
 *               ifscCode: "HDFC0001234"
 *               bankName: "HDFC Bank"
 *               accountNumber: "1234567890"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all users
 *     description: Get users with hierarchical filtering based on user type.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: User name
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: User code
 *       - in: query
 *         name: tradeName
 *         schema:
 *           type: string
 *         description: Trade name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: User role
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *           enum: [super_admin, main_dealer, dealer, user]
 *         description: User type filter
 *       - in: query
 *         name: mainDealerRef
 *         schema:
 *           type: string
 *         description: Filter by main dealer reference
 *       - in: query
 *         name: dealerRef
 *         schema:
 *           type: string
 *         description: Filter by dealer reference
 *       - in: query
 *         name: oemRef
 *         schema:
 *           type: string
 *         description: Filter by OEM/Make reference
 *       - in: query
 *         name: status
 *         schema:
 *           type: boolean
 *         description: Filter by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
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
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /users/type/{userType}:
 *   get:
 *     summary: Get users by type
 *     description: Get users filtered by user type
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [super_admin, main_dealer, dealer, user]
 *         description: User type to filter by
 *       - in: query
 *         name: mainDealerRef
 *         schema:
 *           type: string
 *         description: Filter by main dealer reference
 *       - in: query
 *         name: dealerRef
 *         schema:
 *           type: string
 *         description: Filter by dealer reference
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
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
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     description: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a user
 *     description: Logged in users can only update their own information. Only admins can update other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
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
 *               tradeName:
 *                 type: string
 *               oemRef:
 *                 type: string
 *                 description: Reference to Make (Vehicle Brand/OEM)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               userType:
 *                 type: string
 *                 enum: [super_admin, main_dealer, dealer, user]
 *               mainDealerRef:
 *                 type: string
 *                 description: Reference to main dealer
 *               dealerRef:
 *                 type: string
 *                 description: Reference to dealer
 *               gstDetails:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               contactPersonMobile:
 *                 type: string
 *               pan:
 *                 type: string
 *               adhaar:
 *                 type: string
 *                 description: Adhaar card number
 *               address:
 *                 type: string
 *               location:
 *                 type: string
 *               accountHolderName:
 *                 type: string
 *                 description: Bank account holder name
 *               ifscCode:
 *                 type: string
 *                 description: Bank IFSC code
 *               bankName:
 *                 type: string
 *                 description: Bank name
 *               accountNumber:
 *                 type: string
 *                 description: Bank account number
 *               document:
 *                 type: string
 *                 description: Document reference/path
 *               status:
 *                 type: boolean
 *             example:
 *               name: "John Doe Updated"
 *               tradeName: "John's Updated Motors"
 *               contactPersonMobile: "9876543211"
 *               adhaar: "123456789012"
 *               accountHolderName: "John Doe"
 *               ifscCode: "HDFC0001234"
 *               bankName: "HDFC Bank"
 *               accountNumber: "1234567890"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a user
 *     description: Only admins can delete users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
