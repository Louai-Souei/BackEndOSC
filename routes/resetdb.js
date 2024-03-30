const express = require("express")
const router = express.Router()
const dbcontroller= require ("../controllers/resedb")
router.post("/", dbcontroller.deleteData);
module.exports = router