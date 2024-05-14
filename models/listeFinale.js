const mongoose = require("mongoose");
const Saison = require("./saison");
const Schema = mongoose.Schema;

const listeFinaleSchema = new Schema({
    
  candidat: { type: mongoose.Schema.Types.ObjectId, ref: "Candidat" },
  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
});
listeFinaleSchema.pre("save", async function (next) {
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

const listeFinale = mongoose.model("listeFinale", listeFinaleSchema);
module.exports = listeFinale;