const Candidat = require('../models/candidat');
const getCandidats = async (req, res) => {
  try {
    const filter = {};

    if (req.query.sexe) {
      filter.sexe = { $eq: req.query.sexe };
    }
    if (req.query.max && req.query.min  ) {
      filter.taille_en_m  = {  $lte: req.query.max ,$gte: req.query.min };
    }
    
    if (req.query.nom) {
      filter.nom = { $regex: req.query.nom, $options: "i" };
    }
    if (req.query.prenom) {
      filter.prenom = { $regex: req.query.prenom, $options: "i" };
    }
  
    if (req.query.telephone) {
      if (!isNaN(req.query.telephone)) {
        filter.telephone = { $eq: req.query.telephone };
      } else {
        filter.telephone = { $regex: req.query.telephone, $options: "i" };
      }
    }
    
    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: "i" };
    }
    if (req.query.cinpassport) {
      filter.cinpassport = { $regex: req.query.cinpassport, $options: "i" };
    }
    if (req.query.nationalite) {
      filter.nationalite = { $regex: req.query.nationalite, $options: "i" };
    }
  
    if (req.query.situationProfessionnelle) {
      filter.situationProfessionnelle = {
        $regex: req.query.situationProfessionnelle,
        $options: "i",
      };
    }
    if (req.query.date_naissance) {
      filter.date_naissance = req.query.date_naissance; 
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const candidats = await Candidat.find(filter)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        candidats,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

module.exports ={
  getCandidats
}