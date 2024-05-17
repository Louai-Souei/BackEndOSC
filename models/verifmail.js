const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Saison = require("./saison");

const verifmailSchema = new Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true },
  verified: { type: Boolean, default: false },
  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
});

verifmailSchema.pre("save", async function (next) {
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

const Verifmail = mongoose.model("Verifmail", verifmailSchema);

module.exports = Verifmail;
