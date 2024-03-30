const Excel = require('exceljs');
const Programme = require('../models/programme');
const Oeuvres = require('../models/oeuvres');
const mongoose = require('mongoose');
const { ObjectId } = require('bson');
//const ObjectId = mongoose.Types.ObjectId;



const addProgram = async (req, res) => {
  try {
    // Vérifier si un programme avec le même nom existe déjà
    const existingProgram = await Programme.findOne({ nom_programme: req.body.nom_programme });

    if (existingProgram) {
      return res.status(400).json({
        message: 'Un programme avec ce nom existe déjà',
        model: existingProgram,
      });
    }

    const nouveauProgramme = new Programme(req.body);

    // Obtenir les détails des œuvres à partir de leurs IDs
    const oeuvresDetails = await Promise.all(
      nouveauProgramme.oeuvres.map(async (oeuvreId) => {
        try {
          // Utiliser la fonction findById pour obtenir les détails de l'œuvre
          const details = await Oeuvres.findById(oeuvreId);
          return details;
        } catch (error) {
          console.error(`Erreur lors de la recherche de l'œuvre ${oeuvreId}:`, error);
          // Vous pouvez choisir de retourner null ou un objet vide selon vos besoins
          return null;
        }
      })
    );

    // Remplacer les IDs des œuvres par leurs détails dans le programme
    nouveauProgramme.oeuvres = oeuvresDetails;

    // Enregistrer le programme avec les détails des œuvres
    await nouveauProgramme.save();

    res.status(201).json({
      model: nouveauProgramme,
      message: 'Programme créé avec succès',
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Erreur lors de la création du programme',
    });
  }
};



const addProgramFromExcel2 = async (req, res) => {
  try {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.getWorksheet(1);
    const programsToAdd = [];

    worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
      //console.log("Ligne actuelle :", rowNumber);
      const cell1Value = row.getCell(1).value;
      const nomProgramme = Array.isArray(cell1Value) ? cell1Value : [cell1Value];
     // console.log("Valeur de la cellule A :", nomProgramme);

      const cell2Value = row.getCell(2).value;
      let oeuvresIds;

      if (typeof cell2Value === 'object' && cell2Value !== null) {
        console.error(`Contenu inattendu dans la cellule de la colonne 2 à la ligne ${row.number}:`, cell2Value);
        return; // Passer à la prochaine itération
      } else {
        oeuvresIds = Array.isArray(cell2Value) ? cell2Value : (cell2Value ? cell2Value.split(',') : []);
      }

      //console.log("Valeur de la cellule 1:", nomProgramme);
      //console.log("Valeur de la cellule 2:", oeuvresIds);
      //console.log("Adresse de la cellule 2:", row.getCell(2).address);
    
      const existingProgram = await Programme.findOne({ nom_programme: nomProgramme });

      if (existingProgram) {
        console.log(`Un programme avec le nom '${nomProgramme}' existe déjà.`);
        return;
      }
      const { ObjectId } = mongoose.Types;  // Importer ObjectId depuis mongoose.Types

    // Convertir les cellules du fichier Excel qui contiennent les IDs en ObjectId
      const objectIdArray = oeuvresIds.map(id => {
      const trimmedId = id.trim(); // Supprimer les espaces avant et après l'ID
  
  // Vérifier si la longueur de l'ID est valide (24 caractères hexadécimaux)
  if (trimmedId.length === 24 && /^[0-9a-fA-F]{24}$/.test(trimmedId)) {
    return new ObjectId(trimmedId);  // Utiliser 'new' pour créer l'ObjectId
  } else {
    console.error(`ID non valide : ${trimmedId}`);
    // Gérer le cas où l'ID n'est pas valide, peut-être le log ou d'autres actions nécessaires
    // Vous pouvez également choisir de retourner null ou un ObjectId par défaut, selon votre logique
    return null;
  }
}).filter(id => id !== null);  // Filtrer les IDs non valides

const nouveauProgramme = new Programme({
  nom_programme: nomProgramme,
  oeuvres: objectIdArray
});
      
      

programsToAdd.push(nouveauProgramme);
});

const savedPrograms = await Programme.insertMany(programsToAdd);

// Utilisation de la méthode map pour extraire les ids des oeuvres dans un tableau
const savedProgramIds = savedPrograms.map(program => program.oeuvres).flat();

// Utilisation de la méthode distinct pour s'assurer de l'unicité des IDs des oeuvres
const uniqueOeuvreIds = [...new Set(savedProgramIds)];

// Recherche des programmes détaillés avec les oeuvres populées
const detailedPrograms = await Programme.find({ _id: { $in: uniqueOeuvreIds } }).populate('oeuvres');

res.status(200).json({ success: true, message: 'Programmes ajoutés depuis le fichier Excel', savedPrograms: detailedPrograms });


  } catch (error) {
    console.error(`Erreur lors de l'exécution de la fonction addProgramFromExcel:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};




































const aaddProgramFromExcel = async (req, res) => {
  try {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.getWorksheet(1);

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      console.log("Ligne actuelle :", rowNumber);

      row.eachCell((cell, colNumber) => {
        console.log(`Colonne ${colNumber}: ${cell.value}`);
      });
    });

    res.status(200).json({ success: true, message: 'Fichier Excel lu avec succès' });
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la fonction addProgramFromExcel:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};








const addProgramFromExcel = async (req, res) => {
  try {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.getWorksheet(1);
    const programsToAdd = [];

    worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
      const cell1Value = row.getCell(1).value;
      const nomProgramme = Array.isArray(cell1Value) ? cell1Value : [cell1Value];

      const cell2Value = row.getCell(2).value;
      let oeuvresTitles;

      if (typeof cell2Value === 'object' && cell2Value !== null) {
        console.error(`Contenu inattendu dans la cellule de la colonne 2 à la ligne ${row.number}:`, cell2Value);
        return;
      } else {
        oeuvresTitles = Array.isArray(cell2Value) ? cell2Value : (cell2Value ? cell2Value.split(',') : []);
      }

      const existingProgram = await Programme.findOne({ nom_programme: nomProgramme });

      if (existingProgram) {
        console.log(`Un programme avec le nom '${nomProgramme}' existe déjà.`);
        resolve(); 
        return;
      }
      

      const oeuvresDetails = await Oeuvres.find({ titre: { $in: oeuvresTitles } });

      console.log(`Oeuvres détails pour le programme '${nomProgramme}':`, oeuvresDetails);
    
      const nouveauProgramme = new Programme({
        nom_programme: nomProgramme,
        oeuvres: oeuvresDetails.map(oeuvre => ({ titre: oeuvre.titre, _id: oeuvre._id }))
      });
      

      programsToAdd.push(nouveauProgramme);
    });
    
    const savedPrograms = await Promise.all(programsToAdd.map(program => program.save()));

    const detailedPrograms = await Programme.find({ _id: { $in: savedPrograms.map(program => program._id) } }).populate('oeuvres._id');

    res.status(200).json({
      success: true,
      message: 'Programmes ajoutés depuis le fichier Excel',
      savedPrograms: detailedPrograms
    });
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la fonction addProgramFromExcel:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};



module.exports = 
{addProgramFromExcel,
  addProgram

};