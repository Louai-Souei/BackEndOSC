const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Saison = require("./saison");

const variableslSchema = new Schema({
  AcceptationEmails: { type: Boolean, default: false },
  AuditionEmails: { type: Boolean, default: false },
  listeGenerated: { type: Boolean, default: false },

  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
});

variableslSchema.pre("save", async function (next) {
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

const variablesSchema = mongoose.model("Variables", variableslSchema);

module.exports = variablesSchema;
