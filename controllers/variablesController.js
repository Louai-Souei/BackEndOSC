const Variables = require("../models/variables");

exports.createVariables = async (req, res) => {
  try {
    const { AcceptationEmails, AuditionEmails } = req.body;

    // Création d'une nouvelle instance de Variables
    const variables = new Variables({
      AcceptationEmails,
      AuditionEmails,
    });

    // Enregistrement de la nouvelle instance dans la base de données
    const newVariables = await variables.save();

    res.status(201).json({newVariables});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getVariables = async (req, res) => {
  try {
    // Récupération de toutes les variables depuis la base de données
    const variables = await Variables.find();

    res.status(200).json({variables });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.updateVariables = async (req) => {
  try {
    const id  = "6621508217b7a5c02ec4b42f"

    const updateData = req;
   

    // Mettre à jour les variables
    const test = await Variables.findById(id);


    const updatedVariables = await Variables.findByIdAndUpdate(id, updateData, {
      new: true, // Pour retourner les données mises à jour
      runValidators: true, // Pour exécuter les validateurs définis dans le schéma
    });

    if (!updatedVariables) { 
             console.log('false: ');
      return false

    }
    return updateData;
  } catch (error) {
    return error
  }
};


