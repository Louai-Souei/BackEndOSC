const express = require("express");
const router = express.Router();
const statusHistoryController = require("../controllers/statusHistory");
const userController = require("../controllers/utilisateur");

const eliminationController = require("../controllers/absenceElemination");
const Auth = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API operations related to users
 */

/**
 * @swagger
 * /users/ajouterStatus:
 *   post:
 *     summary: Add a status change for a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusChange'
 *     responses:
 *       201:
 *         description: Status change added successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get status history for a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statusHistory:
 *                 - _id: "60a1f5f66b5f4b001d3478c5"
 *                   utilisateur: "60a1f5f66b5f4b001d3478c5"
 *                   ancienStatus: "choriste"
 *                   nouveauStatus: "choriste junior"
 *                   nbsaison: 3
 *                   date: "2022-05-16T12:30:00.000Z"
 *                 - _id: "60a1f5f66b5f4b001d3478c6"
 *                   utilisateur: "60a1f5f66b5f4b001d3478c5"
 *                   ancienStatus: "inactive"
 *                   nouveauStatus: "active"
 *                   nbsaison: 4
 *                   date: "2022-06-20T14:45:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/{id}/profile:
 *   get:
 *     summary: Get the profile of a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               user:
 *                 _id: "60a1f5f66b5f4b001d3478c5"
 *                 nom: "John"
 *                 prenom: "Doe"
 *                 email: "john.doe@example.com"
 *                 role: "choriste"
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StatusChange:
 *       type: object
 *       properties:
 *         utilisateur:
 *           type: string
 *         ancienStatus:
 *           type: string
 *         nouveauStatus:
 *           type: string
 *         nbsaison:
 *           type: number
 *         date:
 *           type: string
 *           format: date-time
 *       required:
 *         - utilisateur
 *         - ancienStatus
 *         - nouveauStatus
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *       required:
 *         - nom
 *         - prenom
 *         - email
 *         - password
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StatusHistory:
 *       type: object
 *       properties:
 *       required:
 *         - utilisateur
 *         - ancienStatus
 *         - nouveauStatus
 *         - date
 */

/**
 * @swagger
 * /users/statistics:
 *   get:
 *     summary: Generate user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statistics:
 *                 totalUsers: 100
 *                 activeUsers: 80
 *                 inactiveUsers: 20
 *                 choristeUsers: 60
 *                 adminUsers: 10
 *               message: "User statistics generated successfully"
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '403':
 *         description: Forbidden - Insufficient permissions
 *       '500':
 *         description: Internal server error
 */

router.get("/:userId/activity", userController.getUserActivityHistory);
router.get("/statistics", userController.generateStatistics);
router.post("/ajouterStatus", statusHistoryController.addStatusChange);
router.get("/:id", statusHistoryController.getStatusHistoryForUser);
router.get(
  "/historiqueActiviteUser/:choristeId",
  userController.getChoristeActivityHistory
);
router.get("/:id/profile", userController.getProfile);

router.get("/", userController.getListeChoristes);

router.patch("/:id/role", userController.updateUserRole);
router.get(
  "/liste_choristes_non_elim",
  userController.getListeChoristesNonElim
);

router.get(
  "/statistics",
  Auth.authMiddleware,
  Auth.isAdmin,
  userController.generateStatistics
);
router.post(
  "/ajouterStatus",
  Auth.authMiddleware,
  Auth.isAdminOrChoriste,
  statusHistoryController.addStatusChange
);
//router.get('/:id', Auth.authMiddleware,Auth.isAdmin , statusHistoryController.getStatusHistoryForUser);
router.get("/:id", statusHistoryController.getStatusHistoryForUser);
router.get(
  "/:id/profile",
  Auth.authMiddleware,
  Auth.isAdminOrChoriste,
  userController.getProfile
);

module.exports = router;
