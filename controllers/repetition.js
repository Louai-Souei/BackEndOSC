const cron = require("node-cron");
const { format } = require("date-fns");
const { CronJob } = require("cron");
const nodemailer = require("nodemailer");
const Repetition = require("../models/repetition");
const Pupitre = require("../models/pupitre");
const Absence = require("../models/absence");
const QRCode = require("qrcode");
const User = require("../models/utilisateurs");
const Concert = require("../models/concert");
const AbsenceRequest = require("../models/absence");
const socket = require("../socket");
const mongoose = require("mongoose");
const { onlineUsers, io } = require("../socket/socketServer");

const {
  sendNotification,
  addNotification,
} = require("./notificationController");

const testnotif = async (req, res, next) => {
  try {
    const existingUser = onlineUsers.find(
      (user) => user.userId === "66047b7d24327717986ce549"
    );
    if (existingUser) {
      const req = {
        notificationdetails: {
          userSocketId: existingUser.socketId,
          notif_body: `RAPPEL : un rendez-vous est programmé pour aujourd'hui`,
        },
      };

      await sendNotification(req, null, async () => {
        res.status(200).json({ message: "Utilisateurs récupérés avec succès" });
      });
    }
    const data = {
      body: {
        userId: "66047b7d24327717986ce549",
        newMessage: `RAPPEL : un rendez-vous est programmé pour`,
      },
    };

    await addNotification(data, null, async () => {
      res.status(200).json({ message: "Utilisateurs récupérés avec succès" });
    });
  } catch (error) {
    if (res && res.status && res.json) {
      res
        .status(500)
        .json({ message: "Internal server error sending notification" });
    }
  }
};

const fetchRepetitions = (req, res) => {
  Repetition.find()
    .then((repetitions) => {
      res.status(200).json({
        repetitions: repetitions,
        message: "Succès - Répétitions récupérées",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "Échec de récupération des répétitions",
      });
    });
};

const addRepetitionn = async (req, res) => {
  const id = req.params.id;

  try {
    const newRepetition = new Repetition(req.body);
    const pupitreInstances = [];

    const {
      pourcentageAlto,
      pourcentageSoprano,
      pourcentageTenor,
      pourcentageBasse,
    } = req.body;

    const tessitures = ["Alto", "Soprano", "Tenor", "Basse"];

    const pourcentages = {
      Alto: pourcentageAlto || 0,
      Soprano: pourcentageSoprano || 0,
      Tenor: pourcentageTenor || 0,
      Basse: pourcentageBasse || 0,
    };

    for (const tessiture of tessitures) {
      const pourcentage = pourcentages[tessiture];

      if (pourcentage > 0) {
        const choristes = await User.find({ role: "choriste", tessiture });

        const nombreChoristes = Math.ceil(
          (pourcentage / 100) * choristes.length
        );
        const selectedChoristes = choristes
          .slice(0, nombreChoristes)
          .map((choriste) => choriste._id);

        const newPupitreInstance = {
          tessiture,
          pupitre: id,
          choristes: selectedChoristes,
        };

        pupitreInstances.push(newPupitreInstance);
      }
    }

    newRepetition.pupitreInstances = pupitreInstances;

    await newRepetition.save();
    await QRCode.toFile(
      `./imageQR/qrcode-${newRepetition._id}.png`,
      `http://localhost:5000/api/repetitions/${newRepetition._id}/confirmerpresence`,
      {
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      }
    );

    const concert = await Concert.findOne({ _id: id });
    if (!concert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    concert.repetition.push(newRepetition);
    await Concert.findByIdAndUpdate(
      id,
      {
        repetition: concert.repetition,
      },
      { new: true }
    );

    return res.status(200).json({
      repetition: newRepetition,
      pupitreInstances,
      message:
        "Répétition ajoutée avec succès et les choristes sélectionnés enregistrés",
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
      message: "Échec d'ajout de la répétition",
    });
  }
};

const addRepetition = async (req, res) => {
  try {
    const newRepetition = new Repetition(req.body);
    await newRepetition.save();
    // await QRCode.toFile(
    //   `./image QR/qrcode-qrcode-${newRepetition._id}.png`,
    //   `http://localhost:5000/api/repetitions/${newRepetition._id}/confirmerpresence`,
    //   {
    //     color: {
    //       dark: "#000000",
    //       light: "#ffffff",
    //     },
    //   }
    // );

    await QRCode.toFile(
      `./imageQR/qrcode-${newRepetition._id}.png`,
      `http://localhost:5000/api/repetitions/${newRepetition._id}/confirmerpresence`,
      {
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      }
    );

    res.status(200).json({
      repetition: newRepetition,
      message: "Répétition ajoutée avec succès",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: "Échec d'ajout de la répétition",
    });
  }
};

const getRepetitionById = (req, res) => {
  Concert.findById(req.params.id)
    .populate({
      path: "repetition",
      populate: {
        path: "pupitreInstances.choristes",
        options: { strictPopulate: false },
        model: "User",
        select: "nom prenom",
      },
    })
    .then((concert) => {
      if (!concert) {
        res.status(404).json({
          message: "Concert non trouvé",
        });
      } else {
        res.status(200).json({
          repetitions: concert.repetition,
          message: "Répétitions récupérées avec succès",
        });
      }
    })
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "Échec de récupération du concert par ID",
      });
    });
};

