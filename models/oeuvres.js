const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Saison = require("./saison")
const OeuvresSchema = new Schema({
  titre: { type: String, required: true },
  compositeurs: { type: String, required: true },
  arrangeurs: { type: String, required: true },
  annee: { type: String, required: true },
  genre: { type: String, required: true },
  paroles: { type: String },
  partition: { type: String, required: true },
  requiresChoir: { type: Boolean, default: true },
  saison: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Saison"
  },
});

OeuvresSchema.pre("save", async function (next) {
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

const Oeuvres = mongoose.model("oeuvres", OeuvresSchema);
module.exports = Oeuvres;