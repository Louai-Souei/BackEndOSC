const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const formulaireSchema = new Schema({
    titre: { type: String, required: true },
    designation: { type: String },
    date_Creation: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Formulaire", formulaireSchema);

