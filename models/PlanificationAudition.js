const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlanificationAuditionSchema = new Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true },
  date_audition: { type: String, required: true },
  heure_debut_audition: { type: String, required: true },
  heure_fin_audition: { type: String, required: true },
});

const PlanificationAudition = mongoose.model(
  "PlanificationAudition",
  PlanificationAuditionSchema
);
module.exports = PlanificationAudition;
