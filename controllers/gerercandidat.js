const nodemailer = require("nodemailer");
require("dotenv").config();
const Candidat = require("../models/candidat");
const Audition = require("../models/audition");
const User = require("../models/utilisateurs");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const Pupitre = require("../models/pupitre");
const Saison = require("../models/saison");

const variablesController = require("./variablesController");
function generateUniqueToken() {
  return uuid.v4();
}

const path = require("path");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hendlegleg1@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.getListeCandidatsParPupitre = async (req, res) => {
  try {
    const besoinPupitres = req.body || {};

    const candidatsParPupitre = {
      Soprano: { retenu: [], "en attente": [], refuse: [] },
      Alto: { retenu: [], "en attente": [], refuse: [] },
      Ténor: { retenu: [], "en attente": [], refuse: [] },
      Basse: { retenu: [], "en attente": [], refuse: [] },
    };
    if (Object.keys(besoinPupitres).length === 0) {
      return res
        .status(400)
        .json({ error: "Besoin des pupitres non spécifié dans la requête" });
    }

    const auditionsRetenues = await Audition.find({
      decisioneventuelle: { $in: ["retenu", "en attente", "refusé"] },
    }).populate("candidat");

    for (const audition of auditionsRetenues) {
      const candidat = audition.candidat;
      const tessiture = audition.tessiture;
      const decision = audition.decisioneventuelle;

      const candidatData = {
        id: candidat._id,
        nom: candidat.nom,
        prenom: candidat.prenom,
        email: candidat.email,
      };

      if (
        candidatsParPupitre[tessiture]["retenu"].length <
        besoinPupitres[tessiture]
      ) {
        if (
          decision === "retenu" &&
          candidatsParPupitre[tessiture]["retenu"].length <
            besoinPupitres[tessiture]
        ) {
          candidatsParPupitre[tessiture]["retenu"].push(candidatData);
        } else if (
          decision === "en attente" &&
          candidatsParPupitre[tessiture]["en attente"].length <
            besoinPupitres[tessiture]
        ) {
          candidatsParPupitre[tessiture]["en attente"].push(candidatData);
        } else {
          candidatsParPupitre[tessiture]["refuse"].push(candidatData);
        }
      }
    }

    return res.status(200).json(candidatsParPupitre);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des candidats retenus par pupitre :",
      error
    );
    return res.status(500).json({
      error: "Erreur lors de la récupération des candidats retenus par pupitre",
    });
  }
};

