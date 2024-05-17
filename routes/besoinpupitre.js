const express = require("express");
const router = express.Router();
const besoinController = require("../controllers/besoinpupitre");

router.post("/", besoinController.createBesoin);

router.get("/", besoinController.getAllBesoins);

module.exports = router;
