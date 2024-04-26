const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Saison = require("./saison");
const Verifmail = require("./verifmail");

const candidatSchema = new Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    nom_jeune_fille: { type: String, required: true },
    sexe: { type: String, required: true },
    nationalite: { type: String },
    taille_en_m: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    telephone: { type: Number, required: true, unique: true },
    cinpassport: { type: String, required: true },
    date_naissance: { type: Date },
    situationProfessionnelle: { type: String, required: true },
    connaissances: { type: String, required: true },
    parraine: { type: String, required: true },
    activite: { type: String, required: true },
    choeuramateur: { type: String, required: true },
    estretenu: { type: Boolean, default: false },
    estConfirme: { type: Boolean, default: false },
    signature: { type: Boolean, default: false },
    estEngage: { type: Boolean, default: false },
    estPresent: { type: Boolean, default: false },
    decisioneventuelle: {
      type: String,
      enum: ["retenu", "en attente", "refuse","finale"],
      default: "en attente",
    },
    token: { type: String },
    saison: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Saison"
    },
  },
  {
    timestamps: true,
  }
);
// Fonction pour obtenir l'ID de la saison active
candidatSchema.pre("save", async function (next) {
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


const Candidat = mongoose.model("Candidat", candidatSchema);

module.exports = Candidat;
