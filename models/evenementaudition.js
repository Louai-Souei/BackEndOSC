const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EvenementAuditionSchema = new Schema({
    Date_debut_Audition: { type : Date , required : true},
    nombre_séance: { type : Number , required : true},
    dureeAudition: { type : String , required : true},
    Date_fin_Audition: { type : Date , required : true},
    date: { type: Date, required: true, default:Date.now() },
    lienFormulaire: { type: String},
  });
  
  const EvenementAudition = mongoose.model('EvenementAudition', EvenementAuditionSchema);
  module.exports = EvenementAudition;
