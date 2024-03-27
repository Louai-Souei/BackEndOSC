const express = require('express');
const router = express.Router();
const UserController = require('../controllers/intervenants');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         nom:
 *           type: string
 *         prenom:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *       required:
 *         - nom
 *         - prenom
 *         - email
 *         - password
 *         - role
 */
/**
 * @swagger
 * /intervenant:
 *   post:
 *     summary: Créer un nouvel intervenant
 *     tags: [Intervenant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User' 
 *     responses:
 *       201:
 *         description: Intervenant créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User' 
 */
router.post('/', auth.authMiddleware, auth.isAdmin, UserController.createUser);
/**
 * @swagger
 * /intervenant:
 *   get:
 *     summary: Obtenir la liste de tous les intervenants
 *     tags: [Intervenant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User' 
 */
router.get('/', auth.authMiddleware, auth.isAdmin, UserController.getAllUsers);
/**
 * @swagger
 * /intervenant/{userId}:
 *   get:
 *     summary: Obtenir un intervenant par son ID
 *     tags: [Intervenant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'intervenant à obtenir
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User' 
 */

router.get('/:userId', auth.authMiddleware, auth.isAdmin, UserController.getUserById);
/**
 * @swagger
 * /intervenant/{userId}:
 *   put:
 *     summary: Mettre à jour un intervenant par son ID
 *     tags: [Intervenant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'intervenant à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User' 
 *     responses:
 *       200:
 *         description: Intervenant mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User' 
 */

router.put('/:userId', auth.authMiddleware, auth.isAdmin, UserController.updateUser);
/**
 * @swagger
 * /intervenant/{userId}:
 *   delete:
 *     summary: Supprimer un intervenant par son ID
 *     tags: [Intervenant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'intervenant à supprimer
 *     responses:
 *       200:
 *         description: Intervenant supprimé avec succès
 */


router.delete('/:userId', auth.authMiddleware, auth.isAdmin, UserController.deleteUser);

module.exports = router;
