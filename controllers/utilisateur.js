const User = require("../models/utilisateurs");
const StatusHistory = require("../models/StatusHistory");
const Concert = require("../models/concert");
const Repetition = require("../models/repetition");
const Absence = require("../models/absence");
const Saison = require("../models/saison");
const Oeuvre = require("../models/oeuvres");
const Joi = require("joi");



const {
  getChoristesNominés,
  getChoristesÉliminés,
} = require("../controllers/absenceElemination");

const getProfileAndStatusHistory = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé." });
    }

    const statusHistory = user.statusHistory || [];
    let currentStatus = "Inactif";
    let firstSeasonYear = null;

    if (statusHistory.length > 0) {
      firstSeasonYear = statusHistory[0].season;
    } else {
      const saisonActive = await Saison.findOne({ isActive: true });
      if (saisonActive) {
        firstSeasonYear = saisonActive.annee;
      } else {
        throw new Error("Aucune saison active trouvée.");
      }
    }

    const currentYear = new Date().getFullYear();
    const yearsOfMembership = currentYear - firstSeasonYear + 1;

    if (yearsOfMembership === 1) {
      currentStatus = "Choriste"; // Devient choriste la saison d'après la première
    } else if (
      yearsOfMembership === 3 &&
      (user.concertsValidated >= 10 || user.repetitionsValidated >= 20)
    ) {
      currentStatus = "Choriste Senior"; // Devient choriste senior après 3 ans et conditions validées
    } else if (firstSeasonYear === 2018) {
      currentStatus = "Veteran"; // Fait partie de la première promo
    } else {
      currentStatus = "Choriste Junior"; // Par défaut, considérez l'utilisateur comme un choriste junior
    }

    res.status(200).json({
      success: true,
      data: { profile: user.toPublic(), statusHistory, currentStatus },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getListeChoristes = async () => {
  try {
    const choristes = await User.find({ role: "choriste" });

    return choristes;
  } catch (error) {
    console.error(error);
    throw new Error(
      "Erreur lors de la récupération de la liste des choristes."
    );
  }
};
const voirProfilChoriste = async (idUser) => {
  try {
    const choriste = await User.findById(idUser);
    if (!choriste) {
      throw new Error("Choriste non trouvé.");
    }

    // Récupérer les informations du choriste
    // ...

    // Récupérer la liste des nominés et éliminés pour affichage dans le profil
    const choristesNominés = await getChoristesNominés();
    const choristesÉliminés = await getChoristesÉliminés();

    return {
      infosChoriste: choriste,
      choristesNominés,
      choristesÉliminés,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Erreur lors de la récupération du profil du choriste.");
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).exec();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé." });
    }

    const statusHistory = await StatusHistory.find({ utilisateur: userId })
      .sort({ date: "desc" })
      .exec();

    let currentStatus = "Inactif";

    if (!statusHistory || statusHistory.length === 0) {
      currentStatus = "Choriste Junior";
    } else {
      const latestStatus = statusHistory[0]; // Obtenez le statut le plus récent

      // Utilisez le nouveau statut le plus récent de statusHistory comme currentStatus
      currentStatus = latestStatus.nouveauStatus;
    }

    res.status(200).json({
      success: true,
      data: { profile: user.toPublic(), statusHistory, currentStatus },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const generateStatistics = async (req, res) => {
  try {
    const concerts = await Concert.find();

    const choristes = await User.find({ role: "choriste" });

    const statistiquesChoristes = [];

    for (const choriste of choristes) {
      let nbRepetitions = 0;
      let nbPresenceRepetitions = 0;
      let nbAbsenceRepetitions = 0;
      let nbPresenceConcerts = 0;
      let nbAbsenceConcerts = 0;
      let nbConcerts = 0;

      for (const concert of concerts) {
        const confirmation = concert.confirmations.find((conf) =>
          conf.choriste.equals(choriste._id)
        );

        if (confirmation) {
          nbConcerts++;

          if (confirmation.confirmation) {
            nbPresenceConcerts++;
          } else {
            nbAbsenceConcerts++;
          }
        }
      }

      const repetitionStatistiquesChoriste = await Repetition.aggregate([
        {
          $match: {
            participant: choriste._id,
          },
        },
        {
          $group: {
            _id: null,
            nbRepetitions: { $sum: "$nbr_repetition" },
            nbPresenceRepetitions: { $sum: 1 },
          },
        },
      ]);

      if (repetitionStatistiquesChoriste.length > 0) {
        nbRepetitions = repetitionStatistiquesChoriste[0].nbRepetitions;
        nbPresenceRepetitions =
          repetitionStatistiquesChoriste[0].nbPresenceRepetitions;
        nbAbsenceRepetitions = nbRepetitions - nbPresenceRepetitions;
      }

      statistiquesChoristes.push({
        idUtilisateur: choriste._id,
        nomUtilisateur: `${choriste.prenom} ${choriste.nom}`,
        nbRepetitions,
        nbPresenceRepetitions,
        nbAbsenceRepetitions,
        nbPresenceConcerts,
        nbAbsenceConcerts,
        nbConcerts,
      });
    }
    res.status(200).json({
      statistiquesChoristes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getChoristeActivityHistory = async (req, res) => {
  const memberId = req.params.choristeId;
  const oeuvreName = req.query.oeuvreName;

  try {
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    const concerts = await Concert.find({
      "confirmations.choriste": memberId,
      "confirmations.confirmation": true,
    }).populate({
      path: "programme._id",
      model: Oeuvre,
    });
    console.log(concerts);
    const filteredConcerts = oeuvreName
      ? concerts.filter((concert) =>
          concert.programme.some((item) => item._id.titre === oeuvreName)
        )
      : concerts;

    const repetitions = await Repetition.find({
      participant: memberId,
    });

    const response = {
      member_info: member,
      number_of_repetition: repetitions.length,
      number_of_concerts: filteredConcerts.length,
      concerts: filteredConcerts,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getUserActivityHistory = async (req, res) => {
  try {
    const userId = req.params.choristeId;

    const user = await User.findById(userId)
      .populate("absence")
      .populate("concerts") // Assurez-vous que "concerts" est correctement défini dans votre modèle d'utilisateur
      .populate("repetitions"); // Assurez-vous que "repetitions" est correctement défini dans votre modèle d'utilisateur

    // Vérifiez si l'utilisateur existe
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé." });
    }

    // Récupérez les détails d'activité de l'utilisateur
    const activityHistory = {
      absenceCount: user.absencecount,
      concertsValidated: user.concertsValidated,
      repetitionsValidated: user.repetitionsValidated,
      concerts: user.concerts, // Les détails des concerts auxquels l'utilisateur a participé
      // Ajoutez d'autres détails d'activité si nécessaire en fonction de votre modèle
    };

    res.status(200).json({ success: true, data: activityHistory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Validation du corps de la requête
const roleUpdateSchema = Joi.object({
  role: Joi.string()
    .valid("choriste", "manager de choeur", "chef de pupitre", "admin")
    .required(),
});

const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  // Valider le corps de la requête
  const { error } = roleUpdateSchema.validate({ role });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Rôle mis à jour avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du rôle de l'utilisateur :",
      error.message
    );
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la mise à jour du rôle" });
  }
};



module.exports = {
  getProfileAndStatusHistory,
  getProfile,
  getListeChoristes,
  voirProfilChoriste,
  getChoristeActivityHistory,
  generateStatistics,
  getUserActivityHistory,
  updateUserRole,
};
