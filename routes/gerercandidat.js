const express = require("express");
const router = express.Router();
const gerercontroller = require("../controllers/gerercandidat");
const Auth = require("../middlewares/auth");

/**
 * @swagger
 * /gerer/acceptation:
 *   post:
 *     summary: Envoie des e-mails d'acceptation aux candidats retenus.
 *     description: Envoie des e-mails d'acceptation aux candidats retenus avec un lien de confirmation.
 *     tags:
 *       - Candidats
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Les e-mails ont été envoyés avec succès.
 *         content:
 *           application/json:
 *             example:
 *               message: "Les e-mails et tokens ont été envoyés à X candidats sans token existant."
 *       500:
 *         description: Erreur lors de l'enregistrement des candidats retenus.
 *         content:
 *           application/json:
 *             example:
 *               message: "Erreur lors de l'enregistrement des candidats retenus."
 */
router.post("/acceptation", gerercontroller.envoyerEmailAcceptation);

/**
 * @swagger
 * /gerer/mailconfirmation:
 *   post:
 *     summary: Envoie un e-mail de confirmation d'inscription.
 *     description: Envoie un e-mail de confirmation d'inscription aux candidats confirmés avec un lien de confirmation.
 *     tags:
 *       - Candidats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email de confirmation envoyé avec succès.
 *         content:
 *           application/json:
 *             example:
 *               message: "Email de confirmation envoyé avec succès"
 *       500:
 *         description: Erreur lors de l'envoi de l'e-mail de confirmation.
 *         content:
 *           application/json:
 *             example:
 *               error: "Erreur lors de l'envoi de l'e-mail de confirmation"
 */
router.post(
  "/mailconfirmation",

  gerercontroller.envoyerEmailConfirmation
);
router.get(
  "/confirmation-presence/:id/:token",
  gerercontroller.confirmAcceptanceByEmail
);

/**
 * @swagger
 * paths:
 *   /gerer/liste:
 *     post:
 *       summary: Récupérer la liste des candidats pour une saison.
 *       tags:
 *         - Candidats
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         description: Saison (nombre) pour laquelle récupérer la liste des candidats.
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 saison:
 *                   type: number
 *       responses:
 *         '200':
 *           description: La liste des candidats a été récupérée avec succès.
 *         '403':
 *           description: Accès non autorisé à cette opération.
 *         '500':
 *           description: Erreur lors de la récupération de la liste des candidats.
 */
router.post(
  "/liste",
  Auth.authMiddleware,
  Auth.isAdminOrManager,
  gerercontroller.getListeCandidats
);

/**
 * @swagger
 * /gerer/confirmation-presence:
 *   get:
 *     summary: Confirme la présence d'un candidat.
 *     description: Confirme la présence d'un candidat en utilisant un token d'identification.
 *     tags:
 *       - Candidats
 *     security :
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         description: Token d'identification
 *         required: true
 *         type: string
 *       - in: query
 *         name: decision
 *         description: Décision (confirm, deny, etc.)
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Confirmation réussie.
 *         content:
 *           text/plain:
 *             example: "Confirmation réussie !"
 *       404:
 *         description: Token invalide ou expiré.
 *         content:
 *           text/plain:
 *             example: "Token invalide ou expiré."
 *       500:
 *         description: Erreur lors de la confirmation.
 *         content:
 *           text/plain:
 *             example: "Erreur lors de la confirmation."
 */

/**
 * @swagger
 * /gerer/engagement:
 *   get:
 *     summary: Confirme l'engagement d'un candidat.
 *     description: Confirme l'engagement d'un candidat en utilisant un token d'identification.
 *     tags:
 *       - Candidats
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: Token d'identification du candidat.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Engagement confirmé avec succès.
 *       404:
 *         description: Token invalide ou expiré.
 *       500:
 *         description: Erreur lors de la confirmation de l'engagement.
 */

router.post(
  "/engagement/:id",

  gerercontroller.confirmerEngagement
);

