const Saison = require('../models/saison'); 

exports.createSaison = async (req, res) => {
  try {
    // Chercher la saison active et la rendre inactive
    const activeSaison = await Saison.findOneAndUpdate(
      { isActive: true },
      { $set: { isActive: false } },
      { new: true }
    );

    if (activeSaison) {
      // Extraire le numéro de la saison active
      const numero = activeSaison.numero;

      // Créer une nouvelle saison en incrémentant le numéro de la saison active
      const newNumero = parseInt(numero) + 1;
      const nouvelleSaison = new Saison({
        name: req.body.nom,
        numero: newNumero.toString(),
      });

      // Sauvegarder la nouvelle saison
      await nouvelleSaison.save();

      res.status(201).json({
        model: nouvelleSaison,
        message: "Nouvelle saison créée avec succès",
      });
    } else {
      res.status(404).json({
        message: "Aucune saison active trouvée",
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Erreur lors de la création de la saison",
    });
  }
};


  exports.getAllSaisons = async (req, res) => {
    try {
      const saisons = await Saison.find();
      res.status(200).json({
        saisons: saisons,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
        message: 'Problème d\'extraction des saisons',
      });
    }
};

  
  exports.getSaisonById = async (req, res) => {
    try {
      const saison = await Saison.findById(req.params.id);
      if (!saison) {
        return res.status(404).json({ message: 'Saison non trouvée' });
      }
      res.status(200).json(saison);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.updateSaison = async (req, res) => {
    try {
      const saison = await Saison.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!saison) {
        return res.status(404).json({ message: 'Saison non trouvée' });
      }
      res.status(200).json({
        model: saison,
        message: 'Saison mise à jour avec succès',
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        message: 'Erreur lors de la mise à jour de la saison',
      });
    }
  };



  exports.deleteSaison = async (req, res) => {
    try {
      const saison = await Saison.findByIdAndDelete(req.params.id);
      if (!saison) {
        return res.status(404).json({ message: 'Saison non trouvée' });
      }
      res.status(200).json({
        model: saison,
        message: 'Saison supprimée avec succès',
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        message: 'Erreur lors de la suppression de la saison',
      });
    }
  };
  
  exports.getCurrentSaison = async (req, res) => {
    try {
      const currentSaison = await Saison.findOne({ isActive: true });
      if (!currentSaison) {
        return res.status(404).json({ message: "Saison non trouvée" });
      }
      res.status(200).json(currentSaison);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
