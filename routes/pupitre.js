const express = require("express");
const router = express.Router();
const pupitreController = require("../controllers/pupitre");

router.post("/:pupitreId/chefs", pupitreController.assignLeadersToPupitre);

router.post("/create", pupitreController.createPupitre);
router.put("/:id", pupitreController.updatePupitreById);
router.get("/", pupitreController.getAllPupitres);
router.get("/:id/choristes", pupitreController.getListeChoristesByPupitreId);

router.get("/user-pupitre/:userId", pupitreController.getPupitreIdByUserId);

module.exports = router;
