const Candidat = require("../models/candidat");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const Verifmail = require("../models/verifmail");

// gat_all
const getAllCandidats = async (req, res) => {
  try {
    const candidats = await Candidat.find();
    res.status(200).json(candidats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// get_by_id
const getCandidatById = async (req, res) => {
  try {
    const candidat = await Candidat.findById(req.params.id);
    if (!candidat) {
      return res.status(404).json({ message: "Candidat non trouvé" });
    }
    res.status(200).json(candidat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update
const updateCandidatById = async (req, res) => {
  try {
    const candidat = await Candidat.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!candidat) {
      return res.status(404).json({ message: "Candidat non trouvé" });
    }
    res.status(200).json(candidat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// dalete
const deleteCandidatById = async (req, res) => {
  try {
    const candidat = await Candidat.findByIdAndRemove(req.params.id);
    if (!candidat) {
      return res.status(404).json({ message: "Candidat non trouvé" });
    }
    res.status(200).json({ message: "Candidat supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//create
const create = async (req, res) => {
  try {
    console.log("req.body: ", req.body);
    const candidat = new Candidat(req.body);

    const savedCandidat = await candidat.save();
    res.status(201).json(savedCandidat);
  } catch (error) {
    console.log("error: ", error.message);
    res
      .status(400)
      .json({
        message: "un utilisateur déjà inscrit avec cette adresse e-mail",
      });
  }
};

const sendEmail = async (email, subject, text, attachments = []) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "wechcrialotfi@gmail.com",
        pass: "sgpt snms vtum ifph",
      },
    });

    const mailOptions = {
      from: "wechcrialotfi@gmail.com",
      to: email,
      subject: subject,
      html: text,
    };

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    await transporter.sendMail(mailOptions);
    console.log("E-mail sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending e-mail:", error.message);
    return false;
  }
};

const addEmailCandidat = async (req, res) => {
  try {
    const existingCandidat = await Verifmail.findOne({ email: req.body.email });

    if (existingCandidat) {
      return res
        .status(409)
        .send({ message: "Candidate with given email already exists!" });
    }

    const candidat = await new Verifmail({ ...req.body }).save();

    const token = jwt.sign(
      { candidatId: candidat._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const url = `http://localhost:5000/api/candidats/${candidat.id}/verify/${token}`;

    const emailSent = await sendEmail(candidat.email, "Verify Email", url);

    if (emailSent) {
      return res
        .status(201)
        .send({
          message: "An Email has been sent to your account, please verify",
        });
    } else {
      await Verifmail.findOneAndDelete({ _id: candidat._id });
      throw new Error("Error sending verification email");
    }
  } catch (error) {
    console.error("Error in addEmailCandidat:", error);
    return res
      .status(500)
      .send({
        error: "Error creating candidate and sending verification email",
      });
  }
};
const verifyEmailToken = async (req, res) => {
  try {
    const { id, token } = req.params;

    // Vérification du token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const candidat = await Verifmail.findById(id);

    if (!candidat) {
      console.log("Candidat not found");
      return res.status(400).send({ message: "Invalid link" });
    }

    // Mise à jour du statut de vérification de l'e-mail
    await Verifmail.findByIdAndUpdate(id, { verified: true });

    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(400).send({ message: "Token has expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(400).send({ message: "Invalid token" });
    } else if (error.name === "MongoError" && error.code === 11000) {
      res.status(500).send({ message: "Duplicate key error" });
    } else {
      console.error("Error in verifyEmailToken:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
};
const createCandidat = async (req, res) => {
  try {
    const { id } = req.params;

    const candidatVerif = await Verifmail.findById(id);

    if (!candidatVerif) {
      return res.status(400).send({ message: "Candidate not found" });
    }

    if (!candidatVerif.verified) {
      return res.status(401).send({ message: "Email not verified yet" });
    }

    const {
      nom_jeune_fille,
      sexe,
      telephone,
      taille_en_m,
      nationalite,
      cinpassport,
      date_naissance,
      situationProfessionnelle,
      activite,
      parraine,
      choeuramateur,
      connaissances,
    } = req.body;
    if (!telephone) {
      return res.status(400).send({ message: "Phone number is required" });
    }

    const newCandidat = await new Candidat({
      nom: candidatVerif.nom,
      prenom: candidatVerif.prenom,
      email: candidatVerif.email,
      nom_jeune_fille,
      sexe,
      telephone,
      taille_en_m,
      nationalite,
      cinpassport,
      situationProfessionnelle,
      date_naissance,
      activite,
      parraine,
      choeuramateur,
      connaissances,
    }).save();

    res.status(201).send({
      message: "Le candidat a été créé avec succès",
      data: newCandidat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
};

const notifieradmin = async () => {
  const today10am = new Date();
  today10am.setHours(15, 0, 0, 0);

  const yesterday10am = new Date();
  yesterday10am.setDate(yesterday10am.getDate() - 1);
  yesterday10am.setHours(10, 0, 0, 0);

  try {
    const documents = await Candidat.find({
      createdAt: {
        $gte: yesterday10am,
        $lt: today10am,
      },
    })
      .select(" email nom prenom ")
      .exec();
    console.log(documents);

    return documents;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  notifieradmin,
  createCandidat,
  verifyEmailToken,
  addEmailCandidat,
  sendEmail,
  create,
  deleteCandidatById,
  updateCandidatById,
  getCandidatById,
  getAllCandidats,
};
