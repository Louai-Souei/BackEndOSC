const nodemailer = require('nodemailer');
const User=require('../models/utilisateurs')
const Absence = require('../models/absence');
const { io } = require('../socket.js');
const { CronJob } = require('cron');
require('dotenv').config();

const getAllAbsences = async () => {
    try {
      const absence = await Absence.find({approved}); 
      
      return absence; 
    } catch (error) {
      console.error(error);
      throw new Error('Erreur lors de la récupération de toutes les absences.');
    }
  };

  const getChoristedepasseseuil = async (req, res) => {
    try {
      const seuil = req.params.seuil; 
  
      const choristes = await User.find({}); 
  
      const filteredChoristes = await Promise.all(
        choristes.map(async (choriste) => {
          if (choriste.absencecount > seuil) {
            // Éliminer le choriste pour absences excessives
            choriste.elimination = 'elimine';
            choriste.eliminationReason = `Dépassement du taux d'absences (${choriste.absence} absences)`;
            await choriste.save();
  
            return {
              _id: choriste._id,
              nom: choriste.nom,
              prenom: choriste.prenom,
              email: choriste.email,
              eliminationReason: choriste.eliminationReason,
            };
          }
          return null;
        })
      );
  
      const choristesElimines = filteredChoristes.filter(choriste => choriste !== null);
      if (choristesElimines.length === 0) {
        return res.status(200).json({ message: 'Aucun choriste ne dépasse le seuil d\'absences.' });
      }
  
      res.status(200).json(choristesElimines);
    } catch (error) {
      console.error('Erreur lors de la gestion des choristes par élimination pour absences excessives :', error.message);
      res.status(500).json({ error: 'Erreur lors de la gestion des choristes par élimination pour absences excessives' });
    }
  }; 
  const envoyermailnominé = async (email, subject, message) => {
          
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", 
      port: 465, 
      secure: true, 
      auth: {
          user: "ttwejden@gmail.com", 
          pass: "vxcn ynmf ovcp gwij", 
      },
  });
  
    
    let mailOptions = {
      from: 'ttwejden@gmail.com', // Adresse e-mail de l'expéditeur
      to: email, 
      subject: subject, 
      text: message, 
      // html: '<p>vous êtes nominés d'être éliminés veuillez expliquer</p>', //
    };
  
    try {
      // Envoi de l'e-mail
      await transporter.sendMail(mailOptions);
      console.log('E-mail envoyé avec succès au choriste nominé.');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
      throw new Error('Erreur lors de l\'envoi de l\'e-mail au choriste nominé.');
    }
  };
  //envoi notification NOMINATION

  const gestionAbsencesExcessives = async (req, res) => {
    try {
      const seuil = parseInt(req.query.seuil);
  
      if (isNaN(seuil)) {
        return res.status(400).json({ error: 'Le seuil fourni n\'est pas valide.' });
      }
  
      const tousLesChoristes = await User.find({ role: 'choriste' });
      for (const choriste of tousLesChoristes) {
        if (choriste.absencecount > seuil) {
          choriste.elimination = 'nomine';
          await choriste.save();
          await envoyermailnominé(choriste.email, 'Notification de nomination', 'Vous êtes nominé en raison de vos absences excessives.'); 
        }
      }
  
      res.status(200).json({ message: 'Traitement des absences effectué avec succès.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors du traitement des absences.' });
    }
  };
  

//envoi notification ELIMINATION

