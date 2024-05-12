const mongoose = require("mongoose");

const saisonSchema = new mongoose.Schema({
  name: { type: String, required: false },
  numero: { type: String, required: false, unique: true },
  Datedebut: {
    type: Date,
    default: Date.now,
  },
  Datefin: { type: Date, required: false },
  isActive: { type: Boolean, default: true },
});

const Saison = mongoose.model("Saison", saisonSchema);

module.exports = Saison;
