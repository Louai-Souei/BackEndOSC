const express = require("express");
const router = express.Router();
const saisonController = require("../controllers/saison");
const auth = require("../middlewares/auth");

/**
 * @swagger
 * components:
 *   schemas:
 *     Saison:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the season
 *         titre:
 *           type: string
 *           description: The name of the season
 *         Datedebut:
 *           type: string
 *           format: date
 *           description: The start date of the season
 *         Datefin:
 *           type: string
 *           format: date
 *           description: The end date of the season
 *         concerts:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of concert IDs associated with the season
 *         repetitions:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of repetition IDs associated with the season
 *         oeuvres:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of oeuvre IDs associated with the season
 *         auditions:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of audition IDs associated with the season
 *         utilisateur:
 *           type: string
 *           description: User ID associated with the season
 *       example:
 *
 *         titre: "Saison d'été 2023"
 *         Datedebut: "2023-06-01"
 *         Datefin: "2023-08-31"
 *
 *
 *   responses:
 *     SaisonResponse:
 *       description: A sample response for Saison operations
 *       content:
 *         application/json:
 *           example:
 *             message: "Saison operation successful"
 *             data:
 *               saisonId: 123
 *     ErrorResponse:
 *       description: An error response
 *       content:
 *         application/json:
 *           example:
 *             message: "Error in Saison operation"
 */

/**
 * @swagger
 * tags:
 *   name: Saisons
 *   description: API for managing seasons
 */

/**
 * @swagger
 * /saisons:
 *   post:
 *     summary: Create a new season
 *     tags: [Saisons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Saison'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SaisonResponse'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
router.post("/", saisonController.createSaison);

/**
 * @swagger
 * /saisons:
 *   get:
 *     summary: List all seasons
 *     tags: [Saisons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SaisonResponse'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
router.get(
  "/",
  auth.authMiddleware,
  auth.isAdmin,
  saisonController.getAllSaisons
);

router.get("/current-saison", saisonController.getCurrentSaison);

/**
 * @swagger
 * /saisons/{id}:
 *   get:
 *     summary: Get season by ID
 *     tags: [Saisons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the season
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SaisonResponse'
 *       '404':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
router.get(
  "/:id",
  auth.authMiddleware,
  auth.isAdmin,
  saisonController.getSaisonById
);

/**
 * @swagger
 * /saisons/{id}:
 *   put:
 *     summary: Update a season by ID
 *     tags: [Saisons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the season
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Saison'
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SaisonResponse'
 *       '404':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
router.put(
  "/:id",
  auth.authMiddleware,
  auth.isAdmin,
  saisonController.updateSaison
);

/**
 * @swagger
 * /saisons/{id}:
 *   delete:
 *     summary: Delete a season by ID
 *     tags: [Saisons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the season
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         $ref: '#/components/responses/SaisonResponse'
 *       '404':
 *         $ref: '#/components/responses/ErrorResponse'
 *       '500':
 *         $ref: '#/components/responses/ErrorResponse'
 */
router.delete(
  "/:id",
  auth.authMiddleware,
  auth.isAdmin,
  saisonController.deleteSaison
);

module.exports = router;
