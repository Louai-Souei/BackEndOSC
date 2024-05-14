const Oeuvres =require('../models/oeuvres');
const Concert =require('../models/concert');
const fs = require('fs');
const path = require('path');
const excelToJson = require('convert-excel-to-json');

// Create
const createOeuvre = async (req, res) => {
    try {
      const nouvelleOeuvre = new Oeuvres(req.body);
      await nouvelleOeuvre.save();
      res.status(201).json({
        model: nouvelleOeuvre,
        message: 'Oeuvre créée avec succès',
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        message: 'Erreur lors de la création de l\'œuvre',
      });
    }
  };

// get
const getAllOeuvres = async (req, res) => {
    try {
      const oeuvres = await Oeuvres.find();
      res.status(200).json({
        model: oeuvres,
        message: 'Succès',
      });
    } catch (error) {
      res.status(400).json({
        error: error.message,
        message: 'Problème d\'extraction des œuvres',
      });
    }
  };

//getByID

const getOeuvreById = async (req, res) => {
    try {
      const oeuvre = await Oeuvres.findById(req.params.id);
  
      if (!oeuvre) {
        res.status(404).json({
          message: 'Oeuvre non trouvée',
        });
      } else {
        res.status(200).json({
          model: oeuvre,
          message: 'Succès',
        });
      }
    } catch (error) {
      res.status(500).json({
        error: error.message,
        message: 'Erreur lors de la récupération de l\'œuvre',
      });
    }
  };
// Update
const updateOeuvre = async (req, res) => {
    try {
      // Mettez à jour l'œuvre par son ID
      const updatedOeuvre = await Oeuvres.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
      );
  
      if (!updatedOeuvre) {
        res.status(404).json({
          message: 'Oeuvre non trouvée',
        });
      } else {
        res.status(200).json({
          model: updatedOeuvre,
          message: 'Objet mis à jour',
        });
      }
    } catch (error) {
      res.status(400).json({
        error: error.message,
        message: 'Données invalides',
      });
    }
  };

// Delete
const deleteOeuvre = async (req, res) => {
    try {
      const deletedOeuvre = await Oeuvres.findOneAndDelete({ _id: req.params.id });
  
      if (!deletedOeuvre) {
        res.status(404).json({
          message: 'Oeuvre non trouvée',
        });
      } else {
        res.status(200).json({
          message: 'Oeuvre supprimée avec succès',
        });
      }
    } catch (error) {
      res.status(500).json({
        error: error.message,
        message: 'Erreur lors de la suppression de l\'œuvre',
      });
    }
};

const OeuvreStatistics = async (req, res) => {
  try {
    // Récupérer toutes les œuvres
    const oeuvres = await Oeuvres.find();
    
    const oeuvreStatistics = [];

    // Pour chaque œuvre, compter le nombre de concerts dans lesquels elle a été interprétée
    for (const oeuvre of oeuvres) {
      console.log(oeuvre)
      console.log(oeuvres)
      const concerts = await Concert.find({ 'programme.programme.oeuvre': oeuvre._id });

      oeuvreStatistics.push({
        idOeuvre: oeuvre._id,
        titre: oeuvre.titre,
        compositeur: oeuvre.compositeurs, // Assurez-vous que le champ correct est utilisé
        totalConcerts: concerts.length,
      });

    }

    // Envoyer les statistiques en réponse
    res.status(200).json({
      statistiquesOeuvres: oeuvreStatistics,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createOeuvreFromExcel = async (req, res) => {
  try {

    console.log(req.file.filename);
    const result = excelToJson({
      sourceFile: path.join(__dirname, '../', '/public/csv/' + req.file.filename),
      header: {
        rows: 1
      },
      columnToKey: {
        '*': '{{columnHeader}}'
      },
      sheets: ['Feuil1', 'Feuil2']
    });

    let oeuvresIds = [];

    if (result != null) {

      if (result.Feuil1 != null) {
        // SAVE OEUVRES 
       
        try {
          const oeuvresSaved = await Oeuvres.insertMany(result.Feuil1);
          await Promise.all(oeuvresSaved.map(async (element) => {
            oeuvresIds.push(element.id);
          }));
        } catch (err) {
          res.status(400).json(err);
        }

      }

      if (result.Feuil2 != null){
       
          // SAVE CONCERT WITH PROGRAMME
          await Promise.all(result.Feuil2.map(async (element) => {
            const nouvelleConcert = new Concert(element);
            console.log(oeuvresIds);
            nouvelleConcert.programme = oeuvresIds ; 
            await nouvelleConcert.save()              
          }));
      }

      res.status(200).json({ message: 'Concerts et programmes sont importés avec succees' });

    } else {
      return res.status(404).json({ message: 'Verifier format du fichier' });
    }
  } catch (error) {
    res.status(400).json(error)
  }
};


  module.exports = {
    createOeuvre,
    getAllOeuvres,
    getOeuvreById,
    updateOeuvre,
    deleteOeuvre,
    OeuvreStatistics,
    createOeuvreFromExcel
  };