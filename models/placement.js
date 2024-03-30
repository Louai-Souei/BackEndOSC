const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const placementSchema = new Schema({
  concertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Concert', required: true },
  placementDetails: { type: Schema.Types.Mixed }, 
});

const Placement = mongoose.model('Placement', placementSchema);
module.exports = Placement;



const changePasswordMiddleware = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  // Vérifiez les informations actuelles du mot de passe (à adapter selon votre implémentation)
  if (oldPassword !== user.password) {
    return res.status(401).send('Mot de passe actuel incorrect');
  }

  // Mettez à jour le mot de passe dans votre système (à adapter selon votre implémentation)
  user.password = newPassword;

  // Vous pouvez également mettre à jour le mot de passe dans votre base de données ici

  next();
};
