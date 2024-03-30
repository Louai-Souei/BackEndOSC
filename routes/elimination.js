const express = require('express');
const router = express.Router();
const auth=require('../middlewares/auth')

const absenceElemination =require('../controllers/absenceElemination')
/**
 * @swagger
 * /discipline:
 *   post:
 *     summary: Apply discipline
 *     tags:
 *       - Discipline
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: User ID to apply discipline
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to discipline.
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/discipline',auth.authMiddleware,auth.isAdmin,absenceElemination.eliminationDiscipline)
/**
 * @swagger
 * /elimination/absences_excessive:
 *   post:
 *     summary: Eliminate for excessive absences
 *     tags:
 *       - Elimination
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: User ID and threshold for elimination
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user to check for excessive absences.
 *               seuil:
 *                 type: integer
 *                 description: The threshold for excessive absences.
 *             required:
 *               - userId
 *               - seuil
 *     responses:
 *       200:
 *         description: Successful elimination
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/absences_excessive',auth.authMiddleware,auth.isAdmin,absenceElemination.eliminationExcessiveAbsences)



module.exports = router;
