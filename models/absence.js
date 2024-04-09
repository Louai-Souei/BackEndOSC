const mongoose = require('mongoose');
const Saison = require("./saison");
const Schema = mongoose.Schema;


const AbsenceRequestSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:  { type: String, enum: ['absent', 'present']},
  reason: { type: String, required: function() { return this.status === 'absent'; } },
 
  repetition: { type: mongoose.Schema.Types.ObjectId, ref: 'repetition' },
  concert: { type: mongoose.Schema.Types.ObjectId, ref: 'Concert'},

  approved: {type: Boolean,default:false},
  absence: [{ type: Date }], 

  //dates: [{ type: Date  }],

  //type: { type: String, enum: ['repetition','concert'], required: true }
  approved: {type: Boolean,default:false},
  saison : {type: mongoose.Schema.Types.ObjectId, ref: 'Saison' },
  // reason manuelle 
});
AbsenceRequestSchema.pre("save", async function (next) {
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



const AbsenceRequest = mongoose.model('AbsenceRequest', AbsenceRequestSchema);
module.exports = AbsenceRequest;