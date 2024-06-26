const User = require("../models/utilisateurs");
const { CronJob } = require("cron");
require("dotenv").config();
const nodemailer = require("nodemailer");
const Pupitre = require("../models/pupitre");
const mongoose = require("mongoose");
const { onlineUsers, io } = require("../socket/socketServer");

const {
  sendNotification,
  addNotification,
} = require("./notificationController");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hendlegleg1@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
    pass: process.env.EMAIL_PASSWORD,
  },
);
//H

const envoyerNotificationCongeJob = new CronJob(
  "0 10 13 * * *",
  async () => {
    try {
      console.log(
        "Tâche cron en cours d'exécution pour l'envoi de notifications de congé..."
      );

      const usersWithLeaveChanged = await User.find({
        demandeConge: true,
        statusChanged: true,
      });

      if (usersWithLeaveChanged.length > 0) {
        for (const user of usersWithLeaveChanged) {
          const contenuEmail = `
          Bonjour ${user.nom},

          Votre statut de congé a été modifié.

          Merci et à bientôt !
        `;
          await transporter.sendMail({
            from: "hendlegleg1@gmail.com",
            to: user.email,
            subject: "Notification de modification du statut de congé",
            text: contenuEmail,
          });

          console.log(`Notification envoyée à ${user.email}`);
          user.statusChanged = false;
          await user.save();
        }
      } else {
        console.log("Aucun utilisateur avec un statut de congé modifié.");
      }
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi des notifications de congé :",
        error.message
      );
    }
  },
  null,
  true,
  "Europe/Paris"
);
envoyerNotificationCongeJob.start();

const declareLeave = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const userId = req.params.userId;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message:
          "Veuillez fournir à la fois la date de début et la date de fin du congé.",
      });
    }

    // Vérifier si les dates sont valides
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Les dates de début et de fin du congé ne sont pas valides.",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message:
          "La date de début du congé doit être antérieure à la date de fin.",
      });
    }

    const user = await User.findById(userId).select(
      "nom prenom conge dateDebutConge dateFinConge"
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.demandeConge = true;
    user.conge = "enattente";
    user.dateDebutConge = startDate;
    user.dateFinConge = endDate;

    await user.save();

    const { nom, prenom, conge, dateDebutConge, dateFinConge } = user;

    // Calculate the number of days for the leave
    const leaveDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // Adding 1 to include the start date

    const admins = await User.find({ role: "admin" }).distinct("_id");

    for (const adminId of admins) {
      // Envoyer des notifications aux administrateurs
      // ...
    }

    res.status(200).json({
      message: "Demande de congé enregistrée avec succès pour l'utilisateur.",
      user: { nom, prenom, conge, dateDebutConge, dateFinConge },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const sendNotification_ = async (req, res) => {
  try {
    const { userId, message } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    if (!user.estEnConge) {
      const notification = new Notification({ userId, message });
      await notification.save();

      res.status(200).json({
        message: "Notification envoyée avec succès à l'utilisateur.",
        notification,
      });
    } else {
      res.status(200).json({
        message: "L'utilisateur est en congé. Aucune notification envoyée.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const LeaveNotifications = async (req, res) => {
  try {
    const usersToNotify = await User.find({
      conge: "enattente",
      demandeConge: true,
    });

   

    res.status(200).json(usersToNotify );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateLeaveStatus = async (req, res) => {
  const { idUser } = req.params;
  
  try {
    const userToUpdate = await User.findOneAndUpdate(
      {
        _id: idUser,
        conge: "enattente",
        demandeConge: true,
      },
      {
        $set: { conge: "validé" },
      },
      { new: true }  // Return the updated document
    );

    const pupitres = await Pupitre.find();

    const chefspupitre = pupitres
    .filter((pupitre) => pupitre.choristes.includes(idUser))
    .map((pupitre) => {
      return pupitre.chefs;
    })
    .flat();


    chefspupitre.map(async (chef)   =>  {
      if (chef) {
        req.notificationdetails = {
          userSocketId: chef.socketId,
          notif_body: `Le choriste ${chef.nom} ${chef.prenom} a demandé un congé`,
        };

        await sendNotification(req, res, async () => {
          res
            .status(200)
            .json({ message: "Utilisateurs récupérés avec succès" });
        });
      }
      req.body = {
        userId: chef._id.toString(),
        newMessage: `Le choriste ${chef.nom} ${chef.prenom} a demandé un congé`,
      };

      await addNotification(req, res, async () => {
        res.status(200).json({ message: "Utilisateurs récupérés avec succès" });
      });
     
    });

    
 

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found or conditions not met" });
    }

    res.status(200).json({
      message: "Leave status updated successfully",
      user: userToUpdate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const modifyLeaveStatus = async (req, res) => {
  try {
    const { userId, approved } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (approved) {
      user.demandeConge = false;
      user.estEnConge = true;

      await user.save();

      res.status(200).json({ message: "Statut de congé modifié avec succès." });
    } else {
      res.status(200).json({ message: "Demande de congé non approuvée." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const notifmodifyLeaveStatus = async (req, res) => {
  try {
    const { userId, approved } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    if (approved) {
      user.demandeConge = false;
      user.estEnConge = true;
      await user.save();
      const pupitres = await Pupitre.find();
      const choristeIdToFind = new mongoose.Types.ObjectId(userId);

      const chefspupitre = pupitres
        .filter((pupitre) => pupitre.choristes.includes(choristeIdToFind))
        .map((pupitre) => {
          return pupitre.chefs;
        })
        .flat();
      chefspupitre.map((chef) => {
        io.emit(`notif-${chef.toString()}`, {
          message: `Statut de votre choriste ${
            user.nom + " " + user.prenom
          } a ete modifié : en conge`,
        });
      });
      res.status(200).json({ message: "Statut de congé modifié avec succès." });
    } else {
      res.status(200).json({ message: "Demande de congé non approuvée." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  /*sendNotificationForLeaveRequest,*/
  updateLeaveStatus,
  notifmodifyLeaveStatus,
  sendNotification_,
  declareLeave,
  LeaveNotifications,
  modifyLeaveStatus,
};
