const AbsenceRequest = require("../models/absence");
const Pupitre = require("../models/pupitre");
const Repetition = require("../models/repetition");
const Concert = require("../models/concert");
const User = require("../models/utilisateurs");

const informerAbsence = (req, res) => {
  const { eventType, eventDate, reason } = req.body;
  const userId = req.auth.userId;
  if (!eventType || !eventDate || !reason) {
    return res.status(400).json({
      success: false,
      message:
        "Les données requises sont manquantes dans le corps de la requête",
    });
  }

  let userObj;
  let eventObj;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      userObj = user;

      let eventModel;

      if (eventType === "repetition") {
        eventModel = Repetition;
      } else if (eventType === "concert") {
        eventModel = Concert;
      } else {
        throw new Error("Type d'événement invalide");
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
        status: "absent",
        reason: reason,
        repetition: eventType === "repetition" ? event._id : null,
        concert: eventType === "concert" ? event._id : null,
        approved: false,
      });

      return absenceRequest.save();
    })
    .then((savedRequest) => {
      return res.status(201).json({
        success: true,
        message: "Demande d'absence créée avec succès",
        savedRequest,
      });
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
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const absenceRequest = new AbsenceRequest({
      user: userId,
      reason,
      dates,
      type,
    });
    //sauvegarde f base
    await absenceRequest.save();

    res
      .status(201)
      .json({ message: "Demande d'absence créée avec succès", absenceRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAbsenceRequestsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const absenceRequests = await AbsenceRequest.find({
      User: userId,
    }).populate("user");
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
    console.error(
      "Erreur lors de la création de l'absence request :",
      error.message
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la création de l'absence request" });
  }
};

const getChoristesByRepetitionAndPupitre = async (req, res) => {
  try {
    const repetitionId = req.params.repetitionId;
    const tessiture = req.params.tessiture;

    const choristes = await AbsenceRequest.find({
      repetition: repetitionId,
      status: "present",
    }).populate("user", "_id nom prenom email");

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
            },
          };
        }
        return null;
      })
    );

    const choristesAvecTessiture = filteredChoristes.filter(
      (choriste) => choriste !== null
    );

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
    console.error(
      "Erreur lors de la récupération des choristes par répétition :",
      error.message
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des choristes par répétition",
    });
  }
};

const getChoristesByConcertAndPupitre = async (req, res) => {
  try {
    const concertId = req.params.concertId;
    const concert = await Concert.findById(concertId).exec();

    if (!concert) {
      return res.status(404).json({ message: "Concert non trouvé!" });
    }

    const confirmations = concert.confirmations;
    const choristesParPupitre = {};

    for (const confirmation of confirmations) {
      if (confirmation.confirmation) {
        const choriste = await User.findById(confirmation.choriste).exec();

        if (!choriste) {
          continue;
        }

        const pupitre = await Pupitre.findOne({
          choristes: choriste._id,
        }).exec();

        if (!pupitre) {
          continue;
        }

        if (!choristesParPupitre[pupitre.tessiture]) {
          choristesParPupitre[pupitre.tessiture] = [];
        }

        const nbPresence = await countPresence(choriste._id);
        const nbAbsence = await countAbsence(choriste._id);

        // Ajout du champ 'invite' de chaque choriste
        const invite = confirmation.invite;

        choristesParPupitre[pupitre.tessiture].push({
          id: choriste._id,
          nom: choriste.nom,
          prenom: choriste.prenom,
          Nb_presence: nbPresence,
          Nb_absence: nbAbsence,
          invite: invite, // Champ invite ajouté
        });
      }
    }

    const tauxAbsenceParPupitre = {};

    for (const tessiture in choristesParPupitre) {
      const totalAbsences = choristesParPupitre[tessiture].reduce(
        (acc, choriste) => {
          return acc + choriste.Nb_absence;
        },
        0
      );

      const totalChoristes = choristesParPupitre[tessiture].length;

      const tauxAbsence =
        totalChoristes > 0
          ? ((totalAbsences / totalChoristes) * 100).toFixed(2) + "%"
          : "0%";

      tauxAbsenceParPupitre[tessiture] = tauxAbsence;
    }

    return res.status(200).json({
      "Participants par pupitre": choristesParPupitre,
      "Taux d'absence par pupitre": tauxAbsenceParPupitre,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const countPresence = async (userId) => {
  const concertsPresence = await Concert.countDocuments({
    confirmations: { $elemMatch: { choriste: userId, confirmation: true } },
  }).exec();

  const repetitionsPresence = await Repetition.countDocuments({
    participant: userId,
  }).exec();

  return concertsPresence + repetitionsPresence;
};

const countAbsence = async (userId) => {
  const concertsAbsence = await Concert.countDocuments({
    confirmations: { $elemMatch: { choriste: userId, confirmation: false } },
  }).exec();

  const repetitionsAbsence = await Repetition.countDocuments({
    participant: userId,
  }).exec();
  const concertsWithoutConfirmation = await Concert.countDocuments({
    confirmations: { $not: { $elemMatch: { choriste: userId } } }
  }).exec();

  const totalAbsence = concertsAbsence + repetitionsAbsence + concertsWithoutConfirmation;

  return totalAbsence;
};



const deleteParticipant = async (req, res) => {
  try {
    const participantId = req.params.participantId;
    const updatedAbsenceRequest = await AbsenceRequest.findOneAndUpdate(
      { user: participantId },
      { status: "absent" },
      { new: true }
    );

    if (!updatedAbsenceRequest) {
      return res.status(404).json({ message: "Demande d'absence non trouvée" });
    }

    res
      .status(200)
      .json({ message: "Participant marqué comme absent avec succès" });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Erreur lors de la mise à jour de la demande d'absence",
    });
  }
};

module.exports = {
  createAbsenceRequest,
  getAbsenceRequestsByUser,
  createAbsence,
  getChoristesByRepetitionAndPupitre,
  getChoristesByConcertAndPupitre,
  deleteParticipant,
  informerAbsence,
};
