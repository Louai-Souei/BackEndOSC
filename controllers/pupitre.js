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
  

  

module.exports = {
    assignLeadersToPupitre,
    createPupitre,
    updatePupitreById,
};