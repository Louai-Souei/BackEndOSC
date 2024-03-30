const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pupitreSchema = new Schema({
    num_pupitre: { type: Number, required: true },
    tessiture: { type: String, enum: ['Soprano', 'Alto', 'Ténor', 'Basse'], required: true },
    besoin: { type: Number, required: true },
    choristes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    chefs : [{type:Schema.Types.ObjectId,ref:'User'}]
});

const Pupitre = mongoose.model('Pupitre', pupitreSchema);
module.exports = Pupitre;