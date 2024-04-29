const AbsenceRequest = require('../models/absence')
const Pupitre = require('../models/pupitre')
const Repetition = require('../models/repetition')
const Concert = require('../models/concert')
const User = require('../models/utilisateurs')

const informerAbsence = (req, res) => {
  const { eventType, eventDate, reason } = req.body
  const userId = req.auth.userId
  if (!eventType || !eventDate || !reason) {
    return res.status(400).json({
      success: false,
      message:
        'Les données requises sont manquantes dans le corps de la requête',
    })
  }

  let userObj
  let eventObj

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new Error('Utilisateur non trouvé')
      }

      userObj = user

      let eventModel

      if (eventType === 'repetition') {
        eventModel = Repetition
      } else if (eventType === 'concert') {
        eventModel = Concert
      } else {
        throw new Error("Type d'événement invalide")
      }

      return eventModel.findOne({ date: eventDate })
    })
    .then((event) => {
      if (!event) {
        throw new Error(`Aucun événement prévu pour la date spécifiée`)
      }

      eventObj = event

      const absenceRequest = new AbsenceRequest({
        user: userObj._id,
        nom: userObj.nom,
        status: 'absent',
        reason: reason,
        repetition: eventType === 'repetition' ? event._id : null,
        concert: eventType === 'concert' ? event._id : null,
        approved: false,
      })

      return absenceRequest.save()
    })
    .then((savedRequest) => {
      return res.status(201).json({
        success: true,
        message: "Demande d'absence créée avec succès",
        savedRequest,
      })
    })
    .catch((error) => {
      return res.status(500).json({ success: false, message: error.message })
    })
}

