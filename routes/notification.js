const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
//const auth = require("../Middleware/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         messages:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Message 1", "Message 2"]
 *         user:
 *           type: string
 *           description: ID de l'utilisateur associé à la notification
 *           example: "5fecbc5901c4ab001f4c9c76"
 *       required:
 *         - messages
 *         - user
 *
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Ajouter une nouvelle notification
 *     description: Ajoute une nouvelle notification pour un utilisateur spécifié.
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             sujet: "Nouvelle notification"
 *             messages: ["Message 1", "Message 2"]
 *             user: "5fecbc5901c4ab001f4c9c76"
 *     responses:
 *       201:
 *         description: Notification ajoutée avec succès.
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/NotificationResponse'
 *       400:
 *         description: Requête invalide ou manquante.
 *       500:
 *         description: Erreur serveur.
 *
 * /notifications/{userId}:
 *   get:
 *     summary: Récupérer les notifications d'un utilisateur
 *     description: Renvoie la liste des notifications pour un utilisateur spécifié.
 *     tags: [Notifications]

 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès, renvoie la liste des notifications.
 *         content:
 *           application/json:
 *             example:
 *               - _id: "5fecbc5901c4ab001f4c9c77"
 *                 sujet: "Nouvelle notification"
 *                 messages: ["Message 1", "Message 2"]
 *                 user: "5fecbc5901c4ab001f4c9c76"
 *               - _id: "5fecbc5901c4ab001f4c9c78"
 *                 sujet: "Notification importante"
 *                 messages: ["Message 3"]
 *                 user: "5fecbc5901c4ab001f4c9c76"
 *       404:
 *         description: Aucune notification trouvée pour l'utilisateur.
 *       500:
 *         description: Erreur serveur.
 * 
 *   delete:
 *     summary: Supprimer les notifications d'un utilisateur
 *     description: Supprime toutes les notifications d'un utilisateur spécifié.
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Notifications supprimées avec succès.
 *       404:
 *         description: Aucune notification trouvée pour l'utilisateur.
 *       500:
 *         description: Erreur serveur.
 *
 * tags:
 *   name: Notifications
 *   description: API des notifications
 */

router.post("/AddNotification", notificationController.addNotification);

router.get(
  "/notifications/:userId",
  notificationController.getNotificationByUserId
);

router.delete(
  "/notifications/:userId",
  notificationController.deleteNotificationByUserId
);

module.exports = router;