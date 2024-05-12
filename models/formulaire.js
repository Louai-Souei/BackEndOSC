const mongoose = require("mongoose");
const Saison = require("./saison");
const Schema = mongoose.Schema;

const formulaireSchema = new Schema({
  titre: { type: String, required: true },
  designation: { type: String },
  date_Creation: { type: Date, default: Date.now },
  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
});

formulaireSchema.pre("save", async function (next) {
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

module.exports = mongoose.model("Formulaire", formulaireSchema);