const eliminationExcessiveAbsences = async (req, res) => {
  const { userId, seuil } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }

    const absences = user.absencecount;
    if (absences > seuil) {
      user.elimination = 'elimine';
      user.eliminationReason = `Dépassement du taux d'absences (${absences} absences)`;
      await user.save();
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", 
        port: 465, 
        secure: true, 
        auth: {
            user: "ttwejden@gmail.com", 
            pass: "vxcn ynmf ovcp gwij", 
        },
    });

      const mailOptions = {
        from: 'ttwejden@gmail.com',
        to: user.email, 
        subject: 'Notification d\'élimination pour absences excessives',
        text: `Bonjour ${user.prenom},\nVous avez été éliminé en raison d'un dépassement du taux d'absences.\nRaison: ${user.eliminationReason}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
        } else {
          console.log('E-mail envoyé:', info.response);
        }
      });

      return res.status(200).json({ success: true, message: 'Utilisateur éliminé pour absences excessives.' });
    }

    return res.status(400).json({ success: false, message: 'Le nombre d\'absences est inférieur au seuil requis.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Erreur lors de l\'élimination pour absences excessives.' });
  }
};


//let choristesElimines = [];

const notifieradminChoristeseliminés = async () => {
  try {
    const choristesÉliminés = await User.find({
      elimination: 'elimine',
      count: { $ne: 0 } // Recherchez count différent de zéro
    }).select('_id email nom prenom elimination role');

    return choristesÉliminés;
  } catch (error) {
    console.error(error);
    throw new Error('Erreur lors de la récupération des choristes éliminés.');
  }
};

//liste nominés

const getChoristesNominés = async (req, res, next) => {
  try {
    const choristesNominés = await User.find({ elimination: 'nomine' }).select('_id email nom prenom elimination role');
    const count = choristesNominés.length;
    //const absencecount =choristesNominés.absencecount;

    if (count === 0 ) {
      return res.status(404).json({ success: false, message: 'Aucun choriste nominé trouvé.' });
    }

    res.status(200).json({ success: true, count, data: choristesNominés });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des choristes nominés.' });
  }
};

//liste eliminés

const getChoristesÉliminés = async (req, res, next) => {
  try {
    const choristesÉliminés = await User.find({ elimination: 'elimine' }).select('_id email nom prenom elimination role');
    const count = choristesÉliminés.length;

    if (count === 0) {
      return res.status(404).json({ success: false, message: 'Aucun choriste éliminé trouvé.' });
    }

    res.status(200).json({ success: true, count, data: choristesÉliminés });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des choristes éliminés.' });
  }
};


//discipline
const eliminationDiscipline = async (req, res) => {
  const { userId, reason } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }

    user.elimination = 'elimine';
    user.eliminationReason = `Raison disciplinaire: ${reason}`;
    await user.save();

    // Send an email to the eliminated user
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", 
      port: 465, 
      secure: true, 
      auth: {
          user: "ttwejden@gmail.com", 
          pass: "vxcn ynmf ovcp gwij", 
      },
    });

    const mailOptions = {
      from: 'ttwejden@gmail.com',
      to: user.email,
      subject: 'Notification d\'élimination pour raison disciplinaire',
      text: `Bonjour ${user.prenom},\nVous avez été éliminé pour la raison suivante: ${user.eliminationReason}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
      } else {
        console.log('E-mail envoyé:', info.response);
      }
    });

    return res.status(200).json({ success: true, message: 'Utilisateur éliminé pour raison disciplinaire.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Erreur lors de l\'élimination pour raison disciplinaire.' });
  }
};


const notifierNominés = async () => {
  try {
    // Recherche des utilisateurs nominés
    const nominés = await User.find({ elimination: 'nomine' }).select('_id email nom prenom elimination role');

    if (nominés.length > 0) {
      // Émettre des notifications vers les nominés via Socket.IO
      io.emit("notif-nominés", { message: "Vous êtes susceptibles d'être éliminés" });
    } else {
      console.log("Aucun nominé trouvé.");
    }
  } catch (error) {
    console.error("Erreur lors de la recherche des nominés:", error.message);
  }
};


const notifierElimines = async () => {
  try {
    // Recherche des utilisateurs nominés
    const nominés = await User.find({ elimination: 'elimine' }).select('_id email nom prenom elimination role');

    if (nominés.length > 0) {
      // Émettre des notifications vers les nominés via Socket.IO
      io.emit("notif-elimines", { message: "Vous êtes éliminés" });
    } else {
      console.log("Aucun eliminé trouvé.");
    }
  } catch (error) {
    console.error("Erreur lors de la recherche des nominés:", error.message);
  }
};


  module.exports = {
    getChoristedepasseseuil,
    getAllAbsences ,
    gestionAbsencesExcessives,
    envoyermailnominé ,
    getChoristesNominés,
    getChoristesÉliminés,
    eliminationDiscipline,
    eliminationExcessiveAbsences,
    notifieradminChoristeseliminés,
    notifierNominés ,
    notifierElimines

    
  };