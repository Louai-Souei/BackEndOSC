const mongoose = require('mongoose');

const saisonSchema = new mongoose.Schema({
  titre: { type: String, required: true, },
  Datedebut: { type: Date, required: true,},
  Datefin: {   type: Date,  required: true,},
  concerts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Concert' }],
  repetitions: [{ type: mongoose.Schema.Types.ObjectId,  ref: 'Repetition' }],
  oeuvres: [{  type: mongoose.Schema.Types.ObjectId,ref: 'oeuvres' }],
  auditions: [{type: mongoose.Schema.Types.ObjectId,ref: 'Audition'  }],
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
});

const Saison = mongoose.model('Saison', saisonSchema);

module.exports = Saison;
