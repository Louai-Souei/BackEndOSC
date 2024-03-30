const express = require('express');
const router = express.Router()
const uploadFiles = require('../middlewares/uploadFiles');
const programController = require('../controllers/programme');


/**
 * @swagger
 * components:
 *   schemas:
 *     Oeuvre:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Identifiant auto-généré de l'oeuvre
 *         titre:
 *           type: string
 *           description: Titre de l'oeuvre
 *         compositeurs:
 *           type: string
 *           description: Compositeur(s) de l'oeuvre
 *         arrangeurs:
 *           type: string
 *           description: Arrangeur(s) de l'oeuvre
 *         annee:
 *           type: string
 *           description: Année de l'oeuvre
 *         genre:
 *           type: string
 *           description: Genre de l'oeuvre
 *         paroles:
 *           type: string
 *           description: Paroles de l'oeuvre
 *         partition:
 *           type: string
 *           description: Partition de l'oeuvre
 *         requiresChoir:
 *           type: boolean
 *           description: Indique si l'oeuvre nécessite un chœur
 *           example: true
 * 
 *     Programme:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Identifiant auto-généré du programme
 *         nom_programme:
 *           type: string
 *           description: Nom du programme
 *         oeuvres:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Oeuvre'
 * 
 *   responses:
 *     ProgrammeResponse:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Programme'
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Programme non trouvé
 *       500:
 *         description: Erreur interne du serveur
 */
/**
 * @swagger
 * /programme/:
 *   post:
 *     summary: Add a new program
 *     tags:
 *       - Program
 *     requestBody:
 *       description: Program details to be added
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom_programme:
 *                 type: string
 *                 description: The name of the program
 *               oeuvres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of Oeuvres IDs associated with the program
 *             required:
 *               - nom_programme
 *               - oeuvres
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */

router.post('/', programController.addProgram);
/**
 * @swagger
 * /programme/byfile:
 *   post:
 *     summary: Créer un nouveau programme ou ajouter depuis un fichier Excel
 *     tags: [Programmes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Succès
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur interne du serveur
 */
router.post('/byfile', uploadFiles.uploadFile , programController.addProgramFromExcel);


module.exports = router;