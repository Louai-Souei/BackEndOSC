const express = require("express");
const router = express.Router();
const variablesController = require("../controllers/variablesController");

router.post("/", variablesController.createVariables);

router.get("/", variablesController.getVariables);

router.put("/", variablesController.updateVariables);

module.exports = router;
