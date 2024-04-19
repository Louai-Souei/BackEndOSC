const listeFinale = require("../models/listeFinale");

exports.getFinalList = async (req, res) => {
  try {
    const candidats = await listeFinale.find().populate("candidat");
    const formattedCandidats = candidats.map((item) => item.candidat);
    res.status(200).json({ model: formattedCandidats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
