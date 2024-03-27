const express = require('express');
const router = express.Router();
const candidatController = require('../controllers/candidat');


router.post('/', candidatController.create);
//getAll
 router.get('/', candidatController.getAllCandidats);
//create without verif
 router.post('/', candidatController.createCandidat);


// get By Id
 router.get('/:id', candidatController.getCandidatById);

// Update
 router.put('/:id', candidatController.updateCandidatById);

// delete
 router.delete('/:id', candidatController.deleteCandidatById);


// create with verif

/**
 * @swagger
 * components:
 *   schemas:
 *     Verifmail:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email address of the candidate
 *         verified:
 *           type: boolean
 *           description: Whether the email is verified or not
 *       example:
 *         email: "wechcriaghofrane@gmail.com"
 *         prenom : "gh"
 *         nom : "wh"
 *         verified: false
 *
 *   responses:
 *     CandidatResponse:
 *       description: A sample response for Candidat operations
 *       content:
 *         application/json:
 *           example:
 *             message: "Candidat operation successful"
 *             data:
 *               candidatId: 123
 *     VerifyEmailResponse:
 *       description: A sample response for email verification
 *       content:
 *         application/json:
 *           example:
 *             message: "Email verification successful"
 *     AddEmailResponse:
 *       description: A sample response for adding candidate's email
 *       content:
 *         application/json:
 *           example:
 *             message: "Candidate's email added successfully"
 *             data:
 *               emailId: 456
 */

/**
 * @swagger
 * /candidats/{id}/verify/{token}:
 *   get:
 *     summary: Verify candidate's email
 *     tags: [Candidats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the candidate
 *         schema:
 *           type: string
 *       - in: path
 *         name: token
 *         required: true
 *         description: The verification token
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/VerifyEmailResponse'
 */
router.get("/:id/verify/:token/", candidatController.verifyEmailToken);

/**
 * @swagger
 * /candidats/addEmailCandidat:
 *   post:
 *     summary: Add candidate's email
 *     tags: [Candidats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Verifmail'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/AddEmailResponse'
 */
router.post('/addEmailCandidat', candidatController.addEmailCandidat);

/**
 * @swagger
 * /candidats/{id}:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the candidate verification record
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom_jeune_fille:
 *                 type: string
 *                 description: The maiden name of the candidate
 *               sexe:
 *                 type: string
 *                 description: The gender of the candidate
 *               telephone:
 *                 type: number
 *                 description: The phone number of the candidate
 *               taille_en_m:
 *                 type: number
 *                 description: The height of the candidate
 *               nationalite:
 *                 type: string
 *                 description: The nationality of the candidate
 *               cinpassport:
 *                 type: string
 *                 description: The ID or passport number of the candidate
 *               date_naissance:
 *                 type: string
 *                 format: date
 *                 description: The date of birth of the candidate
 *               situationProfessionnelle:
 *                 type: string
 *                 description: The professional situation of the candidate
 *               activite:
 *                 type: string
 *                 description: The current activity of the candidate
 *               parraine:
 *                 type: string
 *                 description: The name of the sponsor, if any
 *               choeuramateur:
 *                 type: string
 *                 description: The amateur choir the candidate belongs to
 *               connaissances:
 *                 type: string
 *                 description: The candidate's musical knowledge
 *             required:
 *               - nom_jeune_fille
 *               - sexe
 *               - telephone
 *               - taille_en_m
 *               - situationProfessionnelle
 *               - connaissances
 *     responses:
 *       '201':
 *         description: Candidate created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Le candidat a été créé avec succès"
 *               data:
 *                 _id: "candidatID"
 *                 nom: "Nom"
 *                 prenom: "Prénom"
 *                 email: "candidat@example.com"
 *                 nom_jeune_fille: "Nom de jeune fille"
 *                 sexe: "Genre"
 *                 telephone: "123456789"
 *                 taille_en_m: 1.75
 *                 nationalite: "Nationalité"
 *                 cinpassport: "ID/Passport"
 *                 date_naissance: "2000-01-01"
 *                 situationProfessionnelle: "Situation professionnelle"
 *                 activite: "Activité"
 *                 parraine: "Parrain"
 *                 choeuramateur: "Chœur amateur"
 *                 connaissances: "Connaissances musicales"
 */
router.post("/:id", candidatController.createCandidat);

module.exports = router;