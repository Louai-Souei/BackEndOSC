const express = require("express")
const router = express.Router()
const tessiturecontroller= require ("../controllers/tessiture")
const auth = require("../middlewares/auth")
/**
 * @swagger
 * tags:
 *   name: Tessiture
 *   description: Opérations sur la tessiture des utilisateurs
 */

/**
 * @swagger
 * /tessiture/{userId}:
 *   put:
 *     summary: Mettre à jour la tessiture d'un utilisateur par ID
 *     tags: [Tessiture]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur pour mettre à jour la tessiture
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nouvelleTessiture:
 *                 type: string
 *                 description: La nouvelle tessiture de l'utilisateur
 *             example:
 *               nouvelleTessiture: Soprano
 *     responses:
 *       '200':
 *         description: La tessiture a été mise à jour avec succès
 *       '400':
 *         description: Requête incorrecte
 *       '401':
 *         description: Non autorisé
 *       '404':
 *         description: Utilisateur non trouvé
 *       '403':
 *         description: L'utilisateur n'a pas le rôle de choriste
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put("/:id", auth.authMiddleware, auth.isAdmin,tessiturecontroller.updateTessiture);

router.put("/notif/:id", tessiturecontroller.NotifupdateTessiture);
module.exports = router