const Besoin = require("../models/besoinpupitre");

exports.createBesoin = async (req, res) => {
  try {
    const { besoinAlto, besoinSoprano, besoinTénor, besoinBasse } = req.body;

    // Supprimer tous les besoins existants
    await Besoin.deleteMany({});

    // Créer et enregistrer le nouveau besoin
    const besoin = new Besoin({
      besoinAlto,
      besoinSoprano,
      besoinTénor,
      besoinBasse,
    });
    const newBesoin = await besoin.save();

    res.status(201).json(newBesoin);
  } catch (error) {
    console.error("Erreur lors de la création du besoin:", error);
    res.status(500).json({ error: "Erreur lors de la création du besoin" });
  }
};

exports.getAllBesoins = async (req, res) => {
  try {
    const besoins = await Besoin.find();
    res.status(200).json(besoins);
  } catch (error) {
    console.error("Erreur lors de la récupération des besoins:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des besoins" });
  }
};
