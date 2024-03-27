const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const programmeSchema = new Schema({
    nom_programme: { type: String, required: true },
    oeuvres: [{ type: Schema.Types.ObjectId, ref: 'oeuvres' }]
});

const Programme = mongoose.model('Programme', programmeSchema);

module.exports = Programme ;