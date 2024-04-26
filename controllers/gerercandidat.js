const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const Candidat = require("../models/candidat");
const Audition = require("../models/audition");
const listeFinale = require("../models/listeFinale");
const User = require("../models/utilisateurs");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const Pupitre = require("../models/pupitre");
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
    const auditions = await Audition.find({ decisioneventuelle: "retenu" });
    const candidatsRetenusIds = auditions.map((audition) => audition.candidat);
    let countEmailsSent = 0;

    for (const id of candidatsRetenusIds) {
      try {
        const candidat = await Candidat.findById(id);

        if (!candidat.token) {
          const token = generateUniqueToken();
          candidat.token = token;
          const confirmationLink = `http://localhost:5000/api/gerer/confirmation-presence/${candidat.id}/${token}?decision=confirm`;

          const mailOptions = {
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
    console.error(
      "Erreur lors de l'enregistrement des candidats retenus :",
      error
    );
    res.status(500).json({
      message: "Erreur lors de l'enregistrement des candidats retenus.",
    });
  }
};

exports.confirmAcceptanceByEmail = async (req, res) => {
  try {
    const { id, token } = req.params;
    console.log("ID du candidat :", id);
    console.log("Token reçu :", token);

    const candidat = await Candidat.findByIdAndUpdate(id, {
      estConfirme: true,
    });

    console.log("Candidat trouvé :", candidat);

    if (!candidat) {
      return res.status(400).send({ message: "Invalid link" });
    }

    res.status(200).send({ message: "Acceptance confirmed successfully" });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("Token has expired");
      res.status(400).send({ message: "Token has expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log("Invalid token");
      res.status(400).send({ message: "Invalid token" });
    } else if (error.name === "MongoError" && error.code === 11000) {
      console.log("Duplicate key error");
      res.status(500).send({ message: "Duplicate key error" });
    } else {
      console.error("Error in confirmAcceptanceByEmail:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
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
    if (candidat.estConfirme === true) {
      // Générer le mot de passe
      const password = await genererMotDePasse(candidat._id);

      const nouveauChoriste = new User({
        nom: candidat.nom,
        prenom: candidat.prenom,
        email: candidat.email,
        password: password, // Utiliser le mot de passe généré
        role: "choriste",
        tessiture: tessiture,
        taille_en_m: candidat.taille_en_m,
      });

      await nouveauChoriste.save();
      console.log("Nouveau choriste ajouté avec succès.");
    } else {
      console.log(
        "Le candidat n'est pas confirmé. Le choriste ne sera pas ajouté."
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout du choriste :", error);
    throw new Error("Erreur lors de l'ajout du choriste");
  }
};

exports.envoyerEmailConfirmation = async () => {
  try {
    const candidat = await Candidat.findOne({ estConfirme: true });

    if (!candidat) {
      throw new Error("Aucun candidat confirmé trouvé");
    }

    const token = candidat ? candidat.token : null;
    const confirmationLink = `http://localhost:3000/${candidat.id}`;

    const generatedPassword = await genererMotDePasse(candidat._id);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    candidat.motDePasse = hashedPassword;
    await candidat.save();

    const mailOptions = {
      from: "hendlegleg1@gmail.com",
      to: candidat.email,
      subject: "Confirmation d'inscription",
      text: `Bonjour ${candidat.nom}, cliquez sur ce lien pour confirmer votre inscription : ${confirmationLink}. Voici vos informations de connexion : 
      - Login : ${candidat.email} 
      - Mot de passe : ${generatedPassword}. 
      Vous devez aussi signer la charte du choeur!`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de confirmation envoyé à ${candidat.email}`);

    return { message: "Email de confirmation envoyé avec succès" };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de confirmation :", error);
    return { error: "Erreur lors de l'envoi de l'email de confirmation" };
  }
};
exports.confirmerEngagement = async (req, res) => {
  try {
    const candidat = await Candidat.findById(req.params.id);
    console.log(candidat);
    if (!candidat) {
      throw new Error("Candidat introuvable");
    }
    candidat.signature = true;
    await candidat.save();
    const tessitureAudition = (
      await Audition.findOne({ candidat: candidat.id })
    )?.tessiture;
    if (
      candidat.nom &&
      candidat.prenom &&
      candidat.email &&
      tessitureAudition
    ) {
      await ajouterChoriste(candidat, tessitureAudition);
    } else {
      throw new Error(
        "Les informations nécessaires pour créer un choriste sont incomplètes."
      );
    }

    return {
      message:
        "Candidat marqué comme signé et ajouté en tant que choriste avec succès",
    };
  } catch (error) {
    console.error(
      "Erreur lors du marquage comme signé et de l'ajout du choriste :",
      error
    );
    throw new Error(
      "Erreur lors du marquage comme signé et de l'ajout du choriste"
    );
  }
};

let listeCandidatsParSaison = {};

exports.getListeCandidats = async (req, res) => {
  try {
    const saison = req.body.saison;

    if (!saison) {
      return res.status(400).json({
        message: "Numéro de saison manquant dans le corps de la requête",
      });
    }

    if (!listeCandidatsParSaison[saison]) {
      listeCandidatsParSaison[saison] = await Candidat.find(
        { saison },
        "nom prenom"
      );
      console.log(listeCandidatsParSaison);
    }

    res.status(200).json(listeCandidatsParSaison[saison]);
    console.log(
      `Liste des candidats pour la saison ${saison}:`,
      listeCandidatsParSaison[saison]
    );
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
      { $match: { decisioneventuelle: "retenu" } }, // Filtrer les auditions retenues
      {
        $lookup: {
          // Rechercher les détails du candidat associé à chaque audition
          from: "candidats",
          localField: "candidat",
          foreignField: "_id",
          as: "candidatDetails",
        },
      },
      { $unwind: "$candidatDetails" }, // Déplier le tableau de candidats
      {
        $group: {
          // Grouper les candidats par la tessiture de l'audition
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

    res.status(200).json(candidatsRetenus);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des candidats retenus groupés par tessiture :",
      error
    );
    res
      .status(500)
      .json({
        error:
          "Erreur lors de la récupération des candidats retenus groupés par tessiture",
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



exports.getListeCandidatsParPupitre = async (req, res) => {
  try {
    const besoinsPupitres = req.body || {};

    const candidatsParPupitre = {
      Soprano: [],
      Alto: [],
      Ténor: [],
      Basse: [],
    };

    // Vérifier si les besoins des pupitres sont spécifiés dans la requête
    if (Object.keys(besoinsPupitres).length === 0) {
      return res
        .status(400)
        .json({ error: "Besoin des pupitres non spécifié dans la requête" });
    }

    // Parcourir les candidats et les ajouter aux pupitres en fonction des besoins spécifiés
    const candidats = await Candidat.find();
    for (const candidat of candidats) {
      const tessiture = candidat.tessiture;

      // Vérifier si la tessiture du candidat est spécifiée dans les besoins des pupitres
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
    return res
      .status(500)
      .json({
        error:
          "Erreur lors de la récupération des candidats retenus par pupitre",
      });
  }
};

