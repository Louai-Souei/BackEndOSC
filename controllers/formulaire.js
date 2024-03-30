const Formulaire = require('../models/formulaire');
//post
exports.createFormulaire = async (req, res) => {
    try {
        const formulaire = new Formulaire(req.body);
        const savedFormulaire = await formulaire.save();
        res.status(201).json(savedFormulaire);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
//get
exports.getAllFormulaires = async (req, res) => {
    try {
        const formulaires = await Formulaire.find().populate('listeQuestions');
        res.status(200).json(formulaires);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//getByID
exports.getFormulaireById = async (req, res) => {
    try {
        const formulaire = await Formulaire.findById(req.params.id).populate('listeQuestions');
        if (!formulaire) {
            return res.status(404).json({ message: 'Formulaire not found' });
        }
        res.status(200).json(formulaire);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//update
exports.updateFormulaireById = async (req, res) => {
    try {
        const formulaire = await Formulaire.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!formulaire) {
            return res.status(404).json({ message: 'Formulaire not found' });
        }
        res.status(200).json(formulaire);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete 
exports.deleteFormulaireById = async (req, res) => {
    try {
        const formulaire = await Formulaire.findByIdAndRemove(req.params.id);
        if (!formulaire) {
            return res.status(404).json({ message: 'Formulaire not found' });
        }
        res.status(200).json({ message: 'Formulaire deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

