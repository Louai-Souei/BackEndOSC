const AbsenceRequest = require('../models/absence');
const Pupitre = require('../models/pupitre');
const Repetition = require('../models/repetition');
const Concert = require('../models/concert');
const User = require('../models/utilisateurs');

const informerAbsence = (req, res) => {
  const { eventType, eventDate, reason } = req.body;
  const userId = req.auth.userId;
  if (!eventType || !eventDate || !reason) {
    return res.status(400).json({ success: false, message: 'Les données requises sont manquantes dans le corps de la requête' });
  }

  let userObj;
  let eventObj;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      userObj = user;

      let eventModel;

      if (eventType === 'repetition') {
        eventModel = Repetition;
      } else if (eventType === 'concert') {
        eventModel = Concert;
      } else {
        throw new Error('Type d\'événement invalide');
      }

      return eventModel.findOne({ date: eventDate });
    })
    .then((event) => {
      if (!event) {
        throw new Error(`Aucun événement prévu pour la date spécifiée`);
      }

      eventObj = event;

      const absenceRequest = new AbsenceRequest({
        user: userObj._id,
        nom: userObj.nom, 
        status: 'absent',
        reason: reason,
        repetition: eventType === 'repetition' ? event._id : null,
        concert: eventType === 'concert' ? event._id : null,
        approved: false,
      });

      return absenceRequest.save();
    })
    .then((savedRequest) => {
      return res.status(201).json({ success: true, message: 'Demande d\'absence créée avec succès', savedRequest });
    })
    .catch((error) => {
      return res.status(500).json({ success: false, message: error.message });
    });
};


const createAbsenceRequest = async (req, res) => {
  try {
    const { userId, reason, dates, type } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' }); 
    }

    const absenceRequest = new AbsenceRequest({ user: userId, reason, dates, type });
    //sauvegarde f base
    await absenceRequest.save();

    res.status(201).json({ message: 'Demande d\'absence créée avec succès', absenceRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAbsenceRequestsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const absenceRequests = await AbsenceRequest.find({ User: userId }).populate('user');
    res.status(200).json(absenceRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createAbsence = async (req, res) => {
  try {
    const { user, status, reason, repetition, concert, approved } = req.body;

    const newAbsenceRequest = new AbsenceRequest({
      user,
      status,
      reason,
      repetition,
      concert,
      approved,
    });

    const savedAbsenceRequest = await newAbsenceRequest.save();

    res.status(201).json(savedAbsenceRequest);
  } catch (error) {
    console.error('Erreur lors de la création de l\'absence request :', error.message);
    res.status(500).json({ error: 'Erreur lors de la création de l\'absence request' });
  }
};

const getChoristesByRepetitionAndPupitre = async (req, res) => {
  try {
    const repetitionId = req.params.repetitionId;
    const tessiture = req.params.tessiture;


    const choristes = await AbsenceRequest.find({
      repetition: repetitionId,
      status: 'present',
    }).populate('user', '_id nom prenom email');


    const filteredChoristes = await Promise.all(
      choristes.map(async (absence) => {
        const pupitre = await Pupitre.findOne({ choristes: absence.user._id });

        if (pupitre && pupitre.tessiture === tessiture) {
          return {
            tessiture: tessiture,
            Participants: {
              _id: absence.user._id,
              nom: absence.user.nom,
              prenom: absence.user.prenom,
              email: absence.user.email,
            }
          };
        }
        return null; 
      })
    );

    const choristesAvecTessiture = filteredChoristes.filter(choriste => choriste !== null);

    const groupedChoristes = choristesAvecTessiture.reduce((acc, choriste) => {
      const { tessiture, Participants } = choriste;
      if (!acc[tessiture]) {
        acc[tessiture] = { tessiture, Participants: [] };
      }
      acc[tessiture].Participants.push(Participants);
      return acc;
    }, {});

    const result = Object.values(groupedChoristes);

    res.status(200).json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des choristes par répétition :', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des choristes par répétition' });
  }
};




const getChoristesByConcertAndPupitre = async (req, res) => {
  try {
    const concertId = req.params.concertId;

    const choristes = await AbsenceRequest.find({
      concert: concertId,
      status: 'present',
    }).populate('user', 'nom prenom _id');

    const pupitres = await Pupitre.find().populate('choristes');

    const utilisateursParPupitre = new Map();


    pupitres.forEach((pupitre) => {
      pupitre.choristes.forEach((choriste) => {
        utilisateursParPupitre.set(choriste._id.toString(), pupitre.tessiture);
      });
    });

    const groupedUsersByPupitre = {};
    const tauxAbsenceParPupitre = {};

    pupitres.forEach((pupitre) => {
      const totalMembres = pupitre.choristes.length;
      const membresAbsents = choristes.filter(
        (choriste) => choriste.user && utilisateursParPupitre.get(choriste.user._id.toString()) === pupitre.tessiture
      ).length;

      const tauxAbsence = totalMembres > 0 ? ((membresAbsents / totalMembres) * 100).toFixed(2) + "%" : "0%";
      tauxAbsenceParPupitre[pupitre.tessiture] = tauxAbsence;

      groupedUsersByPupitre[pupitre.tessiture] = {};
    });
    

    choristes.forEach((choriste) => {
      const utilisateurId = choriste.user._id.toString();
      const pupitreTessiture = utilisateursParPupitre.get(utilisateurId);

      if (pupitreTessiture) {
        if (!groupedUsersByPupitre[pupitreTessiture][utilisateurId]) {
          groupedUsersByPupitre[pupitreTessiture][utilisateurId] = {
            id: choriste.user._id,
            nom: choriste.user.nom,
            prenom: choriste.user.prenom,
            Nb_presence: 0,
            Nb_absence: 0,
          };
        }

        groupedUsersByPupitre[pupitreTessiture][utilisateurId][choriste.status === 'present' ? 'Nb_presence' : 'Nb_absence']++;
      }
    });


    Object.keys(groupedUsersByPupitre).forEach((pupitreTessiture) => {
      const utilisateursArray = Object.values(groupedUsersByPupitre[pupitreTessiture]);
      utilisateursArray.sort((a, b) => b.Nb_presence - a.Nb_presence);
      groupedUsersByPupitre[pupitreTessiture] = utilisateursArray;
    });

    res.status(200).json({
      "Participants par pupitre": groupedUsersByPupitre,
      "Taux d'absence par pupitre": tauxAbsenceParPupitre,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports={
  createAbsenceRequest,
  getAbsenceRequestsByUser,
  createAbsence,
  getChoristesByRepetitionAndPupitre,
  getChoristesByConcertAndPupitre,
  informerAbsence
}