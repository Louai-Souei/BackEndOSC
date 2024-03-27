const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         nom:
 *           type: string
 *         prenom:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *       required:
 *         - nom
 *         - prenom
 *         - email
 *         - password
 *         - role
 *
 *   responses:
 *     AuthSuccessResponse:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *
 *     AuthErrorResponse:
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message for authentication failure
 */

/**
 * @swagger
 * paths:
 *   /auth/signup:
 *     post:
 *       summary: Create a new user (Signup)
 *       tags:
 *         - Authentication
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       responses:
 *         201:
 *           description: User created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/User'
 *         500:
 *           description: Internal server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 *   /auth/login:
 *     post:
 *       summary: Authenticate and get a JWT token (Login)
 *       tags:
 *         - Authentication
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *               required:
 *                 - email
 *                 - password
 *       responses:
 *         200:
 *           $ref: '#/components/responses/AuthSuccessResponse'
 *         401:
 *           $ref: '#/components/responses/AuthErrorResponse'
 */

router.post("/signup", authController.signup);
router.post("/login", authController.login);
module.exports = router;
