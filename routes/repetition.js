const express = require('express');
const router = express.Router();
const repetitionController = require('../controllers/repetition');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * /repetitions/consulterEtatAbsencesRepetitions:
 *   get:
 *     summary: Consulter l'état des absences aux répétitions
 *     tags: [Répétitions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Succès - Récupération de l'état des absences
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               etatAbsences: [
 *                 {
 *                   repetitionId: "60cf7123b8c5e851b00cd6a1",
 *                   dateRepetition: "2024-01-01",
 *                   participantsAbsents: ["60cf7123b8c5e851b00cd3a1", "60cf7123b8c5e851b00cd3a2"],
 *                   pourcentageParticipantsAbsents: 40
 *                 },
 *                 // ... (other repetitions)
 *               ]
 *               message: "Succès - Récupération de l'état des absences"
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get('/consulterEtatAbsencesRepetitions', auth.authMiddleware, auth.isAdmin,repetitionController.consulterEtatAbsencesRepetitions);
/**
 * @swagger
 * components:
 *   schemas:
 *     Repetition:
 *       type: object
 *       properties:
 *         nom:
 *           type: string
 *           description: Le nom de la répétition
 *         date:
 *           type: array
 *           items:
 *             type: string
 *             format: date
 *           description: Liste des dates des répétitions
 *         heureDebut:
 *           type: string
 *           description: L'heure de début de la répétition
 *         heureFin:
 *           type: string
 *           description: L'heure de fin de la répétition
 *         lieu:
 *           type: string
 *           description: Le lieu de la répétition
 *         participant:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Liste des participants (ID des utilisateurs)
 *         nbr_repetition:
 *           type: number
 *           description: Le nombre de répétitions
 *         pourcentagesPupitres:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               pupitre:
 *                 type: string
 *                 format: uuid
 *                 description: ID du pupitre
 *               selectedChoristes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       format: uuid
 *                       description: ID de l'utilisateur
 *                     nom:
 *                       type: string
 *                       description: Le nom de l'utilisateur
 *                     prenom:
 *                       type: string
 *                       description: Le prénom de l'utilisateur
 *           description: Pourcentages et choristes par pupitre
 *         programme:
 *           type: string
 *           format: uuid
 *           description: ID du programme lié à la répétition
 *       example:
 *         nom: "Répétition d'orchestre"
 *         date: ["2023-02-01", "2023-02-15"]
 *         heureDebut: "18:00"
 *         heureFin: "21:00"
 *         lieu: "Salle de répétition"
 *         participant: ["12345", "67890"]
 *         nbr_repetition: 5
 *         pourcentagesPupitres:
 *           - pupitre: "abcde"
 *             selectedChoristes:
 *               - _id: "xyz123"
 *                 nom: "Doe"
 *                 prenom: "John"
 *           - pupitre: "fghij"
 *             selectedChoristes:
 *               - _id: "uvw456"
 *                 nom: "Smith"
 *                 prenom: "Alice"
 *         programme: "lmnop"
 *
 *     RepetitionUpdate:
 *       type: object
 *       properties:
 *         nom:
 *           type: string
 *           description: Le nom de la répétition
 *         date:
 *           type: array
 *           items:
 *             type: string
 *             format: date
 *           description: Liste des dates des répétitions
 *         heureDebut:
 *           type: string
 *           description: L'heure de début de la répétition
 *         heureFin:
 *           type: string
 *           description: L'heure de fin de la répétition
 *         lieu:
 *           type: string
 *           description: Le lieu de la répétition
 *         participant:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: Liste des participants (ID des utilisateurs)
 *         nbr_repetition:
 *           type: number
 *           description: Le nombre de répétitions
 *         pourcentagesPupitres:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               pupitre:
 *                 type: string
 *                 format: uuid
 *                 description: ID du pupitre
 *               selectedChoristes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       format: uuid
 *                       description: ID de l'utilisateur
 *                     nom:
 *                       type: string
 *                       description: Le nom de l'utilisateur
 *                     prenom:
 *                       type: string
 *                       description: Le prénom de l'utilisateur
 *           description: Pourcentages et choristes par pupitre
 *         programme:
 *           type: string
 *           format: uuid
 *           description: ID du programme lié à la répétition
 *       example:
 *         nom: "Répétition d'orchestre"
 *         date: ["2023-02-01", "2023-02-15"]
 *         heureDebut: "18:00"
 *         heureFin: "21:00"
 *         lieu: "Salle de répétition"
 *         participant: ["12345", "67890"]
 *         nbr_repetition: 5
 *         pourcentagesPupitres:
 *           - pupitre: "abcde"
 *             selectedChoristes:
 *               - _id: "xyz123"
 *                 nom: "Doe"
 *                 prenom: "John"
 *           - pupitre: "fghij"
 *             selectedChoristes:
 *               - _id: "uvw456"
 *                 nom: "Smith"
 *                 prenom: "Alice"
 *         programme: "lmnop"
 * 
 *   responses:
 *     RepetitionResponse:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Repetition'
 *       404:
 *         description: Répétition non trouvée
 *       500:
 *         description: Erreur interne du serveur
 */



/**
 * @swagger
 * /repetitions:
 *   get:
 *     summary: Récupérer toutes les répétitions
 *     tags: [Répétitions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Réussi - Récupération des répétitions.
 *         content:
 *           application/json:
 *             example:
 *               repetitions: 
 *                 - _id: "60cf7123b8c5e851b00cd6a1"
 *                   nom: "Répétition 1"
 *                   date: ["2024-01-01"]
 *                   heureDebut: "18:00"
 *                   heureFin: "21:00"
 *                   lieu: "Salle de répétition"
 *                   participant: ["60cf7123b8c5e851b00cd3a1", "60cf7123b8c5e851b00cd3a2"]
 *                   nbr_repetition: 3
 *                   pourcentagesPupitres: [...]
 *                   programme: "60cf7123b8c5e851b00cd5a1"
 *               message: "Réussi - Récupération des répétitions."
 */
router.get("/", auth.authMiddleware, auth.isAdmin, repetitionController.fetchRepetitions);
router.post("/", auth.authMiddleware, auth.isAdmin, repetitionController.addRepetition);
/**
 * @swagger
 * /repetitions/add:
 *   post:
 *     summary: Ajouter une nouvelle répétition sans QR code
 *     tags: [Répétitions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Repetition'
 *     responses:
 *       '200':
 *         description: Répétition ajoutée avec succès
 *         content:
 *           application/json:
 *             example:
 *               repetition:
 *                 nom: "Répétition d'orchestre"
 *                 date: ["2023-02-01", "2023-02-15"]
 *                 heureDebut: "18:00"
 *                 heureFin: "21:00"
 *                 lieu: "Salle de répétition"
 *                 participant: ["12345", "67890"]
 *                 nbr_repetition: 5
 *                 pourcentagesPupitres:
 *                   - pupitre: "abcde"
 *                     selectedChoristes:
 *                       - _id: "xyz123"
 *                         nom: "Doe"
 *                         prenom: "John"
 *                   - pupitre: "fghij"
 *                     selectedChoristes:
 *                       - _id: "uvw456"
 *                         nom: "Smith"
 *                         prenom: "Alice"
 *                 programme: "lmnop"
 *               message: "Répétition ajoutée avec succès"
 *       '400':
 *         description: Requête incorrecte
 *         content:
 *           application/json:
 *             example:
 *               error: "Description de l'erreur"
 *               message: "Échec d'ajout de la répétition"
 *       '500':
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             example:
 *               error: "Description de l'erreur interne"
 *               message: "Échec d'ajout de la répétition"
 */
//router.post("/add", auth.authMiddleware, auth.isAdmin, repetitionController.addRepetitionn);
router.post("/add", repetitionController.addRepetitionn);

/**
 * @swagger
 * /repetitions/{id}:
 *   get:
 *     summary: Récupérer une répétition par ID
 *     tags: [Répétitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la répétition à récupérer
 *     responses:
 *       '200':
 *         description: Réussi - Récupération de la répétition.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Repetition'
 *       '404':
 *         description: Répétition non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */

router.get("/:id", auth.authMiddleware, auth.isAdmin, repetitionController.getRepetitionById);
/**
 * @swagger
 * /repetitions/updaterepetition/{id}:
 *   put:
 *     summary: Mettre à jour une répétition par ID
 *     tags: [Répétitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la répétition à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Repetition'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/RepetitionResponse'
 *       '404':
 *         description: Répétition non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */

router.put("/updaterepetition/:id", auth.authMiddleware, auth.isAdmin, repetitionController.updateRepetition);
/**
 * @swagger
 * /repetitions/deleterepetition/{id}:
 *   delete:
 *     summary: Supprimer une répétition par ID
 *     tags: [Répétitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la répétition à supprimer
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/RepetitionResponse'
 *       '404':
 *         description: Répétition non trouvée
 *       '500':
 *         description: Erreur interne du serveur
 */

router.delete("/deleterepetition/:id", auth.authMiddleware, auth.isAdmin, repetitionController.deleteRepetition);
/**
 * @swagger
 * /repetitions/generatePupitreList:
 *   post:
 *     summary: Générer une liste de pupitres pour toutes les répétitions
 *     tags: [Répétitions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pourcentagePersonnes:
 *                 type: number
 *                 description: Pourcentage de choristes à inclure dans la liste (facultatif, par défaut 100)
 *     responses:
 *       '200':
 *         description: Liste de pupitres générée avec succès
 *         content:
 *           application/json:
 *             example: []  # If you don't want to provide an example, you can use an empty array or remove this line
 *       '400':
 *         description: Requête incorrecte
 *       '500':
 *         description: Erreur interne du serveur
 */
router.post('/generatePupitreList', auth.authMiddleware, auth.isAdmin, repetitionController.generatePupitreList);
router.post(
  "/sendnotif",
  repetitionController.testnotif
);

router.post('/:id/confirmerpresence', auth.authMiddleware, auth.isChoriste,repetitionController.confirmerpresenceRepetition);
/**
 * @swagger
 * /repetitions/{id}/confirmerpresence:
 *   post:
 *     summary: Confirmer la présence à une répétition
 *     tags: [Répétitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la répétition à laquelle confirmer la présence
 *     responses:
 *       '200':
 *         description: Succès - Confirmation de présence enregistrée
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Confirmation de présence enregistrée avec succès"
 *       '400':
 *         description: Requête incorrecte
 *         content:
 *           application/json:
 *             example:
 *               error: "Description de l'erreur"
 *               message: "Échec de confirmation de présence"
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '500':
 *         description: Erreur interne du serveur
 */
//router.post('/sendnotif', repetitionController.testnotif);


module.exports = router;
