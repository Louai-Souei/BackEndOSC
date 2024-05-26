const mongoose = require("mongoose");
const Saison = require("./saison");
const Schema = mongoose.Schema;

const pupitreSchema = new Schema({
  num_pupitre: { type: Number },
  tessiture: {
    type: String,
    enum: ["Soprano", "Alto", "Ténor", "Basse"],
  },
  besoin: { type: Number, required: true },
  choristes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  chefs: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      where: { role: "chef de pupitre" },
    },
  ],
  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
});

pupitreSchema.pre("save", async function (next) {
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

const Pupitre = mongoose.model("Pupitre", pupitreSchema);
module.exports = Pupitre;
