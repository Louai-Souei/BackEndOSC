const express = require('express');
const router = express.Router();
const filtragecandidatController = require('../controllers/filtragecandidat');
const Auth = require("../middlewares/auth")


/**
 * @swagger
 * tags:
 *   name: Candidates
 *   description: Operations related to candidates
 * 
 * /filtragecandidats/filter:
 *   get:
 *     summary: Get candidates based on filtering criteria
 *     description: Returns a list of candidates based on specified filters.
 *     tags:
 *       - Candidates
 *     parameters:
 *       - in: query
 *         name: sexe
 *         schema:
 *           type: string
 *         description: Filter candidates by gender
 *       - in: query
 *         name: nom
 *         schema:
 *           type: string
 *         description: Filter candidates by name
 *       - in: query
 *         name: prenom
 *         schema:
 *           type: string
 *         description: Filter candidates by surname
 *       - in: query
 *         name: telephone
 *         schema:
 *           type: string
 *         description: Filter candidates by phone number
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter candidates by email
 *       - in: query
 *         name: cinpassport
 *         schema:
 *           type: string
 *         description: Filter candidates by ID or passport number
 *       - in: query
 *         name: nationalite
 *         schema:
 *           type: string
 *         description: Filter candidates by nationality
 *       - in: query
 *         name: situationProfessionnelle
 *         schema:
 *           type: string
 *         description: Filter candidates by professional situation
 *       - in: query
 *         name: date_naissance
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter candidates by date of birth
 *       
 *     responses:
 *       200:
 *         description: Successful response
 *       500:
 *         description: Internal server error
 */
router.get('/filter',Auth.authMiddleware,Auth.isAdmin,filtragecandidatController.getCandidats); 


module.exports = router;