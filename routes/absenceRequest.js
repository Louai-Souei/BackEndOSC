const express = require("express");
const router = express.Router();
const absenceController = require("../controllers/absencerequest");
const absenceElemination = require("../controllers/absenceElemination");
const auth = require("../middlewares/auth");

/**
 * @swagger
 * /absence/createrequest:
 *   post:
 *     summary: Informer d'une absence à un événement (répétition ou concert)
 *     tags: [Absence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               eventType:
 *                 type: string
 *                 enum: [repetition, concert]
 *                 description: Type d'événement (répétition ou concert)
 *               eventDate:
 *                 type: string
 *                 format: date
 *
 *               reason:
 *                 type: string
 *                 description: Raison de l'absence
 *             required:
 *               - eventType
 *               - eventDate
 *               - reason
 *     responses:
 *       '201':
 *         description: Demande d'absence créée avec succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Demande d'absence créée avec succès"
 *       '400':
 *         description: Requête incorrecte
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Les données requises sont manquantes dans le corps de la requête"
 *       '500':
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Erreur interne du serveur"
 */
router.post("/createrequest/:userId", absenceController.informerAbsence);

/**
 * @swagger
 * /absence/getabsence/{userId}:
 *   get:
 *     summary: Récupérer les demandes d'absence pour un utilisateur spécifique
 *     tags: [Absence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur pour lequel récupérer les demandes d'absence
 *     responses:
 *       '200':
 *         description: Succès de la récupération des demandes d'absence
 *       '404':
 *         description: Utilisateur non trouvé
 *       '500':
 *         description: Erreur interne du serveur
 */

router.get(
  "/getabsence/:id",
  auth.authMiddleware,
  auth.isAdmin,
  absenceController.getAbsenceRequestsByUser
);

router.post("/", absenceController.createAbsence);

// router.get(
//   "/getparticipants/:repetitionId/:tessiture",
//   auth.authMiddleware,
//   auth.ischefpupitre,
//   absenceController.getChoristesByRepetitionAndPupitre
// );
router.get(
  "/getparticipants/:repetitionId/:tessiture",
  absenceController.getChoristesByRepetitionAndPupitre
);

/**
 * @swagger
 * /absence/getparticipants/{concertId}:
 *   get:
 *     summary: Get choristes' attendance details by concert and pupitre
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: concertId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the concert
 *     responses:
 *       '200':
 *         description: Success - List of choristes with their attendance details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Participants_par_pupitre:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         nom:
 *                           type: string
 *                         prenom:
 *                           type: string
 *                         Nb_presence:
 *                           type: integer
 *                         Nb_absence:
 *                           type: integer
 *               Taux_absence_par_pupitre:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *               example:
 *                 Participants_par_pupitre:
 *                   soprano:
 *                     - id: "12345"
 *                       nom: "Nom"
 *                       prenom: "Prenom"
 *                       Nb_presence: 2
 *                       Nb_absence: 1
 *                   alto:
 *                     - id: "67890"
 *                       nom: "Nom2"
 *                       prenom: "Prenom2"
 *                       Nb_presence: 1
 *                       Nb_absence: 0
 *                 Taux_absence_par_pupitre:
 *                   soprano: "25%"
 *                   alto: "0%"
 *       '500':
 *         description: Server error while fetching choristes' attendance details
 */

//router.get("/getparticipants/:concertId", auth.authMiddleware, auth.ischefpupitre, absenceController.getChoristesByConcertAndPupitre);
router.get(
  "/getparticipants/:concertId",
  absenceController.getChoristesByConcertAndPupitre
);

// router.delete(
//   "/getparticipants/:participantId",
//   absenceController.deleteParticipant
// );

/**
 * @swagger
 * /absence/getChoristedepasseseuil/{seuil}:
 *   get:
 *     summary: Get choristes depasse seuil
 *     parameters:
 *       - in: path
 *         name: seuil
 *         required: true
 *         description: The threshold value.
 *         schema:
 *           type: integer
 *     tags:
 *       - Choristes
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/getChoristedepasseseuil/:seuil",
  auth.authMiddleware,
  auth.isAdmin,
  absenceElemination.getChoristedepasseseuil
);
router.get(
  "/gestionAbsencesExcessives/:seuil",
  auth.authMiddleware,
  auth.isAdmin,
  absenceElemination.gestionAbsencesExcessives,
  absenceElemination.envoyermailnominé
);
/**
 * @swagger
 * /absence/elimine:
 *   get:
 *     summary: Get eliminated choristes
 *     tags:
 *       - Elimination
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/elimine",
  // auth.authMiddleware,
  // auth.isAdmin,
  absenceElemination.getChoristesÉliminés
);
/**
 * @swagger
 * /absence/:
 *   get:
 *     summary: Notify admin about eliminated choristes
 *     tags:
 *       - Elimination
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  auth.authMiddleware,
  auth.isAdmin,
  absenceElemination.notifieradminChoristeseliminés
);
/**
 * @swagger
 * /absence/nomines:
 *   get:
 *     summary: Get nominated choristes
 *     tags:
 *       - Elimination
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/nomines',
  // auth.authMiddleware, auth.isAdmin,
  absenceElemination.getChoristesNominés)



///DHIA
router.get("/countByUser", absenceController.getAbsenceCountByUser);
router.get(
  "/getAbsenceCountByUserconcert",
  absenceController.getAbsenceCountByUserconcert
);
router.get(
  "/getAbsenceCountByUserrep",
  absenceController.getAbsenceCountByUserrep
);
router.get(
  "/getAbsencePresenceCountByEvent",
  absenceController.getAbsencePresenceCountByEvent
);
router.get(
  "/getAbsenceCountByTessiture",
  absenceController.getAbsenceCountByTessiture
);
router.get("/getTotalAbsenceCount", absenceController.getTotalAbsenceCount);
router.get(
  "/getTotalAbsenceCountConcert",
  absenceController.getTotalAbsenceCountConcert
);
router.get(
  "/getAbsencePresenceByConcert",
  absenceController.getAbsencePresenceByConcert
);

module.exports = router;
