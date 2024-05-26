const express = require("express");
const router = express.Router();
const Auth = require("../middlewares/auth");
const CongeController = require("../controllers/conge");
const auth = require("../middlewares/auth");

/**
 * @swagger
 * /conge/declareLeave:
 *   post:
 *     summary: Enregistrer une demande de congé
 *     tags: [Congés]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: "Date de début du congé (format : YYYY-MM-DD)"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: "Date de fin du congé (format : YYYY-MM-DD)"
 *             example:
 *               startDate: "2023-01-01"
 *               endDate: "2023-01-10"
 *     responses:
 *       '200':
 *         description: Demande de congé enregistrée avec succès
 *       '400':
 *         description: Requête incorrecte
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */
router.post("/declareLeave/:userId", CongeController.declareLeave);
router.get(
  "/choristesanotifier",
  Auth.authMiddleware,
  Auth.isAdmin,
  CongeController.LeaveNotifications
);

/**
 * @swagger
 * /conge/notifmodifyLeaveStatus:
 *   post:
 *     summary: Modify leave status for a chorister
 *     tags:
 *       - Leave
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the chorister
 *                 example: "123"
 *               approved:
 *                 type: boolean
 *                 description: Whether the leave request is approved
 *                 example: true
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               message: Statut de congé modifié avec succès.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: Utilisateur non trouvé
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

router.post("/notifmodifyLeaveStatus", CongeController.notifmodifyLeaveStatus);

module.exports = router;
