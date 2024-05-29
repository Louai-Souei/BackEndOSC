const mongoose = require("mongoose");
const Saison = require("./saison");
const Schema = mongoose.Schema;

const AuditionSchema = new Schema({
  date_audition: { type: Date },
  heure_debut: { type: Date },
  heure_fin: { type: Date },

  candidat: { type: mongoose.Schema.Types.ObjectId, ref: "Candidat" },
  extraitChante: { type: String },
  tessiture: {
    type: String,
    enum: ["Soprano", "Alto", "Ténor", "Basse", "Autre"],
  },
  evaluation: {
    type: String,
    enum: ["A", "B", "C"],
  },
  decisioneventuelle: {
    type: String,
    enum: ["retenu", "en attente", "refuse", "Final"],
    default: "en attente",
  },
  remarque: { type: String },
  estPresent: { type: Boolean, default: false },
  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
});
AuditionSchema.pre("save", async function (next) {
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

const Audition = mongoose.model("Audition", AuditionSchema);
module.exports = Audition;
