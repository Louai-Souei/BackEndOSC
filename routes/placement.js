const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placement');
const auth = require('../middlewares/auth')
/**
 * @swagger
 * /placement/{id}:
 *   get:
 *     summary: Proposer un placement en fonction de la taille des participants pour un concert donné
 *     tags: [Placement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du concert pour lequel le placement est proposé
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 placementProposal:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       participant:
 *                         type: string
 *                         description: Nom du participant
 *                       position:
 *                         type: string
 *                         description: Position proposée pour le participant (par exemple, 'Avant' ou 'Arrière')
 */
router.get('/:id',auth.authMiddleware,auth.isAdmin, placementController.proposePlacementBySize);
/**
 * @swagger
 * /placement/update/{id}:
 *   put:
 *     summary: Mettre à jour la position d'un participant dans le placement d'un concert
 *     tags: [Placement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du concert pour lequel la position du participant est mise à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlacementUpdate'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message indiquant que la position du participant a été mise à jour avec succès
 */


router.put('/update/:id',auth.authMiddleware,auth.isAdmin, placementController.updateParticipantPosition);
/**
 * @swagger
 * /placement/delete/{id}:
 *   delete:
 *     summary: Annuler le placement pour un concert donné
 *     tags: [Placement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du concert pour lequel le placement est annulé
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message indiquant que le placement a été annulé avec succès
 */

router.delete('/delete/:id',auth.authMiddleware,auth.isAdmin, placementController.annulerPlacement);
module.exports = router;
