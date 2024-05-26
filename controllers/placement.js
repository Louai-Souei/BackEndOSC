const Concert = require("../models/concert");
const User = require("../models/utilisateurs");
const Placement = require("../models/placement");
const Pupitre = require("../models/pupitre");

exports.updateParticipantPosition = async (req, res) => {
  try {
    const concertId = req.params.id;
    const { participantName, newPosition } = req.body;

    const placement = await Placement.findOne({ concertId });

    if (!placement) {
      throw new Error("Placement not found");
    }

    const placementDetails = placement.placementDetails;
    const participantIndex = placementDetails.findIndex(
      (participant) => participant.participant === participantName
    );

    if (participantIndex === -1) {
      throw new Error("Participant not found in placement details");
    }
    placementDetails[participantIndex].position = newPosition;

    await Placement.findOneAndUpdate({ concertId }, { placementDetails });

    return res
      .status(200)
      .json({ message: "Participant position updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getPupitreIdByUserId = async (userId) => {
  try {
    // Recherche de l'utilisateur par ID
    const user = await User.findById(userId);

    if (!user) {
      return "Utilisateur non trouvé";
    }

    // Parcours de tous les pupitres
    const pupitres = await Pupitre.find();
    //console.log('pupitres: ', pupitres);

    for (const pupitre of pupitres) {
      // Vérifiez si l'utilisateur est associé à ce pupitre
      if (pupitre.choristes.includes(userId)) {
        // Si l'utilisateur est associé à ce pupitre, retournez l'ID du pupitre
        return pupitre;
      }
    }

    // Si l'utilisateur n'est pas associé à un pupitre, retournez un message d'erreur
    return "L'utilisateur n'est pas associé à un pupitre.";
  } catch (error) {
    return `Erreur lors de la récupération de l'ID du pupitre : ${error.message}`;
  }
};

exports.proposePlacementBySize = async (req, res) => {
  try {
    const concertId = req.params.id;
    const concert = await Concert.findById(concertId)
      .populate({
        path: "confirmations",
        match: { confirmation: true },
      })
      .exec();

    if (!concert) {
      throw new Error("Concert non trouvé");
    }

    const confirmations = concert.confirmations;

    if (!confirmations || confirmations.length === 0) {
      throw new Error("Aucun participant confirmé trouvé pour ce concert");
    }

    const participants = [];

    for (const confirmation of confirmations) {
      const participant = await User.findById(confirmation.choriste).exec();
      if (participant) {
        const pupitreResponse = await getPupitreIdByUserId(
          confirmation.choriste.toString()
        );
        if (pupitreResponse && pupitreResponse.tessiture) {
          participant.tessiture = pupitreResponse.tessiture;
        }
        participants.push(participant);
      }
    }

    const placementProposal = [];
    console.log('req.body: ', req.body);

    const nombreRangees = req.body.nombreRangees;
    console.log('nombreRangees: ', nombreRangees);

    const nombreChoristesParRangee = req.body.nombreChoristesParRangee;
    console.log('nombreChoristesParRangee: ', nombreChoristesParRangee);
    
    let positionCounter = 1; // Compteur de position global

    // Pour chaque rangée
    for (let rowCount = 1; rowCount <= nombreRangees; rowCount++) {
      // Pour chaque position dans la rangée
      for (
        let positionInRow = 1;
        positionInRow <= nombreChoristesParRangee;
        positionInRow++
      ) {
        const participantIndex =
          (rowCount - 1) * nombreChoristesParRangee + positionInRow - 1;
        if (participantIndex < participants.length) {
          placementProposal.push({
            participant: participants[participantIndex].name,
            taille_en_m: participants[participantIndex].taille_en_m,
            pupitre: participants[participantIndex].tessiture,
            position: `${rowCount}-${String.fromCharCode(64 + positionInRow)}`,
          });
          positionCounter++;
        }
      }
    }

    res.json({ placementProposal });
  } catch (error) {
    res
      .status(500)
      .json({
        error: `Erreur lors de la proposition et sauvegarde des détails de placement : ${error.message}`,
      });
  }
};


exports.annulerPlacement = async (req, res) => {
  try {
    const concertId = req.params.id;
    const placement = await Placement.findOne({ concertId });
    if (!placement) {
      return res
        .status(404)
        .json({ message: "Aucun placement trouvé pour ce concert." });
    }

    await Placement.deleteOne({ concertId });

    return res.status(200).json({ message: "Placement annulé avec succès." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
