const Audition = require('../models/audition')
const EvenementAudition = require('../models/evenementaudition')
const Candidat = require('../models/candidat')
const nodemailer = require('nodemailer')
const moment = require('moment')
const PlanificationAudition = require('../models/PlanificationAudition')

const createAudition = async (req, res) => {
  try {
    const {
      DateAudition,
      heure_debut,
      heure_fin,
      date_audition,
      nombre_séance,
      dureeAudition,
      candidat,
      extraitChante,
      tessiture,
      evaluation,
      decisioneventuelle,
      remarque,
    } = req.body

    // // Vérification des données requises
    // if (!DateAudition) {
    //   return res.status(400).json({
    //     message: 'Certains champs sont manquants pour créer une audition.',
    //   })
    //}

    const nouvelleAudition = new Audition({
      DateAudition,
      heure_debut,
      heure_fin,
      date_audition,
      nombre_séance,
      dureeAudition,
      candidat,
      extraitChante,
      tessiture,
      evaluation,
      decisioneventuelle,
      remarque,
    })

    const auditionEnregistree = await nouvelleAudition.save()
    res.status(201).json(auditionEnregistree)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// get
const getAuditionById = async (req, res) => {
  try {
    const audition = await Audition.findById(req.params.id).populate('candidat')

    if (!audition) {
      return res.status(404).json({ message: 'Audition non trouvée.' })
    }

    res.json(audition)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
const getAudition = async (req, res) => {
  try {
    const audition = await Audition.find().populate('candidat')
    res.json(audition)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// update

const updateAudition = async (req, res) => {
  try {
    const { id } = req.params
    const audition = await Audition.findById(id)

    if (!audition) {
      return res.status(404).json({ message: 'Audition non trouvée.' })
    }

    // Créer un objet contenant uniquement les champs modifiés
    const updatedFields = {}
    for (const key in req.body) {
      if (audition[key] !== req.body[key]) {
        updatedFields[key] = req.body[key]
      }
    }

    const updatedAudition = await Audition.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true },
    )
    res.json(updatedAudition)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

const deleteAudition = async (req, res) => {
  try {
    const { id } = req.params
    const audition = await Audition.findById(id)

    if (!audition) {
      return res.status(404).json({ message: 'Audition non trouvée.' })
    }

    await Audition.findByIdAndDelete(id)
    res.json({ message: 'Audition supprimée' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const getEvenementAudition = async (req, res) => {
  try {
    const EvnmntAudition = await EvenementAudition.find()
    res.json(EvnmntAudition)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const lancerEvenementAudition = async (req, res) => {
  try {
    const {
      Date_debut_Audition,
      nombre_séance,
      dureeAudition,
      Date_fin_Audition,
      lienFormulaire,
    } = req.body

    if (
      !Date_debut_Audition ||
      !nombre_séance ||
      !dureeAudition ||
      !Date_fin_Audition
    ) {
      return res
        .status(400)
        .json({ error: 'Please provide all required fields.' })
    }

    if (new Date(Date_fin_Audition) < new Date(Date_debut_Audition)) {
      return res
        .status(400)
        .json({ error: 'The end date cannot be before the start date.' })
    }

    const newEvenementAudition = new EvenementAudition({
      Date_debut_Audition,
      nombre_séance,
      dureeAudition,
      Date_fin_Audition,
      lienFormulaire,
    })

    await newEvenementAudition.save()

    const tousLesCandidats = await Candidat.find()
    if (tousLesCandidats.length === 0) {
      return res
        .status(404)
        .json({ error: 'No candidates found in the database.' })
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'wechcrialotfi@gmail.com',
        pass: 'sgpt snms vtum ifph',
      },
    })

    const contenuEmail = `
            Cher candidat,

            Nous sommes ravis de vous informer que la nouvelle saison de notre programme passionnant a officiellement commencé !
            Nous vous encourageons vivement à participer et à montrer au monde votre talent unique durant les auditions.

            Date_de_debut des auditions : ${Date_debut_Audition}

            Lien vers le formulaire de candidature : ${lienFormulaire}

            Merci et à bientôt !
            Nous vous souhaitons une bonne chance !
        `

    for (const candidat of tousLesCandidats) {
      await transporter.sendMail({
        from: 'wechcrialotfi@gmail.com',
        to: candidat.email,
        subject: "Invitation à l'audition",
        text: contenuEmail,
      })
    }

    res.status(201).json({
      message:
        'EvenementAudition created successfully and emails sent to candidates.',
    })
  } catch (error) {
    console.error('Error creating EvenementAudition:', error.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const CheckEvenementAudition = async (req, res) => {
  try {
    const now = new Date()
    const evennement = await EvenementAudition.findOne({
      Date_debut_Audition: { $lte: now },
      Date_fin_Audition: { $gte: now },
    })

    res.json(evennement)
  } catch (error) {
    console.error("Erreur lors de la recherche de l'événement actuel :", error)
    throw error
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const checkNextEvent = async (req, res) => {
  try {
    const now = new Date()
    const saisonId = req.params.saisonId

    // Recherche des événements dont la date de début est postérieure à la date actuelle
    // et qui appartiennent à la saison spécifiée
    const nextEvent = await EvenementAudition.findOne({
      Date_debut_Audition: { $gt: now },
      saison: saisonId,
    }).sort({ Date_debut_Audition: 1 })

    res.json(nextEvent)
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'événement suivant :",
      error,
    )
    res
      .status(500)
      .json({ error: "Erreur lors de la vérification de l'événement suivant" })
  }
}

const updateEvenementAudition = async (req, res) => {
  const evenementId = req.params.eventId
  console.log('req: ', req.body)
  console.log('evenementId: ', evenementId)

  try {
    console.log('ok')

    // Vérifier si l'événement existe
    const evenement = await EvenementAudition.findById(evenementId)
    if (!evenement) {
      return res
        .status(404)
        .json({ message: "L'événement n'a pas été trouvé." })
    }

    // Mettre à jour les champs de l'événement
    if (req.body.Date_debut_Audition) {
      evenement.Date_debut_Audition = req.body.Date_debut_Audition
    }
    if (req.body.nombre_séance) {
      evenement.nombre_séance = req.body.nombre_séance
    }
    if (req.body.dureeAudition) {
      evenement.dureeAudition = req.body.dureeAudition
    }
    if (req.body.Date_fin_Audition) {
      evenement.Date_fin_Audition = req.body.Date_fin_Audition
    }
    if (req.body.lienFormulaire) {
      evenement.lienFormulaire = req.body.lienFormulaire
    }
    if (req.body.isClosed) {
      evenement.isClosed = req.body.isClosed
    }
    if (req.body.isPlaned) {
      evenement.isPlaned = req.body.isPlaned
    }

    await evenement.save()

    res
      .status(200)
      .json({ message: 'Événement mis à jour avec succès.', evenement })
  } catch (error) {
    // Gérer les erreurs
    console.error("Erreur lors de la mise à jour de l'événement :", error)
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'événement." })
  }
}

// tache b

async function genererPlanification(req, res) {
  try {
    const { evenementAuditionId, saison } = req.params
    console.log('evenementAuditionId: ', evenementAuditionId)
    console.log('saison: ', saison)
    const { startTime } = req.body
    const auditionPlanning = await EvenementAudition.findOne({
      _id: evenementAuditionId,
    })

    const candidats = await Candidat.find({ saison: saison });
    console.log("candidats: ", candidats);
    const nombreSeancesParJour = auditionPlanning.nombre_séance;
    const dureeAuditionMinutes = parseInt(auditionPlanning.dureeAudition);

    const planning = []

    let dateDebutAudition = moment(auditionPlanning.Date_debut_Audition);

    for (let jour = 0; jour < auditionPlanning.nombre_séance; jour++) {
      let heureDebutSeance = moment(auditionPlanning.Date_debut_Audition)
        .add(jour, 'days')
        .set({
          hour: startTime.split(':')[0],
          minute: startTime.split(':')[1],
        })

      for (let seance = 0; seance < nombreSeancesParJour; seance++) {
        const candidatIndex = jour * nombreSeancesParJour + seance

        if (candidatIndex < candidats.length) {
          const candidat = candidats[candidatIndex]

          const dateDebutSeance = heureDebutSeance.clone();
          const dateFinSeance = dateDebutSeance
            .clone()
            .add(dureeAuditionMinutes, 'minutes')

          if (dateFinSeance.isAfter(auditionPlanning.Date_fin_Audition)) {
            console.warn(
              "La date de fin de l'audition dépasse la date spécifiée."
            );
            return res.status(400).json({
              success: false,
              error: "La date de fin de l'audition dépasse la date spécifiée.",
            })
          }

          const nouvellePlanification = new Audition({
            candidat: candidat._id,
            evenementAudition: evenementAuditionId,
            date_audition: dateDebutSeance,
            heure_debut: dateDebutSeance,
            heure_fin: dateFinSeance,
          })

          await nouvellePlanification.save()
          planning.push(nouvellePlanification)
          heureDebutSeance = dateFinSeance;

          // Call sendAuditionEmails function here
          await sendAuditionEmails(candidat, {
            date_audition: dateDebutSeance.toDate(),
            heure_debut: dateDebutSeance.toDate(),
          })
        }
      }
    }

    console.log(
      'Planification des candidats générée avec succès et enregistrée dans la base de données',
    )
    res.status(200).json({ success: true, data: planning })
  } catch (error) {
    console.error(
      "Erreur lors de la génération et de l'enregistrement de la planification des candidats:",
      error.message,
    )
    res.status(500).json({ success: false, error: error.message })
  }
}

const sendAuditionEmails = async (candidat, audition) => {
  try {
    // Configuration de Nodemailer pour utiliser Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'hendlegleg1@gmail.com',
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Contenu de l'e-mail à envoyer
    const contenuEmail = `
Cher(e) ${candidat.nom} ${candidat.prenom},

Nous souhaitons vous informer de votre prochaine audition.
Date: ${audition.date_audition.toDateString()}
Heure: ${audition.heure_debut.toTimeString()}

Cordialement,
Votre organisation
`

    // Envoi de l'e-mail
    await transporter.sendMail({
      from: 'namouchicyrine@gmail.com',
      to: candidat.email,
      subject: 'Information Audition',
      text: contenuEmail,
    })

    console.log(`E-mail envoyé avec succès à ${candidat.email}.`)
  } catch (error) {
    console.error(
      `Erreur lors de l'envoi de l'e-mail à ${candidat.email}: ${error.message}`,
    )
  }
}

async function genererPlanificationabsence(req, res) {
  try {
    const { saisonId, selectedAuditionIds } = req.body
    console.log({ saisonId, selectedAuditionIds })
    const auditionPlanning = await EvenementAudition.findOne({
      saison: saisonId,
    })

    const nombreSeancesParJour = auditionPlanning.nombre_séance
    const dureeAuditionMinutes = parseInt(
      auditionPlanning.dureeAudition.split(' ')[0],
    ) // Récupérer le nombre avant l'espace

    // Vérifier si le nombre récupéré est valide
    if (isNaN(dureeAuditionMinutes)) {
      console.error("La durée de l'audition n'est pas valide.");
      res.status(400).json({
        success: false,
        error: "La durée de l'audition n'est pas valide.",
      });
      return;
    }

    let dateDebutAudition = moment(auditionPlanning.Date_debut_Audition)
      .add(7, 'days')
      .hours(8)
      .minutes(0)
      .milliseconds(0)
    console.log(dateDebutAudition)

    let nombreAuditionsCeJour = 0 // Initialiser le nombre d'auditions pour ce jour à 0

    for (const auditionId of selectedAuditionIds) {
      const audition = await Audition.findById(auditionId).populate('candidat')

      if (!audition) {
        console.error(`L'audition avec l'ID ${auditionId} n'a pas été trouvée.`)
        continue
      }

      if (nombreAuditionsCeJour >= nombreSeancesParJour) {
        // Passer au jour suivant en ajoutant un jour à la date de début d'audition
        dateDebutAudition.add(1, 'day')
        // Réinitialiser le nombre d'auditions pour ce jour à 0
        nombreAuditionsCeJour = 0
      }

      // Calculer la nouvelle date de fin d'audition en fonction de la durée de l'audition
      const nouvelleDateFinAudition = moment(dateDebutAudition)
        .add(dureeAuditionMinutes, 'minutes')
        .toDate()
      console.log(nouvelleDateFinAudition)

      // Mettre à jour les dates de début et de fin de l'audition
      audition.date_audition = dateDebutAudition.toDate()
      audition.heure_debut = dateDebutAudition.toDate()
      audition.heure_fin = nouvelleDateFinAudition
      sendAuditionEmails(audition.candidat, audition)
      console.log(audition.candidat)
      await audition.save()

      // Mettre à jour le nombre d'auditions pour ce jour
      nombreAuditionsCeJour++

      // Passer à l'audition suivante
      dateDebutAudition.add(dureeAuditionMinutes, 'minutes')
    }

    console.log("Planification des auditions générée avec succès");
    res.status(200).json({
      success: true,
      message: "Planification des auditions générée avec succès",
    });
  } catch (error) {
    console.error(
      'Erreur lors de la génération de la planification des auditions :',
      error.message,
    )
    res.status(500).json({ success: false, error: error.message })
  }
}

const sendAuditionEmailsAbsents = async (candidat, audition) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'namouchicyrine@gmail.com',
        pass: 'tqdmvzynhcwsjsvy',
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    let contenuEmail

    contenuEmail = `
      Cher(e) ${candidat.nom} ${candidat.prenom},
      Vous n'avez pas assisté à votre audition prévue.
      Veuillez contacter l'organisation pour plus d'informations.
      Cordialement,
      Votre organisation
    `
    await transporter.sendMail({
      from: 'namouchicyrine@gmail.com',
      to: candidat.email,
      subject: 'Information Audition',
      text: contenuEmail,
    })

    console.log(`E-mail envoyé avec succès à ${candidat.email}.`)
  } catch (error) {
    console.error(
      `Erreur lors de l'envoi de l'e-mail à ${candidat.email}:`,
      error.message,
    )
  }
}

const generateAndSendAuditionPlan = async (req, res) => {
  try {
    // ... existing code to generate audition planning

    // Send emails and generate links for follow-up
    await sendAuditionEmails(candidats)

    res.status(200).json({ success: true, data: planning })
  } catch (error) {
    console.error('Error generating audition plan:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
}
const getAuditionEnAttente = async (req, res) => {
  try {
    console.log(req.params.saisonId)
    const audition = await Audition.find({
      decisioneventuelle: 'en attente',
      saison: req.params.saisonId,
    }).populate('candidat')
    return res.status(200).json(audition)
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des auditions en attente:',
      error,
    )
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des auditions en attente.',
    })
  }
}
module.exports = {
  deleteAudition,
  updateAudition,
  createAudition,
  getAuditionById,
  genererPlanification,
  lancerEvenementAudition,
  getAudition,
  getAuditionById,
  genererPlanification,
  generateAndSendAuditionPlan,
  genererPlanificationabsence,
  CheckEvenementAudition,
  updateEvenementAudition,
  getEvenementAudition,
  checkNextEvent,
  getAuditionEnAttente,
}
