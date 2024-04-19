const mongoose = require("mongoose");
const Saison = require("./saison");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    {
      type: String,
      required: true,
    },
  ],
  date: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ["elimination_en_cours", "elimination_confirmee"],
  },
  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
});

NotificationSchema.pre("save", async function (next) {
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

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
