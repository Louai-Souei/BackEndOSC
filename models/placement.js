const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Saison = require("./saison");

const placementSchema = new Schema({
  concertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Concert",
    required: true,
  },
  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
  placementDetails: { type: Schema.Types.Mixed },
});

placementSchema.pre("save", async function (next) {
  try {
    // Recherche de la saison active
    const saisonActive = await Saison.findOne({ isActive: true });
    if (saisonActive) {
      this.saison = saisonActive._id; // Définit l'ID de la saison active sur l'instance d'œuvre
    } else {
      throw new Error("Aucune saison active trouvée.");
    }
    next();
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la saison active :",
      error.message
    );
    next(error);
  }
});

const Placement = mongoose.model("Placement", placementSchema);
module.exports = Placement;

const changePasswordMiddleware = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  // Vérifiez les informations actuelles du mot de passe (à adapter selon votre implémentation)
  if (oldPassword !== user.password) {
    return res.status(401).send("Mot de passe actuel incorrect");
  }

  // Mettez à jour le mot de passe dans votre système (à adapter selon votre implémentation)
  user.password = newPassword;

  // Vous pouvez également mettre à jour le mot de passe dans votre base de données ici

  next();
};
