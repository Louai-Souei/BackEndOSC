const mongoose = require("mongoose");
const Saison = require("./saison");
const Schema = mongoose.Schema;

const RepetitionSchema = new Schema({
  nom: { type: String, required: true },
  date: [{ type: Date, required: true }],
  heureDebut: { type: String, required: true },
  heureFin: { type: String, required: true },
  lieu: { type: String, required: true },
  participant: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  nbr_repetition: { type: Number, required: true },
  pourcentagesPupitres: [
    {
      pupitre: { type: Schema.Types.ObjectId, ref: "Pupitre" },
      selectedChoristes: [
        {
          _id: { type: Schema.Types.ObjectId, ref: "User" },
          nom: { type: String },
          prenom: { type: String },
        },
      ],
    },
  ],
  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
  programme: { type: Schema.Types.ObjectId, ref: "Programme" },
  concert: { type: mongoose.Schema.Types.ObjectId, ref: "Concert" },
});

RepetitionSchema.pre("save", async function (next) {
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

const Repetition = mongoose.model("Repetition", RepetitionSchema);

module.exports = Repetition;