const getRRepetitionById = async (req, res) => {
  try {
    const id = req.params.id;
    const repetitionId = req.params.repetitionId;

    console.log("id:", id);
    console.log("repetitionId:", repetitionId);
    const concert = await Concert.findById(id);
    if (!concert) {
      return res.status(404).json({ message: "Concert non trouvé" });
    }
    const repetition = await Repetition.findById(repetitionId);
    if (!repetition) {
      return res.status(404).json({ message: "Répétition non trouvée" });
    }
    concert.repetition = concert.repetition.filter(
      (c) => c._id != repetitionId
    );
    const retrievedRepetition = await Repetition.findById(
      repetitionId
    ).populate({
      path: "pupitreInstances.choristes",
      model: "User",
      select: "nom prenom",
    });
    if (!retrievedRepetition) {
      return res.status(404).json({ message: "Répétition non trouvée" });
    }
    res.status(200).json({
      repetition: retrievedRepetition,
      message: "Répétition récupérée avec succès",
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
      message: "Échec de récupération de la répétition par ID",
    });
  }
};

const updateRepetition = async (req, res) => {
  try {
    const concertId = req.params.concertId;
    const repetitionId = req.params.repetitionId;

    const concert = await Concert.findById(concertId);
    if (!concert) {
      return res.status(404).json({ message: "Concert not found" });
    }
    const repetition = await Repetition.findByIdAndUpdate(
      repetitionId,
      req.body,
      { new: true }
    );
    if (!repetition) {
      return res.status(404).json({ message: "Repetition not found" });
    }

    const index = concert.repetition.findIndex((c) => c._id == repetitionId);
    if (index !== -1) {
      concert.repetition[index] = repetition;
    }

    await concert.save();

    res
      .status(200)
      .json({ message: "Repetition updated successfully", repetition });
  } catch (e) {
    res.status(500).json({
      message: "Server Error",
      error: e.message,
    });
  }
};

const deleteRepetition = async (req, res) => {
  try {
    const concertId = req.params.concertId;
    const repetitionId = req.params.repetitionId;
    const concert = await Concert.findById(concertId);
    if (!concert) {
      res.status(404).json({ message: "Not Found" });
    }
    const repetition = await Repetition.findById(repetitionId);
    if (!repetition) {
      res.status(404).status({ message: "repetion not found" });
    }
    concert.repetition = concert.repetition.filter(
      (c) => c._id != repetitionId
    );
    await Repetition.findByIdAndDelete(repetitionId);
    await concert.save();
  } catch (e) {
    res.status(500).json({
      message: "Server Error",
      error: e.message,
    });
  }

  // .catch((error) => {
  //   return res.status(500).json({ error: error.message });
  // });
};

const generatePupitreList = async (req, res) => {
  const { pourcentagePersonnes } = req.body;

  try {
    const repetitions = await Repetition.find();
    const pupitreInstances = [];

    for (const repetition of repetitions) {
      const pourcentage = pourcentagePersonnes || 100;

      for (const pupitre of repetition.pourcentagesPupitres) {
        const pupitreId = pupitre.pupitre;

        const choristes = await User.find({ role: "choriste" });
        const nombreChoristes = Math.ceil(
          (pourcentage / 100) * choristes.length
        );
        const selectedChoristes = choristes
          .slice(0, nombreChoristes)
          .map((choriste) => ({
            _id: choriste._id,
            nom: choriste.nom,
            prenom: choriste.prenom,
          }));

        const repetitionInfo = {
          repetitionId: repetition._id,
          date: repetition.date,
          lieu: repetition.lieu,
          heureDebut: repetition.heureDebut,
          heureFin: repetition.heureFin,
          repetitionPercentage: pourcentage,
        };

        const newPupitreInstance = {
          repetitionInfo,
          pupitreId,
          selectedChoristes,
        };

        pupitreInstances.push(newPupitreInstance);
      }
    }

    res.status(200).json(pupitreInstances);
  } catch (err) {
    console.error("Erreur lors de la génération des pupitres :", err);
    res.status(500).json({ message: err.message });
  }
};