exports.envoyerEmailAcceptation = async (req, res) => {
  try {
    const { selectedRows } = req.body;

    if (selectedRows.length === 0) {
      return res.status(400).json({ message: "Aucun candidat sélectionné." });
    }

    let countEmailsSent = 0;

    for (const id of selectedRows) {
      try {
        const candidat = await Candidat.findById(id);

        if (!candidat.token) {
          const token = generateUniqueToken();
          candidat.token = token;
          const confirmationLink = `http://localhost:3000/accept/${candidat.id}/${token}`;

          const mailOptions = {
            from: "hendlegleg1@gmail.com",
            from: "hendlegleg1@gmail.com",
            to: candidat.email,
            subject: "Votre acceptation dans le chœur",
            text: `Cher ${candidat.nom}, Félicitations! Vous avez été retenu pour rejoindre le chœur. Veuillez confirmer votre présence en cliquant sur ce lien : ${confirmationLink}. Cordialement.`,
            attachments: [
              {
                filename: "charte_du_choeur.pdf",
                path: path.join(__dirname, "../charte_du_choeur.pdf"),
              },
            ],
          };

          await transporter.sendMail(mailOptions);
          console.log(`Email envoyé à ${candidat.email}`);
          await candidat.save();
          const audition = await Audition.findOne({ candidat: candidat._id });
          audition.decisioneventuelle = "Final";
          await audition.save();

          countEmailsSent++;
          countEmailsSent++;
        } else {
          console.log(
            `Le candidat ${candidat.nom} a déjà un token. Aucun email envoyé.`
          );
        }
      } catch (error) {
        console.error("Erreur lors du traitement pour le candidat :", error);
      }
    }

    let message = "";
    if (countEmailsSent > 0) {
      message = `Les e-mails et tokens ont été envoyés à ${countEmailsSent} candidat(s) sans token existant.`;
    } else {
      message = "Aucun e-mail envoyé car tous les candidats ont déjà un token.";
    }

    res.status(200).json({ message });
  } catch (error) {
    console.error("Erreur lors de l'envoi des emails d'acceptation :", error);
    res.status(500).json({
      message: "Erreur lors de l'envoi des emails d'acceptation.",
    });
  }
};
exports.confirmAcceptanceByEmail = async (req, res) => {
  try {
    const { id } = req.params;

    const candidat = await Candidat.findByIdAndUpdate(id, {
      estConfirme: true,
    });

    if (!candidat) {
      return res.status(400).send({ message: "Invalid link" });
    }

    res.status(200).send({ message: "Acceptance confirmed successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

async function genererMotDePasse(candidatId) {
  try {
    const candidat = await Candidat.findById(candidatId);

    if (!candidat) {
      throw new Error("Candidat non trouvé");
    }

    const phoneNumber = candidat.telephone;
    const initialName = candidat.nom.charAt(0);

    const generatedPassword = `${phoneNumber}${initialName}`;
    return generatedPassword;
  } catch (error) {
    console.error("Erreur lors de la génération du mot de passe :", error);
    throw new Error("Erreur lors de la génération du mot de passe");
  }
}

const ajouterChoriste = async (candidat, tessiture) => {
  try {
    if (!candidat.estConfirme) {
      console.log(
        "Le candidat n'est pas confirmé. Le choriste ne sera pas ajouté."
      );
      return "Le candidat n'est pas confirmé. Le choriste ne sera pas ajouté";
    }

    const rawPassword = await genererMotDePasse(candidat._id);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const nouveauChoriste = new User({
      nom: candidat.nom,
      prenom: candidat.prenom,
      email: candidat.email,
      password: hashedPassword,
      role: "choriste",
      tessiture: tessiture,
    });

    await nouveauChoriste.save();
    console.log("Nouveau choriste ajouté avec succès.");
    return "Nouveau choriste ajouté avec succès";
  } catch (error) {
    console.error("Erreur lors de l'ajout du choriste :", error);
    throw new Error("Erreur lors de l'ajout du choriste");
  }
};

exports.envoyerEmailConfirmation = async (req, res) => {
  const { selectedRows } = req.body;

  if (selectedRows.length === 0) {
    return res.status(400).json({ message: "Aucun candidat sélectionné." });
  }

  try {
    for (const id of selectedRows) {
      const candidat = await Candidat.findById(id);

      if (!candidat) {
        throw new Error(`Aucun candidat avec l'ID ${id} trouvé.`);
      }

      const generatedPassword = await genererMotDePasse(candidat._id);

      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      // Mettre à jour le mot de passe du candidat
      candidat.motDePasse = hashedPassword;
      candidat.estConfirme = false;
      await candidat.save();

      const mailOptions = {
        from: "hendlegleg1@gmail.com",
        to: candidat.email,
        subject: "Confirmation d'inscription",
        text: `Bonjour ${candidat.nom}, cliquez sur ce lien pour confirmer votre inscription : http://localhost:3000/${candidat.id}. Voici vos informations de connexion : 
      - Login : ${candidat.email} 
      - Mot de passe : ${generatedPassword}. 
      Vous devez également signer la charte du choeur!`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email de confirmation envoyé à ${candidat.email}`);
    }

    return res
      .status(200)
      .json({ message: "Emails de confirmation envoyés avec succès." });
  } catch (error) {
    console.error("Erreur lors de l'envoi des emails de confirmation :", error);
    return res
      .status(500)
      .json({ error: "Erreur lors de l'envoi des emails de confirmation." });
  }
};

exports.confirmerEngagement = async (req, res) => {
  try {
    const candidat = await Candidat.findById(req.params.id);
    if (!candidat) {
      throw new Error("Candidat introuvable");
    }

    candidat.signature = false;
    await candidat.save();

    const audition = await Audition.findOne({ candidat: candidat._id });
    const tessitureAudition = audition ? audition.tessiture : null;

    if (!tessitureAudition) {
      throw new Error("Tessiture introuvable pour le candidat");
    }

    if (candidat.nom && candidat.prenom && candidat.email) {
      await ajouterChoriste(candidat, tessitureAudition);
    } else {
      throw new Error("Les informations du candidat sont incomplètes");
    }

    res.status(200).send("Engagement confirmé et choriste ajouté avec succès");
  } catch (error) {
    console.error(
      "Erreur lors du marquage comme signé et de l'ajout du choriste :",
      error
    );
    res
      .status(500)
      .send("Erreur lors du marquage comme signé et de l'ajout du choriste");
  }
};

let listeCandidatsParSaison = {};

exports.getListeCandidats = async (req, res) => {
  try {
    const annee = req.body.annee;

    if (!annee) {
      return res.status(400).json({
        message: "Année de saison manquante dans le corps de la requête",
      });
    }

    // Recherche de la saison correspondant à l'année donnée
    const saison = await Saison.findOne({ annee });

    if (!saison) {
      return res.status(404).json({
        message: `Aucune saison trouvée pour l'année ${annee}`,
      });
    }

    // Récupération de la liste des candidats pour la saison trouvée
    const candidats = await Candidat.find({ saison: saison._id }, "nom prenom email");

    res.status(200).json(candidats);
    console.log(`Liste des candidats pour la saison ${annee}:`, candidats);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la liste des candidats :",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération de la liste des candidats",
    });
  }
};

exports.getCandidatsRetenusParPupitre = async (req, res) => {
  try {
    const candidatsRetenus = await Audition.aggregate([
      { $match: { decisioneventuelle: "retenu" } },
      {
        $lookup: {
          from: "candidats",
          localField: "candidat",
          foreignField: "_id",
          as: "candidatDetails",
        },
      },
      { $unwind: "$candidatDetails" },
      {
        $group: {
          _id: "$tessiture",
          candidats: {
            $push: {
              _id: "$candidatDetails._id",
              nom: "$candidatDetails.nom",
              prenom: "$candidatDetails.prenom",
              email: "$candidatDetails.email",
            },
          },
        },
      },
    ]);
    candidatsRetenus.forEach((pupitre) => {
      console.log(`Tessiture: ${pupitre._id}`);
      pupitre.candidats.forEach((candidat) => {
        console.log(`ID du candidat: ${candidat._id}`);
      });
    });
    res.status(200).json(candidatsRetenus);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des candidats retenus groupés par tessiture :",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la récupération des candidats retenus groupés par tessiture",
    });
  }
};
exports.getCandidatsconfirme = async (req, res) => {
  try {
    const candidatsRetenus = await Audition.aggregate([
      { $match: { decisioneventuelle: "Final" } },
      {
        $lookup: {
          from: "candidats",
          localField: "candidat",
          foreignField: "_id",
          as: "candidatDetails",
        },
      },
      { $unwind: "$candidatDetails" },
      {
        $match: { "candidatDetails.estConfirme": true },
      },
      {
        $group: {
          _id: "$tessiture",
          candidats: {
            $push: {
              _id: "$candidatDetails._id",
              nom: "$candidatDetails.nom",
              prenom: "$candidatDetails.prenom",
              email: "$candidatDetails.email",
            },
          },
        },
      },
    ]);
    // Vérification des IDs inclus dans les données renvoyées
    candidatsRetenus.forEach((pupitre) => {
      console.log(`Tessiture: ${pupitre._id}`);
      pupitre.candidats.forEach((candidat) => {
        console.log(`ID du candidat: ${candidat._id}`);
      });
    });
    res.status(200).json(candidatsRetenus);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des candidats retenus groupés par tessiture :",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la récupération des candidats retenus groupés par tessiture",
    });
  }
};

