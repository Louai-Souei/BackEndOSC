const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const verifmailSchema = new Schema({
    nom: { type: String, required: true },
    prenom : { type: String, required: true },
    email : {type: String, required:true},
    verified : {type: Boolean, default : false },
 
   
});


const Verifmail = mongoose.model('Verifmail', verifmailSchema);

module.exports = Verifmail;