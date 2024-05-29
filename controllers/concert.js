const Concert = require("../models/concert");
const QRCode = require("qrcode");
const Absence = require("../models/absence");
const Excel = require("exceljs");
const Utilisateur = require("../models/utilisateurs");
const nodemailer = require("nodemailer");
const Repetition = require("../models/repetition");
const Programme = require("../models/programme");
const oeuvre = require("../models/oeuvres");
const concert_oeuvre_dto = require("../models/dtos/concert_oeuvre_dto");

const concertController = {
  sendEmailToPupitre: async (subject, content) => {
    try {
      // Récupérer l'adresse e-mail du chef de pupitre depuis la base de données
      const chefDePupitreEmail = await Utilisateur.getChefDePupitreEmail();

      if (!chefDePupitreEmail) {
        console.error(
          "Impossible de récupérer l'adresse e-mail du chef de pupitre."
        );
        return;
      }
      // Récupérer l'adresse e-mail du choriste depuis la base de données
      const choristeEmail = await Utilisateur.getChoristeEmail();

      if (!choristeEmail) {
        console.error("Impossible de récupérer l'adresse e-mail du choriste.");
        return;
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "namouchicyrine@gmail.com",
          pass: "tqdmvzynhcwsjsvy",
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: choristeEmail,
        to: chefDePupitreEmail,
        to: chefDePupitreEmail,
        to: chefDePupitreEmail,
        subject: subject,
        text: content,
      };

      await transporter.sendMail(mailOptions);
      console.log("E-mail envoyé avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail:", error.message);
      throw error;
    }
  },
  createConcert: async (req, res) => {
    try {
      const { presence, date, lieu, heure, programme, planning, nom_concert } =
        req.body;

      const existingConcert = await Concert.findOne({ date: date });

      if (existingConcert) {
        return res
          .status(400)
          .json({ message: "Un concert existe déjà à cette date." });
      }
      // if (!nom_concert) {
      //   return res
      //     .status(400)
      //     .json({ success: false, error: "Certains champs sont manquants." });
      // }

      const newConcert = await Concert.create(req.body);
      await QRCode.toFile(
        `./image QR/qrcode-${newConcert._id}.png`,
        `http://localhost:5000/api/concerts/${newConcert._id}/confirmerpresence`,
        {
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        }
      );

      res.status(201).json({ model: newConcert });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getAllConcerts: async (req, res) => {
    try {
      const concerts = await Concert.find().populate("programme");
      res.status(200).json(concerts);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getConcertById: async (req, res) => {
    try {
      const { id } = req.params;
      const concert = await Concert.findById(id);
      if (!concert) {
        return res.status(404).json({ message: "Concert non trouvé!" });
      }
      res.status(200).json({ model: concert });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  updateConcert: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedConcert = await Concert.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      res.status(200).json({ model: updatedConcert });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  deleteConcert: async (req, res) => {
    try {
      const { id } = req.params;
      await Concert.findByIdAndDelete(id);
      res.status(200).json({ model: {} });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // confirmerpresenceConcert: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const concert = await Concert.findById(id);

  //     if (!concert) {
  //       return res.status(404).json({ message: "concert non trouve!" });
  //     } else {
  //       const { userid } = req.body;
  //       const absence = await Absence.create({
  //         user: userid,
  //         status: "present",
  //         concert: id,
  //       });

  //       if (!absence) {
  //         return res.status(404).json({ message: "Présence échouée" });
  //       } else {
  //         return res.status(200).json({ message: "Présence enregistrée" });
  //       }
  //     }
  //   } catch (error) {
  //     res.status(500).json({ success: false, error: error.message });
  //   }
  // },

  confirmerpresenceConcert: async (req, res) => {
    try {
      const { id } = req.params;
      const concert = await Concert.findById(id);

      if (!concert) {
        return res.status(404).json({ message: "concert non trouve!" });
      } else {
        const { userid } = req.body;

        // Vérifier si la présence est déjà enregistrée
        const existingAbsence = await Absence.findOne({
          user: userid,
          status: "present",
          concert: id,
        });

        if (existingAbsence) {
          return res.status(400).json({ message: "Présence déjà enregistrée" });
        }

        const absence = await Absence.create({
          user: userid,
          status: "present",
          concert: id,
        });

        if (!absence) {
          return res.status(500).json({ message: "Présence échouée" });
        } else {
          return res.status(200).json({ message: "Présence enregistrée" });
        }
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  indiquerpresenceConcert: async (req, res) => {
    try {
      const { concertId } = req.params;
      const { userId } = req.body;

      const concert = await Concert.findById(concertId);

      if (!concert) {
        return res.status(404).json({ message: "Concert non trouvé!" });
      }

      const existingConfirmation = concert.confirmations.find(
        (conf) => conf.choriste.toString() === userId
      );

      if (existingConfirmation) {
        if (existingConfirmation.emailSent) {
          return res.status(400).json({
            message:
              "Vous avez déjà confirmé votre présence à ce concert et vous avez déjà reçu un e-mail.",
          });
        } else {
          // Mettre à jour la confirmation existante pour indiquer que l'e-mail a été envoyé
          existingConfirmation.emailSent = true;
          await concert.save();

          return res.status(200).json({
            message:
              "Vous avez déjà confirmé votre présence à ce concert. L'e-mail a déjà été envoyé au chef de pupitre.",
          });
        }
      }

      const utilisateur = await Utilisateur.findById(userId);

      if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur non trouvé!" });
      }

      concert.confirmations.push({
        choriste: utilisateur._id,
        confirmation: true,
        emailSent: true,
      });
      await concert.save();

      const emailSubject = `Confirmation de présence au concert ${concert.nom_concert}`;
      const emailContent = `Le choriste ${utilisateur.prenom} ${utilisateur.nom} a confirmé sa présence au concert ${concert.nom_concert}.`;

      // Simulating sendEmailToPupitre function for debugging
      console.log("Sending email to pupitre:", emailSubject, emailContent);

      // await sendEmailToPupitre(emailSubject, emailContent);

      res.status(200).json({
        message:
          "Présence confirmée avec succès. Un e-mail a été envoyé au chef de pupitre.",
      });
    } catch (error) {
      console.error("Erreur lors de la confirmation de présence :", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getConfirmedChoristesForConcert: async (req, res) => {
    try {
      const { id } = req.params;

      // Assurez-vous de trouver le concert par son identifiant
      const concert = await Concert.findById(id)
        .populate("confirmations.choriste", " _id nom prenom")
        .exec();

      if (!concert) {
        return res.status(404).json({ message: "Concert non trouvé!" });
      }
      console.log("Confirmations:", concert.confirmations);
      // Récupérez la liste des choristes confirmés pour ce concert
      const confirmedChoristes = concert.confirmations
        .filter((conf) => conf.confirmation)
        .map((conf) => conf.choriste);

      return res
        .status(200)
        .json({ "Confirmed Choristes": confirmedChoristes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // ajouterPresenceManuelle: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const { choristeId, raison } = req.body;
  //     const concert = await Concert.findById(id);
  //     if (!concert) {
  //       return res.status(404).json({ message: "Concert non trouvé!" });
  //     }
  //     const existingConfirmation = concert.confirmations.find(
  //       (conf) => conf.choriste.toString() === choristeId
  //     );
  //     if (existingConfirmation) {
  //       return res.status(400).json({
  //         message: "Ce choriste a déjà confirmé sa présence à ce concert.",
  //       });
  //     }
  //     concert.confirmations.push({
  //       choriste: choristeId,
  //       confirmation: true,
  //       raison: raison,
  //     });
  //     await concert.save();
  //     res
  //       .status(200)

  //       .json({ message: "Présence ajoutée manuellement avec succès." });
  //   } catch (error) {
  //     res.status(500).json({ success: false, error: error.message });
  //   }
  // },
  ajouterPresenceManuelle: async (req, res) => {
    try {
      const { id } = req.params;
      const { userid, reason } = req.body;

      const concert = await Concert.findById(id);
      if (!concert) {
        return res.status(404).json({ message: "Concert non trouvé!" });
      }

      // Vérifier si la présence est déjà enregistrée pour ce choriste et ce concert
      const existingAbsence = await Absence.findOne({
        user: userid,
        status: "present",
        concert: id,
      });

      if (existingAbsence) {
        return res.status(400).json({
          message: "Ce choriste a déjà confirmé sa présence à ce concert.",
        });
      }
      console.log("qqqq");
      // Enregistrer la présence
      const absence = await Absence.create({
        user: userid,
        status: "present",
        concert: id,
        reason: reason, // Ajouter la raison si elle est fournie
      });

      if (!absence) {
        return res.status(500).json({ message: "Présence échouée" });
      } else {
        return res
          .status(200)
          .json({ message: "Présence ajoutée manuellement avec succès." });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  calculateOeuvreStatistics: async (req, res) => {
    try {
      // Récupérer tous les concerts
      const concerts = await Concert.find().populate("programme");
      console.log(concerts);
      res.status(200).json(concerts);

      // Initialiser un objet pour stocker les statistiques des oeuvres
      const oeuvreStatistics = {};

      // Parcourir tous les concerts
      for (const concert of concerts) {
        // Récupérer le programme du concert
        const programme = await Programme.findById(concert.programme);
        if (!programme) {
          console.error(
            `Programme not found for concert with ID ${concert._id}`
          );
          continue;
        }

        // Parcourir toutes les oeuvres du programme
        for (const oeuvreId of programme.oeuvres) {
          // Vérifier si l'oeuvre est déjà présente dans les statistiques
          if (!oeuvreStatistics[oeuvreId]) {
            // Si l'oeuvre n'existe pas, l'ajouter avec un total de 1 pour ce concert
            oeuvreStatistics[oeuvreId] = {
              idOeuvre: oeuvreId,
              totalConcerts: 1,
            };
          } else {
            // Si l'oeuvre existe, incrémenter le total de concerts
            oeuvreStatistics[oeuvreId].totalConcerts++;
          }
        }
      }

      // Convertir l'objet des statistiques en un tableau
      const oeuvreStatisticsArray = Object.values(oeuvreStatistics);

      // Retourner les statistiques des oeuvres par concert dans la réponse
      res.status(200).json(oeuvreStatisticsArray);
    } catch (error) {
      console.error("Error calculating oeuvre statistics:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getConcertStatistics: async (req, res) => {
    try {
      // Obtenez tous les concerts
      const concerts = await Concert.find();

      // Obtenez la liste des répétitions liées à tous les concerts
      const repetitions = await Repetition.find({
        concert: { $in: concerts.map((c) => c._id) },
      });

      // Calculer les statistiques pour chaque concert
      const concertStatistics = [];
      for (const concert of concerts) {
        const concertStats = {
          concert: {
            _id: concert._id,
            nom: concert.nom,
            date: concert.date,
            heure: concert.heure,
            saison: concert.saison,
            lieu: concert.lieu,
            programme: concert.programme,
          },
          nbabsenceConcert: 0,
          nbpresenceConcert: 0,
          nbrepetitions: [],
          nbpresenceRepetitions: 0,
          nbabsenceRepetitions: 0,
        };

        // Calculer les statistiques de présence/absence pour chaque choriste
        for (const confirmation of concert.confirmations) {
          if (confirmation.confirmation) {
            concertStats.presenceConcert++;
          } else {
            concertStats.absenceConcert++;
          }
        }

        // Calculer les statistiques de présence/absence pour chaque répétition
        for (const repetition of repetitions) {
          const repetitionStats = {
            repetition: {
              date: repetition.date,
              lieu: repetition.lieu,
            },
            absence: 0,
            presence: 0,
          };

          for (const participantId of repetition.participant) {
            const confirmation = concert.confirmations.find((conf) =>
              conf.choriste.equals(participantId)
            );

            if (confirmation) {
              if (confirmation.confirmation) {
                repetitionStats.presence++;
              } else {
                repetitionStats.absence++;
              }
            }
          }

          concertStats.repetitions.push(repetitionStats);
          concertStats.presenceRepetitions += repetitionStats.presence;
          concertStats.absenceRepetitions += repetitionStats.absence;
        }

        concertStatistics.push(concertStats);
      }

      // Envoyer les statistiques en réponse
      res.status(200).json({
        statistiquesConcerts: concertStatistics,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateConcertInvite(choristeId, concertId) {
    try {
      // Recherche du concert dans la base de données en utilisant l'ID fourni dans la route
      const concert = await Concert.findById(concertId);

      // Vérifie si le concert existe
      if (!concert) {
        throw new Error("Concert not found");
      }

      // Recherche de la confirmation du choriste dans les confirmations du concert
      const confirmationIndex = concert.confirmations.findIndex(
        (confirmation) => confirmation.choriste.toString() === choristeId
      );

      // Vérifie si la confirmation du choriste existe
      if (confirmationIndex === -1) {
        throw new Error("Choriste not found in concert confirmations");
      }

      // Met à jour le champ invite à true dans la confirmation du choriste
      concert.confirmations[confirmationIndex].invite = true;

      // Enregistre les modifications apportées au concert dans la base de données
      const updatedConcert = await concert.save();

      return updatedConcert;
    } catch (error) {
      throw new Error("Error updating concert invite: " + error.message);
    }
  },

  createConcertAndProg: async (req, res) => {
    try {
      console.log(req.body);
      const dto = new concert_oeuvre_dto(req.body);
      let listIds = [];
      await Promise.all(
        dto.programme.map(async (element) => {
          // const nouvelleOeuvre = new Oeuvre(element);
          // const savedOeuvre = await nouvelleOeuvre.save().then(savedDoc => {
          // listIds.push(savedDoc.id);
          // });
          listIds.push(element._id);
        })
      );

      if (listIds.length > 0) {
        dto.concert.programme = listIds;
        const concert = new Concert(dto.concert);
        const savedConcert = await concert.save();
        await QRCode.toFile(
          `./imageQR/Cqrcode-${savedConcert._id}.png`,
          `http://localhost:5000/api/concerts/${savedConcert._id}/confirmerpresence`,
          {
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          }
        );
        res.status(201).json(savedConcert);
      } else {
        return res.status(404).json({ message: "Programme est obligatoire" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getChoristesByConcertAndPupitre: async (req, res) => {
    const concertId = req.params.concertId;

    try {
      const concert = await Concert.findById(concertId).populate(
        "confirmations.choriste"
      );

      if (!concert) {
        return res.status(404).json({ message: "Concert not found" });
      }

      const choristes = concert.confirmations.map((confirmation) => ({
        _id: confirmation.choriste._id,
        nom: confirmation.choriste.nom,
        prenom: confirmation.choriste.prenom,
        confirmation: confirmation.confirmation,
        raison: confirmation.raison,
        invite: confirmation.invite,
      }));

      res.json(choristes);
    } catch (error) {
      console.error("Error fetching choristes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
module.exports = concertController;
