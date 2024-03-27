const express = require('express');
const router = express.Router();
const formulaireController = require('../controllers/formulaire');

router.post('/', formulaireController.createFormulaire);
router.get('/', formulaireController.getAllFormulaires);
router.get('/:id', formulaireController.getFormulaireById);
router.put('/:id', formulaireController.updateFormulaireById);
router.delete('/:id', formulaireController.deleteFormulaireById);

module.exports = router;
