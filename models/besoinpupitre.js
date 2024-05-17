const mongoose = require("mongoose");

const besoinSchema = new mongoose.Schema({
  besoinAlto: { type: Number, required: false },
  besoinSoprano: { type: Number, required: false },
  besoinTénor: { type: Number, required: false },
  besoinBasse: { type: Number, required: false },
});

const Besoin = mongoose.model("besoin", besoinSchema);

module.exports = Besoin;
