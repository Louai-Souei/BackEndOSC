const express = require("express");
const router = express.Router();
const oeuvreController = require("../controllers/oeuvre");
const auth = require("../middlewares/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

router.get(
  "/statistics",
  auth.authMiddleware,
  auth.isAdmin,
  oeuvreController.OeuvreStatistics
);

/**
 * @swagger
 * tags:
 *   name: Oeuvres
 *   description: API de gestion des œuvres d'art
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Oeuvre:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the oeuvre
 *         titre:
 *           type: string
 *           description: The oeuvre title
 *         compositeurs:
 *           type: string
 *           description: The composers of the oeuvre
 *         arrangeurs:
 *           type: string
 *           description: The arrangers of the oeuvre
 *         annee:
 *           type: string
 *           description: The year of the oeuvre
 *         genre:
 *           type: string
 *           description: The genre of the oeuvre
 *         paroles:
 *           type: string
 *           description: The lyrics of the oeuvre
 *         partition:
 *           type: string
 *           description: The musical score or partition of the oeuvre
 *         requiresChoir:
 *           type: boolean
 *           description: Indicates whether the oeuvre requires a choir
 *       example:
 *         _id: "12345"
 *         titre: "La boheme"
 *         compositeurs: "Composer Name"
 *         arrangeurs: "Arranger Name"
 *         annee: "2022"
 *         genre: "Classical"
 *         paroles: "Lyrics of the song"
 *         partition: "Link to the musical score"
 *         requiresChoir: true
 *
 *     NewOeuvre:
 *       type: object
 *       required:
 *         - titre
 *         - compositeurs
 *         - arrangeurs
 *         - annee
 *         - genre
 *         - partition
 *       properties:
 *         titre:
 *           type: string
 *           description: The oeuvre title
 *         compositeurs:
 *           type: string
 *           description: The composers of the oeuvre
 *         arrangeurs:
 *           type: string
 *           description: The arrangers of the oeuvre
 *         annee:
 *           type: string
 *           description: The year of the oeuvre
 *         genre:
 *           type: string
 *           description: The genre of the oeuvre
 *         paroles:
 *           type: string
 *           description: The lyrics of the oeuvre
 *         partition:
 *           type: string
 *           description: The musical score or partition of the oeuvre
 *         requiresChoir:
 *           type: boolean
 *           description: Indicates whether the oeuvre requires a choir
 *       example:
 *         titre: "La boheme"
 *         compositeurs: "Composer Name"
 *         arrangeurs: "Arranger Name"
 *         annee: "2022"
 *         genre: "Classical"
 *         paroles: "Lyrics of the song"
 *         partition: "Link to the musical score"
 *         requiresChoir: true
 *
 *   responses:
 *     StandardResponse:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Oeuvre'
 *       404:
 *         description: Oeuvre not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /oeuvres:
 *   get:
 *     summary: List all oeuvres
 *     tags: [Oeuvres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Oeuvre'
 *       '404':
 *         description: Oeuvre not found
 *       '500':
 *         description: Server error
 */
router.get("/", oeuvreController.getAllOeuvres);

/**
 * @swagger
 * /oeuvres:
 *   post:
 *     summary: Create a new oeuvre
 *     tags: [Oeuvres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewOeuvre'
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Oeuvre'
 *       '500':
 *         description: Server error
 */
router.post("/", oeuvreController.createOeuvre);

/**
 * @swagger
 * /oeuvres/{id}:
 *   get:
 *     summary: Get an oeuvre by ID
 *     tags: [Oeuvres]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the oeuvre
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Oeuvre'
 *       '404':
 *         description: Oeuvre not found
 *       '500':
 *         description: Server error
 */
router.get(
  "/:id",
  auth.authMiddleware,
  auth.isAdmin,
  oeuvreController.getOeuvreById
);

/**
 * @swagger
 * /oeuvres/{id}:
 *   put:
 *     summary: Update an oeuvre by ID
 *     tags: [Oeuvres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the oeuvre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewOeuvre'
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Oeuvre'
 *       '404':
 *         description: Oeuvre not found
 *       '500':
 *         description: Server error
 */
router.put(
  "/:id",
  auth.authMiddleware,
  auth.isAdmin,
  oeuvreController.updateOeuvre
);

/**
 * @swagger
 * /oeuvres/{id}:
 *   delete:
 *     summary: Delete an oeuvre by ID
 *     tags: [Oeuvres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the oeuvre
 *     responses:
 *       '200':
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Oeuvre'
 *       '404':
 *         description: Oeuvre not found
 *       '500':
 *         description: Server error
 */
router.delete(
  "/:id",
  auth.authMiddleware,
  auth.isAdmin,
  oeuvreController.deleteOeuvre
);

/**
 * @swagger
 * /oeuvres/statistics:
 *   get:
 *     summary: Get statistics for oeuvres
 *     tags: [Oeuvres]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               statistics:
 *                 totalOeuvres: 20
 *                 mostFrequentArtist: "Leonardo da Vinci"
 *                 averageOeuvresPerArtist: 5
 *                 earliestCreationDate: "1503-08-21"
 *                 latestCreationDate: "1519-05-02"
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public");
    }

    if (!fs.existsSync("public/csv")) {
      fs.mkdirSync("public/csv");
    }

    cb(null, "public/csv");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    var ext = path.extname(file.originalname);

    if (ext !== ".csv") {
      return cb(new Error("Only csvs are allowed!"));
    }

    cb(null, true);
  },
});

router.post(
  "/importOeuvreAndConcertFromExcel",
  upload.single("csvFile"),
  oeuvreController.createOeuvreFromExcel
);

module.exports = router;
