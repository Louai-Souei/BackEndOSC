const mongoose = require("mongoose");
const Saison = require("./saison");
const Schema = mongoose.Schema;

const concertSchema = new Schema({
  date: { type: Date, required: true },
  lieu: { type: String, required: true },
  affiche_url: { type: String },
  planning: { type: Schema.Types.ObjectId, ref: "Repetition" },
  placement: { type: Schema.Types.ObjectId, ref: "Placement" },
  confirmations: [
    {
      choriste: { type: Schema.Types.ObjectId, ref: "User" },
      confirmation: { type: Boolean, default: false },
      invite: { type: Boolean, default: false },
    },
  ],
  repetition: [{ type: Schema.Types.ObjectId, ref: "Repetition" }],

  programme: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "oeuvres",
    },
  ],
  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
});

concertSchema.pre("save", async function (next) {
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

const Concert = mongoose.model("Concert", concertSchema);

module.exports = Concert;
