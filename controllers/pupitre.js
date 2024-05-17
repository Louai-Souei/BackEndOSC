const Pupitre = require("../models/pupitre");
const User=require("../models/utilisateurs")

const assignLeadersToPupitre = async (req, res) => {
  const { chefsIds } = req.body;
  const pupitreId = req.params.pupitreId;
  const modifiedUsers = []; // Pour stocker les utilisateurs avec leurs rôles modifiés

  try {
      console.log(req.body);
      const pupitre = await Pupitre.findById(pupitreId);

      if (!pupitre) {
          return res.status(404).json({ error: 'Pupitre non trouvé' });
      }

      if (!Array.isArray(chefsIds) || chefsIds.length !== 2) {
          return res.status(400).json({ error: 'Doit fournir exactement deux IDs de chefs' });
      } 

      pupitre.chefs = chefsIds;

      for (const chefIds of chefsIds) {
          const user = await User.findById(chefIds);
          if (user) {
              user.role = 'chef de pupitre'; // Mettre à jour le rôle
              await user.save(); // Sauvegarder les modifications dans la base de données
              modifiedUsers.push({
                  email: user.email,
                  lastName: user.nom,
                  firstName: user.prenom,
                  role: user.role
              });
          }
      }
      await pupitre.save();

      res.status(200).json({ message: 'les chefs assignés avec succès', modifiedUsers });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};



const createPupitre = async (req, res) => {
    try {
      const { num_pupitre, tessiture, besoin , choristes , leaders } = req.body;
  
      const newPupitre = new Pupitre({
        num_pupitre,
        tessiture,
        besoin,
        choristes,
        leaders,
      });
  
      const savedPupitre = await newPupitre.save();
  
      res.status(201).json(savedPupitre);
    } catch (error) {
      console.error('Erreur lors de la création du pupitre :', error.message);
      res.status(500).json({ error: `Erreur lors de la création du pupitre : ${error.message}` });
    }
  };
  const updatePupitreById = async (req, res) => {
    try {
      const pupitreId = req.params.id;
      const { num_pupitre, tessiture, besoin, choristes, leaders } = req.body;
  
      // Vérifiez si le pupitre existe
      const existingPupitre = await Pupitre.findById(pupitreId);
  
      if (!existingPupitre) {
        return res.status(404).json({ error: 'Pupitre non trouvé' });
      }
  
      // Mettez à jour les champs du pupitre
      existingPupitre.num_pupitre = num_pupitre;
      existingPupitre.tessiture = tessiture;
      existingPupitre.besoin = besoin;
      existingPupitre.choristes = choristes;
      existingPupitre.leaders = leaders;
  
      // Sauvegardez les modifications
      const updatedPupitre = await existingPupitre.save();
  
      res.status(200).json(updatedPupitre);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du pupitre :', error.message);
      res.status(500).json({ error: `Erreur lors de la mise à jour du pupitre : ${error.message}` });
    }
  };
  

  

const getPupitreIdByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Recherche de l'utilisateur par ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    // Parcours de tous les pupitres
    const pupitres = await Pupitre.find();

    for (const pupitre of pupitres) {
      // Vérifiez si l'utilisateur est associé à ce pupitre
      if (pupitre.choristes.includes(userId)) {
        // Si l'utilisateur est associé à ce pupitre, retournez l'ID du pupitre
        return res.status(200).json({ success: true, pupitreId: pupitre._id });
      }
    }

    // Si l'utilisateur n'est pas associé à un pupitre, retournez un message d'erreur
    return res.status(404).json({ success: false, message: "L'utilisateur n'est pas associé à un pupitre." });
  } catch (error) {
    return res.status(500).json({ success: false, error: `Erreur lors de la récupération de l'ID du pupitre : ${error.message} `});
  }
};


module.exports = {
    assignLeadersToPupitre,
    createPupitre,
    updatePupitreById,
    getPupitreIdByUserId,

};