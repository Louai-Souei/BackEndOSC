const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const concertSchema = new Schema({
  presence: {
    type: Boolean,
  },
  date: { type: Date, required: true },
  lieu: { type: String, required: true },
  heure: { type: Date, required: true },
  affiche: { type: String },
  programme: [
    {
      programme: { type: Schema.Types.ObjectId, ref: "Programme" },
      requiresChoir: { type: Boolean, default: true },
    },
  ],
  planning: { type: Schema.Types.ObjectId, ref: "Repetition" },
  nom_concert: { type: String, require: true },
  placement: { type: Schema.Types.ObjectId, ref: "Placement" },
  repetition: [{ type: Schema.Types.ObjectId, ref: "Repetition" }],
  confirmations: [
    {
      choriste: { type: Schema.Types.ObjectId, ref: "User" },
      confirmation: { type: Boolean, default: false },
    },
  ],
});

const Concert = mongoose.model("Concert", concertSchema);

module.exports = Concert;
