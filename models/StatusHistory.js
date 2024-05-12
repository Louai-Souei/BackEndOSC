const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StatusHistorySchema = new Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ancienStatus: { type: String },
  nouveauStatus: { type: String },
  nbsaison: { type: Number },
  date: { type: Date, default: Date.now },
});

const StatusHistory = mongoose.model("StatusHistory", StatusHistorySchema);

module.exports = StatusHistory;