const createAbsenceRequest = async (req, res) => {
  try {
    const { userId, reason, dates, type } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' })
    }

    const absenceRequest = new AbsenceRequest({
      user: userId,
      reason,
      dates,
      type,
    })
    //sauvegarde f base
    await absenceRequest.save()

    res
      .status(201)
      .json({ message: "Demande d'absence créée avec succès", absenceRequest })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
const getAbsenceRequestsByUser = async (req, res) => {
  try {
    const { userId } = req.params

    const absenceRequests = await AbsenceRequest.find({
      User: userId,
    }).populate('user')
    res.status(200).json(absenceRequests)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
const createAbsence = async (req, res) => {
  try {
    const { user, status, reason, repetition, concert, approved ,
      absence} = req.body

    const newAbsenceRequest = new AbsenceRequest({
      user,
      absence,
      status,
      reason,
      repetition,
      concert,
      approved,
    })

    const savedAbsenceRequest = await newAbsenceRequest.save()

    res.status(201).json(savedAbsenceRequest)
  } catch (error) {
    console.error(
      "Erreur lors de la création de l'absence request :",
      error.message,
    )
    res
      .status(500)
      .json({ error: "Erreur lors de la création de l'absence request" })
  }
}

const getChoristesByRepetitionAndPupitre = async (req, res) => {
  try {
    const repetitionId = req.params.repetitionId
    const tessiture = req.params.tessiture

    const choristes = await AbsenceRequest.find({
      repetition: repetitionId,
      status: 'present',
    }).populate('user', '_id nom prenom email')

    const filteredChoristes = await Promise.all(
      choristes.map(async (absence) => {
        const pupitre = await Pupitre.findOne({ choristes: absence.user._id })

        if (pupitre && pupitre.tessiture === tessiture) {
          return {
            tessiture: tessiture,
            Participants: {
              _id: absence.user._id,
              nom: absence.user.nom,
              prenom: absence.user.prenom,
              email: absence.user.email,
            },
          }
        }
        return null
      }),
    )

    const choristesAvecTessiture = filteredChoristes.filter(
      (choriste) => choriste !== null,
    )

    const groupedChoristes = choristesAvecTessiture.reduce((acc, choriste) => {
      const { tessiture, Participants } = choriste
      if (!acc[tessiture]) {
        acc[tessiture] = { tessiture, Participants: [] }
      }
      acc[tessiture].Participants.push(Participants)
      return acc
    }, {})

    const result = Object.values(groupedChoristes)

    res.status(200).json(result)
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des choristes par répétition :',
      error.message,
    )
    res.status(500).json({
      error: 'Erreur lors de la récupération des choristes par répétition',
    })
  }
}

const getChoristesByConcertAndPupitre = async (req, res) => {
  try {
    const concertId = req.params.concertId

    const choristes = await AbsenceRequest.find({
      concert: concertId,
      status: 'present',
    }).populate('user', 'nom prenom _id')

    const pupitres = await Pupitre.find().populate('choristes')

    const utilisateursParPupitre = new Map()

    pupitres.forEach((pupitre) => {
      pupitre.choristes.forEach((choriste) => {
        utilisateursParPupitre.set(choriste._id.toString(), pupitre.tessiture)
      })
    })

    const groupedUsersByPupitre = {}
    const tauxAbsenceParPupitre = {}

    pupitres.forEach((pupitre) => {
      const totalMembres = pupitre.choristes.length
      const membresAbsents = choristes.filter(
        (choriste) =>
          choriste.user &&
          utilisateursParPupitre.get(choriste.user._id.toString()) ===
            pupitre.tessiture,
      ).length

      const tauxAbsence =
        totalMembres > 0
          ? ((membresAbsents / totalMembres) * 100).toFixed(2) + '%'
          : '0%'
      tauxAbsenceParPupitre[pupitre.tessiture] = tauxAbsence

      groupedUsersByPupitre[pupitre.tessiture] = {}
    })

    choristes.forEach((choriste) => {
      const utilisateurId = choriste.user._id.toString()
      const pupitreTessiture = utilisateursParPupitre.get(utilisateurId)

      if (pupitreTessiture) {
        if (!groupedUsersByPupitre[pupitreTessiture][utilisateurId]) {
          groupedUsersByPupitre[pupitreTessiture][utilisateurId] = {
            id: choriste.user._id,
            nom: choriste.user.nom,
            prenom: choriste.user.prenom,
            Nb_presence: 0,
            Nb_absence: 0,
          }
        }

        groupedUsersByPupitre[pupitreTessiture][utilisateurId][
          choriste.status === 'present' ? 'Nb_presence' : 'Nb_absence'
        ]++
      }
    })

    Object.keys(groupedUsersByPupitre).forEach((pupitreTessiture) => {
      const utilisateursArray = Object.values(
        groupedUsersByPupitre[pupitreTessiture],
      )
      utilisateursArray.sort((a, b) => b.Nb_presence - a.Nb_presence)
      groupedUsersByPupitre[pupitreTessiture] = utilisateursArray
    })

    res.status(200).json({
      'Participants par pupitre': groupedUsersByPupitre,
      "Taux d'absence par pupitre": tauxAbsenceParPupitre,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getAbsenceCountByUser = async (req, res) => {
  try {
    // Date précise ou depuis une date donnée
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null

    // Filtrer les demandes d'absence en fonction de la date précise ou de la plage de dates
    const filter = {}
    if (fromDate && toDate) {
      filter.absence = { $gte: fromDate, $lte: toDate }
    } else if (fromDate) {
      filter.absence = { $gte: fromDate }
    } else if (toDate) {
      filter.absence = { $eq: toDate }
    }

    // Ajouter la condition pour filtrer uniquement les répétitions
    filter.repetition = { $exists: true }

    // Récupérer les demandes d'absence qui correspondent aux critères de filtre
    const absenceRequests = await AbsenceRequest.find(filter).populate('user')

    // Compter le nombre d'absences et de présences par utilisateur
    const absenceCountByUser = {}
    absenceRequests.forEach((absence) => {
      const userId = absence.user._id.toString()
      if (!absenceCountByUser[userId]) {
        absenceCountByUser[userId] = {
          _id: userId,
          nom: absence.user.nom,
          prenom: absence.user.prenom,
          tessiture: absence.user.tessiture,
          absenceCount: 0,
          presenceCount: 0,
        }
      }
      if (absence.status === 'absent') {
        absenceCountByUser[userId].absenceCount++
      } else if (absence.status === 'present') {
        absenceCountByUser[userId].presenceCount++
      }
    })

    // Convertir le dictionnaire en tableau
    const absenceCountArray = Object.values(absenceCountByUser)

    res.status(200).json(absenceCountArray)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const getAbsenceCountByUserconcert = async (req, res) => {
  try {
    // Date précise ou depuis une date donnée
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null

    // Filtrer les demandes d'absence en fonction de la date précise ou de la plage de dates
    const filter = {}
    if (fromDate && toDate) {
      filter.absence = { $gte: fromDate, $lte: toDate }
    } else if (fromDate) {
      filter.absence = { $gte: fromDate }
    } else if (toDate) {
      filter.absence = { $lte: toDate }
    }

    // Ajouter la condition pour filtrer uniquement les concerts
    filter.concert = { $exists: true }

    // Récupérer les demandes d'absence qui correspondent aux critères de filtre
    const absenceRequests = await AbsenceRequest.find(filter).populate('user')

    // Initialiser le compteur d'absences et de présences par utilisateur
    const absenceCountByUser = {}

    // Parcourir les demandes d'absence pour calculer le nombre d'absences et de présences par utilisateur
    absenceRequests.forEach((absence) => {
      const userId = absence.user._id.toString()

      // Vérifier le statut de l'absence
      if (absence.status === 'absent') {
        if (!absenceCountByUser[userId]) {
          absenceCountByUser[userId] = {
            _id: userId,
            nom: absence.user.nom,
            prenom: absence.user.prenom,
            tessiture: absence.user.tessiture,
            absenceCount: 1,
            presenceCount: 0,
          }
        } else {
          absenceCountByUser[userId].absenceCount++
        }
      } else if (absence.status === 'present') {
        if (!absenceCountByUser[userId]) {
          absenceCountByUser[userId] = {
            _id: userId,
            nom: absence.user.nom,
            prenom: absence.user.prenom,
            tessiture: absence.user.tessiture,
            absenceCount: 0,
            presenceCount: 1,
          }
        } else {
          absenceCountByUser[userId].presenceCount++
        }
      }
    })

    // Convertir le dictionnaire en tableau
    const absenceCountArray = Object.values(absenceCountByUser)

    res.status(200).json(absenceCountArray)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
const getAbsenceCountByUserrep = async (req, res) => {
  try {
    // Date précise ou depuis une date donnée
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null

    // Filtrer les demandes d'absence en fonction de la date précise ou de la plage de dates
    const filter = {}
    if (fromDate && toDate) {
      filter.absence = { $gte: fromDate, $lte: toDate }
    } else if (fromDate) {
      filter.absence = { $gte: fromDate }
    } else if (toDate) {
      filter.absence = { $eq: toDate }
    }

    // Ajouter la condition pour filtrer uniquement les concerts
    filter.repetition = { $exists: true }

    // Récupérer les demandes d'absence qui correspondent aux critères de filtre
    const absenceRequests = await AbsenceRequest.find(filter).populate('user')

    // Initialiser le compteur d'absences et de présences par utilisateur
    const absenceCountByUser = {}

    // Parcourir les demandes d'absence pour calculer le nombre d'absences et de présences par utilisateur
    absenceRequests.forEach((absence) => {
      const userId = absence.user._id.toString()

      // Vérifier le statut de l'absence
      if (absence.status === 'absent') {
        if (!absenceCountByUser[userId]) {
          absenceCountByUser[userId] = {
            _id: userId,
            nom: absence.user.nom,
            prenom: absence.user.prenom,
            tessiture: absence.user.tessiture,
            absenceCount: 1,
            presenceCount: 0,
          }
        } else {
          absenceCountByUser[userId].absenceCount++
        }
      } else if (absence.status === 'present') {
        if (!absenceCountByUser[userId]) {
          absenceCountByUser[userId] = {
            _id: userId,
            nom: absence.user.nom,
            prenom: absence.user.prenom,
            tessiture: absence.user.tessiture,
            absenceCount: 0,
            presenceCount: 1,
          }
        } else {
          absenceCountByUser[userId].presenceCount++
        }
      }
    })

    // Convertir le dictionnaire en tableau
    const absenceCountArray = Object.values(absenceCountByUser)

    res.status(200).json(absenceCountArray)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
const getAbsenceCountByTessiture = async (req, res) => {
  try {
    // Date précise ou depuis une date donnée
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null

    // Filtrer les demandes d'absence en fonction de la date précise ou de la plage de dates
    const filter = {}
    if (fromDate && toDate) {
      filter.absence = { $gte: fromDate, $lte: toDate }
    } else if (fromDate) {
      filter.absence = { $gte: fromDate }
    } else if (toDate) {
      filter.absence = { $eq: toDate }
    }

    // Ajouter la condition pour filtrer uniquement les répétitions
    filter.repetition = { $exists: true }

    // Récupérer les demandes d'absence qui correspondent aux critères de filtre
    const absenceRequests = await AbsenceRequest.find(filter).populate('user')

    // Initialiser un dictionnaire pour stocker le nombre d'absences par tessiture
    const absenceCountByTessiture = {}

    // Calculer le nombre d'absences par tessiture
    absenceRequests.forEach((absence) => {
      const tessiture = absence.user.tessiture
      if (!absenceCountByTessiture[tessiture]) {
        absenceCountByTessiture[tessiture] = 1
      } else {
        absenceCountByTessiture[tessiture]++
      }
    })

    res.status(200).json(absenceCountByTessiture)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const getTotalAbsenceCount = async (req, res) => {
  try {
    // Date précise ou depuis une date donnée
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null
    console.log(fromDate)

    // Filtrer les demandes d'absence en fonction de la date précise ou de la plage de dates
    const filter = {}
    if (fromDate && toDate) {
      filter.absence = { $gte: fromDate, $lte: toDate }
    } else if (fromDate) {
      filter.absence = { $gte: fromDate }
    } else if (toDate) {
      filter.absence = { $eq: toDate }
    }

    // Ajouter la condition pour filtrer uniquement les répétitions
    filter.repetition = { $exists: true }
    console.log(filter)

    // Récupérer le nombre total d'absences
    const totalAbsenceCount = await AbsenceRequest.countDocuments(filter)

    // Grouper les absences par nom de répétition
    const absenceCountByRepetition = await AbsenceRequest.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'repetitions',
          localField: 'repetition',
          foreignField: '_id',
          as: 'repetition',
        },
      },
      { $unwind: '$repetition' },
      { $group: { _id: '$repetition.nom', count: { $sum: 1 } } },
    ])

    // Créer un dictionnaire pour stocker le nombre d'absences par nom de répétition
    const absenceCountMap = {}
    absenceCountByRepetition.forEach((item) => {
      absenceCountMap[item._id] = item.count
    })

    res
      .status(200)
      .json({ totalAbsenceCount, absenceCountByRepetition: absenceCountMap })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const getTotalAbsenceCountConcert = async (req, res) => {
  try {
    // Date précise ou depuis une date donnée
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null
    // Filtrer les demandes d'absence en fonction de la date précise ou de la plage de dates
    const filter = {}
    if (fromDate && toDate) {
      filter.absence = { $gte: fromDate, $lte: toDate }
    } else if (fromDate) {
      filter.absence = { $gte: fromDate }
    } else if (toDate) {
      filter.absence = { $lte: toDate }
    }

    // Ajouter la condition pour filtrer uniquement les répétitions
    filter.concert = { $exists: true }

    // Récupérer le nombre total d'absences
    const totalAbsenceCount = await AbsenceRequest.countDocuments(filter)

    // Grouper les absences par nom de répétition
    const absenceCountByRepetition = await AbsenceRequest.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'repetitions',
          localField: 'repetition',
          foreignField: '_id',
          as: 'repetition',
        },
      },
      { $unwind: '$repetition' },
      { $group: { _id: '$repetition.nom', count: { $sum: 1 } } },
    ])

    // Créer un dictionnaire pour stocker le nombre d'absences par nom de répétition
    const absenceCountMap = {}
    absenceCountByRepetition.forEach((item) => {
      absenceCountMap[item._id] = item.count
    })

    res
      .status(200)
      .json({ totalAbsenceCount, absenceCountByRepetition: absenceCountMap })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
const getAbsencePresenceCountByEvent = async (req, res) => {
  try {
    // Date précise ou plage de dates
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null

    // Filtrer les demandes d'absence en fonction de la date précise ou de la plage de dates
    const filter = {}
    if (fromDate && toDate) {
      filter.absence = { $gte: fromDate, $lte: toDate }
    } else if (fromDate) {
      filter.absence = { $gte: fromDate }
    } else if (toDate) {
      filter.absence = { $lte: toDate }
    }

    // Récupérer les demandes d'absence qui correspondent aux critères de filtre
    const absenceRequests = await AbsenceRequest.find(filter)

    // Initialiser les compteurs d'absences et de présences par événement
    const absencePresenceCountByEvent = {}

    // Parcourir les demandes d'absence pour calculer le nombre d'absences et de présences par événement
    absenceRequests.forEach((absence) => {
      const eventId = absence.repetition
        ? absence.repetition._id.toString()
        : absence.concert._id.toString()

      // Vérifier le statut de l'absence
      if (absence.status === 'absent') {
        if (!absencePresenceCountByEvent[eventId]) {
          absencePresenceCountByEvent[eventId] = {
            _id: eventId,
            type: absence.repetition ? 'repétition' : 'concert',
            date: absence.repetition
              ? absence.repetition.date
              : absence.concert.date,
            absenceCount: 1,
            presenceCount: 0,
          }
        } else {
          absencePresenceCountByEvent[eventId].absenceCount++
        }
      } else if (absence.status === 'present') {
        if (!absencePresenceCountByEvent[eventId]) {
          absencePresenceCountByEvent[eventId] = {
            _id: eventId,
            type: absence.repetition ? 'repetition' : 'concert',
            date: absence.repetition
              ? absence.repetition.date
              : absence.concert.date,
            absenceCount: 0,
            presenceCount: 1,
          }
        } else {
          absencePresenceCountByEvent[eventId].presenceCount++
        }
      }
    })

    // Convertir le dictionnaire en tableau
    const absencePresenceCountArray = Object.values(absencePresenceCountByEvent)

    res.status(200).json(absencePresenceCountArray)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const getAbsencePresenceByConcert = async (req, res) => {
  try {
    // Récupérer tous les concerts
    const concerts = await Concert.find()

    // Initialiser un tableau pour stocker les résultats
    const result = []

    // Parcourir tous les concerts
    for (const concert of concerts) {
      // Compter le nombre d'absences et de présences pour ce concert
      const absenceRequestsForConcert = await AbsenceRequest.find({
        concert: concert._id,
      })
      const countAbsences = absenceRequestsForConcert.filter(
        (request) => request.status === 'absent',
      ).length
      const countPresences = absenceRequestsForConcert.filter(
        (request) => request.status === 'present',
      ).length

      // Ajouter les informations au résultat
      result.push({
        concertId: concert._id,
        concertName: concert.nom_concert,
        concertDate: concert.date,
        countAbsences,
        countPresences,
      })
    }

    // Retourner le résultat dans la réponse
    res.status(200).json(result)
  } catch (error) {
    console.error(
      'Error fetching absence and presence count by concert:',
      error,
    )
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = {
  getAbsencePresenceByConcert,
  getAbsencePresenceCountByEvent,
  createAbsenceRequest,
  getAbsenceRequestsByUser,
  createAbsence,
  getChoristesByRepetitionAndPupitre,
  getChoristesByConcertAndPupitre,
  informerAbsence,
  getAbsenceCountByUser,
  getAbsenceCountByTessiture,
  getTotalAbsenceCount,
  getAbsenceCountByUserconcert,
  getAbsenceCountByUserrep,
  getTotalAbsenceCountConcert,
}