/**
 * @swagger
 * /gerer/listeretenu:
 *   get:
 *     summary: Récupère les candidats retenus par pupitre.
 *     description: Récupère la liste des candidats retenus, organisés par pupitre (Soprano, Alto, Ténor, Basse).
 *     tags:
 *       - Candidats
 *     security :
 *         - bearerAuth: []
 *     responses:
 *       200:
 *         description: La liste des candidats retenus organisés par pupitre.
 *         content:
 *           application/json:
 *             example:
 *               Soprano:
 *                 - { id: '123', nom: 'Nom', prenom: 'Prenom', email: 'nom@example.com' }
 *               Alto:
 *                 - { id: '456', nom: 'Nom', prenom: 'Prenom', email: 'nom2@example.com' }
 *               Ténor: []
 *               Basse:
 *                 - { id: '789', nom: 'Nom', prenom: 'Prenom', email: 'nom3@example.com' }
 *       500:
 *         description: Erreur lors de la récupération des candidats retenus par pupitre.
 */

router.get(
  "/listeretenu",
  Auth.authMiddleware,
  Auth.isAdminOrManager,
  gerercontroller.getCandidatsRetenusParPupitre
);

/**
 * @swagger
 * /gerer/besoin:
 *   post:
 *     summary: Récupère les candidats par pupitre en fonction des besoins spécifiés.
 *     description: Récupère la liste des candidats par pupitre, organisés en catégories (retenu, en attente, refuse),
 *                  en fonction des besoins spécifiés pour chaque pupitre.
 *     tags:
 *       - Candidats
 *     security :
 *         - bearerAuth: []
 *     requestBody:
 *       description: Besoins spécifiés pour chaque pupitre.
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             Soprano: 2
 *             Alto: 3
 *             Ténor: 1
 *             Basse: 2
 *     responses:
 *       200:
 *         description: La liste des candidats par pupitre en fonction des besoins spécifiés.
 *         content:
 *           application/json:
 *             example:
 *               Soprano:
 *                 retenu:
 *                   - { id: '123', nom: 'Hend', prenom: 'legleg', email: 'hendlegleg1@gmail.com' }
 *                   - { id: '456', nom: 'Nom2', prenom: 'Prenom2', email: 'nom2@example.com' }
 *                 'en attente': []
 *                 refuse:
 *                   - { id: '789', nom: 'Nom3', prenom: 'Prenom3', email: 'nom3@example.com' }
 *               Alto:
 *                 retenu: []
 *                 'en attente':
 *                   - { id: '101', nom: 'Nom4', prenom: 'Prenom4', email: 'nom4@example.com' }
 *                   - { id: '202', nom: 'Nom5', prenom: 'Prenom5', email: 'nom5@example.com' }
 *                 refuse:
 *                   - { id: '303', nom: 'Nom6', prenom: 'Prenom6', email: 'nom6@example.com' }
 *               Ténor:
 *                 retenu: []
 *                 'en attente': []
 *                 refuse:
 *                   - { id: '404', nom: 'Nom7', prenom: 'Prenom7', email: 'nom7@example.com' }
 *               Basse:
 *                 retenu:
 *                   - { id: '505', nom: 'Nom8', prenom: 'Prenom8', email: 'nom8@example.com' }
 *                   - { id: '606', nom: 'Nom9', prenom: 'Prenom9', email: 'nom9@example.com' }
 *                 'en attente': []
 *                 refuse: []
 *       400:
 *         description: Besoin des pupitres non spécifié dans la requête.
 *         content:
 *           application/json:
 *             example:
 *               error: 'Besoin des pupitres non spécifié dans la requête'
 *       500:
 *         description: Erreur lors de la récupération des candidats par pupitre.
 *         content:
 *           application/json:
 *             example:
 *               error: 'Erreur lors de la récupération des candidats par pupitre'
 */

router.post(
  "/besoin",
  Auth.authMiddleware,
  Auth.isAdminOrManager,
  gerercontroller.getListeCandidatsParPupitre
);

module.exports = router;
