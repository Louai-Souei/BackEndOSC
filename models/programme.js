const mongoose = require("mongoose");
const Saison = require("./saison");
const Schema = mongoose.Schema;

const programmeSchema = new Schema({
  nom_programme: { type: String, required: true },
  oeuvres: [{ type: Schema.Types.ObjectId, ref: "oeuvres" }],
  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
});

programmeSchema.pre("save", async function (next) {
  try {
    const saisonActive = await Saison.findOne({ isActive: true });
    if (saisonActive) {
      this.saison = saisonActive._id;
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

const Programme = mongoose.model("Programme", programmeSchema);

module.exports = Programme;
