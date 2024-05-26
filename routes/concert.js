const express = require('express');
const router = express.Router();
const concertController = require('../controllers/concert');
const auth = require('../middlewares/auth');
/**
 * @swagger
 * /concert/concerts/statistics:
 *   get:
 *     summary: Get statistics for all concerts
 *     tags: [Concerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statistics: {
 *                 totalConcerts: 10,
 *                 totalConfirmedConcerts: 5,
 *                 totalUnconfirmedConcerts: 5
 *               }
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * tags:
 *   name: Concerts
 *   description: API operations related to concerts
 */
router.get('/concerts/statistics', auth.authMiddleware, auth.isAdmin, concertController.getConcertStatistics);

/**
 * @swagger
 * /concert:
 *   post:
 *     summary: Create a new concert
 *     tags: [Concerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Concert'
 *     responses:
 *       201:
 *         description: Concert created successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /concert:
 *   get:
 *     summary: Get all concerts
 *     tags: [Concerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               concerts:
 *                 - _id: "60a1f5f66b5f4b001d3478c5"
 *                   presence: true
 *                   date: "2022-05-16"
 *                   lieu: "Concert Hall"
 *                   heure: "19:00"
 *                   affiche: "https://example.com/concert-poster.jpg"
 *                   programme:
 *                     - programme: "60a1f5f66b5f4b001d3478c6"
 *                       requiresChoir: true
 *                   planning: "60a1f5f66b5f4b001d3478c7"
 *                   nom_concert: "Spring Concert"
 *                   placement: "60a1f5f66b5f4b001d3478c8"
 *                   participant: "60a1f5f66b5f4b001d3478c9"
 *                 - _id: "60a1f5f66b5f4b001d3478ca"
 *                   presence: false
 *                   date: "2022-08-20"
 *                   lieu: "Outdoor Venue"
 *                   heure: "20:00"
 *                   affiche: "https://example.com/summer-concert.jpg"
 *                   programme:
 *                     - programme: "60a1f5f66b5f4b001d3478cb"
 *                       requiresChoir: false
 *                   planning: "60a1f5f66b5f4b001d3478cc"
 *                   nom_concert: "Summer Night Vibes"
 *                   placement: "60a1f5f66b5f4b001d3478cd"
 *                   participant: "60a1f5f66b5f4b001d3478ce"
 */

/**
 * @swagger
 * /concert/{id}:
 *   put:
 *     summary: Update a specific concert by ID
 *     tags: [Concerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Concert ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Concert'
 *     responses:
 *       200:
 *         description: Concert updated successfully
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: Concert not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /concert/{id}:
 *   delete:
 *     summary: Delete a specific concert by ID
 *     tags: [Concerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Concert ID
 *     responses:
 *       200:
 *         description: Concert deleted successfully
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: Concert not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /concert/{id}/confirmerpresence:
 *   post:
 *     summary: Confirm presence for a specific concert by ID
 *     tags: [Concerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Concert ID
 *     responses:
 *       200:
 *         description: Presence confirmed successfully
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: Concert not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Concert:
 *       type: object
 *       properties:
 *         presence:
 *           type: boolean
 *         date:
 *           type: string
 *           format: date
 *         lieu:
 *           type: string
 *         heure:
 *           type: string
 *           format: time
 *         affiche:
 *           type: string
 *         programme:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               programme:
 *                 type: string
 *               requiresChoir:
 *                 type: boolean
 *           required:
 *             - programme
 *         planning:
 *           type: string
 *         nom_concert:
 *           type: string
 *         placement:
 *           type: string
 *         participant:
 *           type: string
 *       required:
 *         - date
 *         - lieu
 *         - heure
 *         - programme
 *         - planning
 *         - nom_concert
 */

// Routes pour gérer les concerts
router.post('/', auth.authMiddleware, auth.isAdmin, concertController.createConcert); 
router.get('/',auth.authMiddleware, auth.isAdmin, concertController.getAllConcerts); 
router.put('/:id', auth.authMiddleware, auth.isAdmin,concertController.updateConcert); 
router.delete('/:id', auth.authMiddleware, auth.isAdmin, concertController.deleteConcert); 
router.post('/:id/confirmerpresence', auth.authMiddleware, auth.isChoriste, concertController.confirmerpresenceConcert);

router.get('/:id/confirmedChoristes', auth.authMiddleware, auth.isAdmin, concertController.getConfirmedChoristesForConcert);
/**
 * @swagger
 * /concert/{id}/confirmedChoristes:
 *   get:
 *     summary: Get confirmed choristes for a specific concert by ID
 *     tags: [Concerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Concert ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               confirmedChoristes: [ "choriste1", "choriste2" ]
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: Concert not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/ajouterpresence', auth.authMiddleware, auth.isAdminOrChoriste,concertController.ajouterPresenceManuelle);
/**
 * @swagger
 * /concert/{id}/ajouterpresence:
 *   post:
 *     summary: Manually add presence for a specific concert by ID
 *     tags: [Concerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Concert ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               choristeId:
 *                 type: string
 *             required:
 *               - choristeId
 *     responses:
 *       201:
 *         description: Presence added successfully
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: Concert not found
 *       500:
 *         description: Internal server error
 */
// router.post('/:id/indiquerconfirmation', auth.authMiddleware, auth.isChoriste, concertController.indiquerpresenceConcert);
router.post(
  "/:id/indiquerconfirmation",
  concertController.indiquerpresenceConcert
);
/**
 * @swagger
 * /concert/{id}/indiquerconfirmation:
 *   post:
 *     summary: Indicate presence confirmation for a specific concert by ID
 *     tags: [Concerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Concert ID
 *     responses:
 *       200:
 *         description: Presence confirmation indicated successfully
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: Concert not found
 *       500:
 *         description: Internal server error
 */



module.exports = router;