exports.getListeCandidatsParPupitre = async (req, res) => {
  try {
    const besoinsPupitres = req.body || {};

    const candidatsParPupitre = {
      Soprano: [],
      Alto: [],
      Ténor: [],
      Basse: [],
    };

    if (Object.keys(besoinsPupitres).length === 0) {
      return res
        .status(400)
        .json({ error: "Besoin des pupitres non spécifié dans la requête" });
    }

    const candidats = await Candidat.find();
    for (const candidat of candidats) {
      const tessiture = candidat.tessiture;

      if (besoinsPupitres.hasOwnProperty(tessiture)) {
        const besoinPupitre = besoinsPupitres[tessiture];
        if (candidatsParPupitre[tessiture].length < besoinPupitre) {
          candidatsParPupitre[tessiture].push({
            id: candidat._id,
            nom: candidat.nom,
            prenom: candidat.prenom,
            email: candidat.email,
          });
        }
      }
    }

    return res.status(200).json(candidatsParPupitre);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des candidats retenus par pupitre :",
      error
    );
    return res.status(500).json({
      error: "Erreur lors de la récupération des candidats retenus par pupitre",
    });
  }
};
exports.defineBesoinPupitre = async (req, res) => {
  try {
    const besoinPupitres = req.body || {};

    const candidatsParPupitre = {
      Soprano: [],
      Alto: [],
      Ténor: [],
      Basse: [],
    };

    if (Object.keys(besoinPupitres).length === 0) {
      return res
        .status(400)
        .json({ error: "Besoin des pupitres non spécifié dans la requête" });
    }

    // Parcourir les besoins de pupitres et les stocker par tessiture
    for (const tessiture in besoinPupitres) {
      const besoin = besoinPupitres[tessiture];
      if (candidatsParPupitre.hasOwnProperty(tessiture)) {
        candidatsParPupitre[tessiture] = { besoin };
      }
    }

    return res.status(200).json(candidatsParPupitre);
  } catch (error) {
    console.error(
      "Erreur lors de la définition des besoins de pupitre par tessiture :",
      error
    );
    return res.status(500).json({
      error:
        "Erreur lors de la définition des besoins de pupitre par tessiture",
    });
  }
};
