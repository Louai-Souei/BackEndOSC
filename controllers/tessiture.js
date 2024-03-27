const User = require('../models/utilisateurs');
const {io}=require("../socket")
const Pupitre = require("../models/pupitre")
const mongoose= require('mongoose')


const updateTessiture = (req, res) => {
  const { nouvelleTessiture } = req.body;
  const userId = req.params.id; 

  User.findById(userId)
    .then((utilisateur) => {
      if (utilisateur && utilisateur.role === 'choriste') {
        utilisateur.tessiture = nouvelleTessiture;
        return utilisateur.save();
      } else if (!utilisateur) {
        res.status(404).json({
          message: "Utilisateur non trouvé",
        });
      } else {
        res.status(403).json({
          message: "L'utilisateur n'a pas le rôle de choriste",
        });
      }
    })
    .then((utilisateurModifie) => {
      if (utilisateurModifie) {
        res.status(200).json({
          utilisateur: utilisateurModifie,
          message: "Tessiture mise à jour avec succès",
        });
      }
    })
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "Échec de la mise à jour de la tessiture",
      });
    });
};



const NotifupdateTessiture = (req, res) => {
  const { nouvelleTessiture } = req.body;
  const userId = req.params.id; 
User.findById(userId)
    .then(async (utilisateur) => {
      if (utilisateur && utilisateur.role === 'choriste') {
        const tessiture =utilisateur.tessiture;
        console.log(tessiture)
        utilisateur.tessiture = nouvelleTessiture;

        const pupitres= await Pupitre.find()
        const choristeIdToFind = new mongoose.Types.ObjectId(userId); 
      
        const chefspupitre= pupitres
        .filter(pupitre => pupitre.choristes.includes(choristeIdToFind)).map((pupitre)=>{
          return pupitre.chefs
        }).flat()
        chefspupitre.map((chef)=>{
          io.emit(`notif-${chef.toString()}`, {message: `la tessiture de votre choriste ${utilisateur.nom+ " "+utilisateur.prenom} a ete modifie de ${tessiture} a ${nouvelleTessiture} `})
        })

        return utilisateur.save();
      } else if (!utilisateur) {
        res.status(404).json({
          message: "Utilisateur non trouvé",
        });
      } else {
        res.status(403).json({
          message: "L'utilisateur n'a pas le rôle de choriste",
        });
      }
    })
    .then((utilisateurModifie) => {
      if (utilisateurModifie) {
        res.status(200).json({
          utilisateur: utilisateurModifie,
          message: "Tessiture mise à jour avec succès",
        });
      }
    })
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "Échec de la mise à jour de la tessiture",
      });
    });
};

module.exports = {
  updateTessiture,
  NotifupdateTessiture
}

  