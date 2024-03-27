const mongoose = require('mongoose');
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
  approved: {type: Boolean,default:false}
  // reason manuelle 
});



const AbsenceRequest = mongoose.model('AbsenceRequest', AbsenceRequestSchema);
module.exports = AbsenceRequest;