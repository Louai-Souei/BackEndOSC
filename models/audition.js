const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuditionSchema = new Schema({
    date_audition:{ type: Date },
    heure_debut:{ type: Date },
    heure_fin :{ type: Date },
    evenementAudition: { type: mongoose.Schema.Types.ObjectId, ref: 'evenementAudition' },
    candidat: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidat' },
    extraitChante : { type: String },
    tessiture: {
        type: String,
        enum: ['Soprano', 'Alto', 'Ténor','Basse','Autre']
    },
    evaluation : { 
        type : String,
        enum: ["A","B","C"] },
    decisioneventuelle :{ type: String,
        enum:["retenu","en attente","refuse"] ,       
        default:"en attente"},
    remarque : { type: String},
   });
const Audition= mongoose.model('Audition', AuditionSchema);
module.exports = Audition;