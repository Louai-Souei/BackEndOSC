const express = require("express");
const router = express.Router();
const listeFinaleController = require("../controllers/listeFinaleController");
const auth = require("../middlewares/auth");

router.get(
  "/",
  listeFinaleController.getFinalList
);


module.exports = router;
