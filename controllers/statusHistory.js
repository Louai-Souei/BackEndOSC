const StatusHistory = require('../models/StatusHistory');

// Fonction pour enregistrer un nouveau changement de statut dans l'historique
const addStatusChange = async (req, res) => {
  try {
    const { userId, ancienStatus, nouveauStatus, nbsaison} = req.body; // Informations sur le changement de statut
    const statusChange = new StatusHistory({
      utilisateur: userId,
      ancienStatus: ancienStatus,
      nouveauStatus: nouveauStatus,
      nbsaison: nbsaison,
      date: new Date(),
    });
    await statusChange.save();
    res.json({ message: 'Changement de statut enregistré avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fonction pour récupérer l'historique des changements de statut d'un utilisateur spécifique
const getStatusHistoryForUser = async (req, res) => {
  try {
    const userId = req.params.id; // Ou récupérer l'ID de l'utilisateur à partir de la session
    const statusHistory = await StatusHistory.find({ utilisateur: userId }).sort({ date: 'desc' });
    res.json(statusHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addStatusChange,
  getStatusHistoryForUser,
  
};