const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RepetitionSchema = new Schema({
  nom: { type: String, required: true },
  date: [{ type: Date, required: true }],
  heureDebut: { type: String, required: true },
  heureFin: { type: String, required: true },
  lieu: { type: String, required: true },
  nbr_repetition: { type: Number },
  // pourcentagesPupitres: [
  //   {
  //     pupitre: { type: Schema.Types.ObjectId, ref: "Pupitre" },
  //     selectedChoristes: [
  //       {
  //         _id: { type: Schema.Types.ObjectId, ref: "User" },
  //         nom: { type: String },
  //         prenom: { type: String },
  //       },
  //     ],
  //   },
  // ],
  pupitreInstances: [
    {
      tessiture: { type: String, required: true },
      pupitre: { type: Schema.Types.ObjectId, ref: "Pupitre" },
      choristes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
  ],
  programme: { type: Schema.Types.ObjectId, ref: "Programme" },
  concert: { type: mongoose.Schema.Types.ObjectId, ref: "Concert" },
  saison: { type: mongoose.Schema.Types.ObjectId, ref: "Saison" },
});

const Repetition = mongoose.model("Repetition", RepetitionSchema);

module.exports = Repetition;