const confirmerpresenceRepetition = async (req, res) => {
  try {
    const { id } = req.params;
    const repetition = await Repetition.findById(id);

    if (!repetition) {
      return res.status(404).json({ message: "Répétition non trouvée!" });
    } else {
      const { userid } = req.body;
      const absence = await Absence.create({
        user: userid,
        status: "present",
        repetition: id,
      });

      if (!absence) {
        return res.status(404).json({ message: "Présence échouée" });
      } else {
        return res.status(200).json({ message: "Présence enregistrée" });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const envoyerNotificationChoristes = async () => {
  try {
    const choristes = await User.find({
      role: "choriste",
      estEnConge: false,
    });

    if (choristes.length > 0) {
      const maintenant = new Date();
      console.log("Maintenant:", maintenant);

      const dateDans24h = new Date(maintenant.getTime() + 24 * 60 * 60 * 1000);
      console.log("Date dans 24 heures:", dateDans24h);

      const repetitionsDans24h = await Repetition.find({
        date: { $gte: maintenant, $lt: dateDans24h },
      });

      console.log(
        "Répétitions dans les 24 heures suivantes:",
        repetitionsDans24h
      );

      if (repetitionsDans24h.length > 0) {
        // Envoyer  notifications  aux choristes
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "wechcrialotfi@gmail.com",
            pass: "sgpt snms vtum ifph",
          },
        });

        for (const choriste of choristes) {
          const contenuEmail = `
                      Bonjour ${choriste.nom},

                      Vous avez une répétition dans les 24 heures suivantes. Voici les détails :

                      Date de la répétition : ${repetitionsDans24h[0].date}
                      Heure de début : ${repetitionsDans24h[0].heureDebut}
                      Heure de fin : ${repetitionsDans24h[0].heureFin}
                      Lieu : ${repetitionsDans24h[0].lieu}

                      Merci et à bientôt !
                  `;

          await transporter.sendMail({
            from: "wechcrialotfi@gmail.com",
            to: choriste.email,
            subject: "Notification importante - Répétition à venir",
            text: contenuEmail,
          });

          console.log(`Notification envoyée à ${choriste.email}`);
        }
      } else {
        console.log("Aucune répétition dans les 24 heures suivantes.");
      }
    } else {
      console.log("Aucun choriste à notifier.");
    }
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi des notifications aux choristes :",
      error.message
    );
  }
};
cron.schedule("0 12 * * *", async () => {
  await envoyerNotificationChoristes();

  console.log("Tâche cron exécutée.");
});

const consulterEtatAbsencesRepetitions = async (req, res) => {
  try {
    const filter = {};

    if (req.query.dateprécise) {
      filter.date = new Date(req.query.dateprécise);
    }

    if (req.query.dateDebut) {
      filter.date = { $gte: new Date(req.query.dateDebut) };
    }

    if (req.query.dateFin) {
      filter.date = { $lte: new Date(req.query.dateFin) };
    }

    const repetitions = await Repetition.find(filter).populate("participant");

    const result = await Promise.all(
      repetitions.map(async (repetition) => {
        const absentMembers = await Promise.all(
          repetition.participant.map(async (participant) => {
            const isAbsent = await hasAbsentRequestForRepetition(
              participant,
              repetition
            );
            return isAbsent
              ? {
                  _id: participant._id.toString(),
                  nom: participant.nom,
                  prenom: participant.prenom,
                }
              : null;
          })
        );

        return {
          repetition: {
            _id: repetition._id.toString(),
            lieu: repetition.lieu,
            date: repetition.date,
            heureDebut: repetition.heureDebut,
            heureFin: repetition.heureFin,
          },
          absentMembers: absentMembers.filter(
            (absentMember) => absentMember !== null
          ),
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const hasAbsentRequestForRepetition = async (participant, repetition) => {
  const absenceData = await AbsenceRequest.findOne({
    user: participant._id,
    repetition: repetition._id,
    status: "absent",
  });

  return !!absenceData;
};

const ajouterPresenceManuelleRepetition = async (req, res) => {
  try {
    const { id } = req.params;
    const { choristeId, raison } = req.body;
    const repetition = await Repetition.findById(id);

    if (!repetition) {
      return res.status(404).json({ message: "Répétition non trouvée!" });
    }

    const existingParticipant = repetition.participant.find(
      (participant) => participant.toString() === choristeId
    );

    if (existingParticipant) {
      return res
        .status(400)
        .json({ message: "Ce choriste participe déjà à cette répétition." });
    }
    repetition.participant.push({
      user: choristeId,
      participation: true,
      raison: raison,
    });
    await repetition.save();

    res.status(200).json({
      message:
        "Participation ajoutée manuellement avec succès à la répétition.",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  ajouterPresenceManuelleRepetition,
  fetchRepetitions: fetchRepetitions,
  addRepetition: addRepetition,
  getRepetitionById: getRepetitionById,
  updateRepetition: updateRepetition,
  deleteRepetition: deleteRepetition,
  generatePupitreList: generatePupitreList,
  envoyerNotificationChoristes,
  confirmerpresenceRepetition: confirmerpresenceRepetition,
  addRepetitionn,
  consulterEtatAbsencesRepetitions,
  testnotif,
  getRRepetitionById,
};
