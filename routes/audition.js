const express = require("express");
const router = express.Router();
const auditionController = require("../controllers/audition");
const EvenementAudition = require("../models/evenementaudition");
const auth = require("../middlewares/auth");

router.post("/", auditionController.createAudition);
router.get("/", auditionController.getAudition);
router.get("/:id", auditionController.getAuditionById);

router.patch("/:id", auditionController.updateAudition);
router.delete("/:id", auditionController.deleteAudition);
router.get("/auditions/enattente", auditionController.getAuditionEnAttente);
router.post(
  "/genererplanabsence",
  auditionController.genererPlanificationabsence
);
// Route pour générer le planning d'auditions

/**
 * @swagger
 * components:
 *   schemas:
 *     EvenementAudition:
 *       type: object
 *       properties:
 *         Date_debut_Audition:
 *           type: string
 *           format: date
 *           description: The start date of the audition event
 *         nombre_séance:
 *           type: integer
 *           description: The number of audition sessions
 *         dureeAudition:
 *           type: integer
 *           description: The duration of each audition session in minutes
 *         Date_fin_Audition:
 *           type: string
 *           format: date
 *           description: The end date of the audition event
 *         lienFormulaire:
 *           type: string
 *           description: The link to the audition form
 *       example:
 *         Date_debut_Audition: '2023-01-01'
 *         nombre_séance: 3
 *         dureeAudition: 60
 *         Date_fin_Audition: '2023-01-15'
 *         lienFormulaire: 'https://example.com/audition-form'
 *
 *   responses:
 *     EvenementAudition201:
 *       description: Audition event launched successfully
 *       content:
 *         application/json:
 *           example:
 *             message: "EvenementAudition created successfully and emails sent to candidates."
 *             data:
 *               eventId: 123
 *     EvenementAudition400:
 *       description: Bad Request
 *       content:
 *         application/json:
 *           example:
 *             error: "Please provide all required fields."
 *     EvenementAudition401:
 *       description: Unauthorized
 *       content:
 *         application/json:
 *           example:
 *             error: "Unauthorized access"
 *     EvenementAudition404:
 *       description: No Candidates Found
 *       content:
 *         application/json:
 *           example:
 *             error: "No candidates found in the database."
 *     EvenementAudition500:
 *       description: Internal Server Error
 *       content:
 *         application/json:
 *           example:
 *             error: "Internal Server Error"
 *
 * tags:
 *   name: Auditions
 *   description: API for managing audition events
 */

/**
 * @swagger
 * /auditions/lancerEvenementAudition:
 *   post:
 *     summary: Launch an audition event
 *     tags: [Auditions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EvenementAudition'
 *     responses:
 *       '201':
 *         $ref: '#/components/responses/EvenementAudition201'
 *       '400':
 *         $ref: '#/components/responses/EvenementAudition400'
 *       '401':
 *         $ref: '#/components/responses/EvenementAudition401'
 *       '404':
 *         $ref: '#/components/responses/EvenementAudition404'
 *       '500':
 *         $ref: '#/components/responses/EvenementAudition500'
 */
//router.post('/lancerEvenementAudition', auth.authMiddleware, auth.isAdmin, auditionController.lancerEvenementAudition);

router.post(
  "/lancerEvenementAudition",
  auditionController.lancerEvenementAudition
);

router.get(
  "/Check/EvenementAudition",
  auditionController.CheckEvenementAudition
);
router.get("/Check/NextEvenementAudition", auditionController.checkNextEvent);

router.patch(
  "/update/EvenementAudition/:eventId",
  auditionController.updateEvenementAudition
);

router.get("/get/EvenementAudition", auditionController.getEvenementAudition);

router.post(
  "/generer-planning/:evenementAuditionId",

  auditionController.genererPlanification
);

/**
 * @swagger
 * /auditions/generer-planning:
 *   post:
 *     summary: Generate audition schedule
 *     tags: [Auditions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tessiture:
 *                 type: string
 *                 description: The tessiture field for the audition
 *               extraitChante:
 *                 type: string
 *                 description: The extraitChante field for the audition
 *             required:
 *               - tessiture
 *               - extraitChante
 *
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Schedule generated successfully
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */

router.post(
  "/genererplanabsence",
  auditionController.genererPlanificationabsence
);

/**
 * @swagger
 * /auditions/genererplanabsence:
 *   post:
 *     summary: Generate absence schedule for auditions
 *     tags: [Auditions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define your request body properties here
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Absence schedule generated successfully
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */

module.exports = router;
