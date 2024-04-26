const express = require("express");
const router = express.Router();
const besoinController = require("../controllers/besoinpupitre");

// Route pour créer un besoin
router.post("/", besoinController.createBesoin);

// Route pour obtenir tous les besoins
router.get("/", besoinController.getAllBesoins);



module.exports = router;
