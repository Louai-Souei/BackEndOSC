const mongoose = require('mongoose');
const Saison = require("./saison");
const Schema = mongoose.Schema;

const EvenementAuditionSchema = new Schema({
  Date_debut_Audition: { type: Date, required: true },
  nombre_séance: { type: Number, required: true },
  dureeAudition: { type: String, required: true },
  Date_fin_Audition: { type: Date, required: true },
  date: { type: Date, required: true, default: Date.now() },
  lienFormulaire: { type: String },
  isPlaned: { type: Boolean, default: false },
  isClosed: { type: Boolean, default: false },
  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
});
EvenementAuditionSchema.pre("save", async function (next) {
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
  
  const EvenementAudition = mongoose.model('EvenementAudition', EvenementAuditionSchema);
  module.exports = EvenementAudition;
