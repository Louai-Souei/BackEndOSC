const Concert = require('../models/concert'); 
const User= require('../models/utilisateurs');
const Placement= require('../models/placement');

exports.updateParticipantPosition = async (req, res) => {
  try {
    const concertId  = req.params.id;
    const { participantName, newPosition } = req.body;

    const placement = await Placement.findOne({ concertId });

    if (!placement) {
      throw new Error('Placement not found');
    }

    const placementDetails = placement.placementDetails;
    const participantIndex = placementDetails.findIndex(
      participant => participant.participant === participantName
    );

    if (participantIndex === -1) {
      throw new Error('Participant not found in placement details');
    }
    placementDetails[participantIndex].position = newPosition;

   
    await Placement.findOneAndUpdate({ concertId }, { placementDetails });

    return res.status(200).json({ message: 'Participant position updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.proposePlacementBySize = async (req, res) => {
    try {
      const concertId = req.params.id;
      console.log(concertId);
      console.log(`Finding concert by ID: ${concertId}`);
      const concert = await Concert.findById(concertId).populate('participant');
      console.log(concert);
  
      if (!concert) {
        throw new Error('Concert non trouvé');
      }
  
      console.log('Concert found:', concert);
  
      const participants = concert.participant;
  
      if (!participants || participants.length === 0) {
        throw new Error('Aucun participant trouvé pour ce concert');
      }
  
      console.log('Participants found:', participants);
  
      const sortedParticipants = participants.sort((a, b) => {
        const tailleParticipantA = parseFloat(a.taille_en_m);
        const tailleParticipantB = parseFloat(b.taille_en_m);
  
        return tailleParticipantA - tailleParticipantB;
      });
  
      console.log('Sorted participants:', sortedParticipants);
  
      const placementProposal = [];
      let indexCourt = 0;
      let indexLong = sortedParticipants.length - 1;
  
      while (indexCourt <= indexLong) {
        placementProposal.push({
          participant: sortedParticipants[indexCourt].name,
          position: indexCourt === indexLong ? 'Arrière' : 'Avant',
        });
  
        indexCourt++;
        if (indexCourt < indexLong) {
          placementProposal.push({
            participant: sortedParticipants[indexLong].name,
            position: 'Arrière',
          });
          indexLong--;
        }
      }
  
      console.log('Placement proposal:', placementProposal);
  
      const placement = await Placement.findOne({ concertId });
  
      if (placement) {
        placement.placementDetails = placementProposal;
        await placement.save();
      } else {
        const newPlacement = new Placement({ concertId, placementDetails: placementProposal });
        await newPlacement.save();
      }
  
      console.log('Placement details saved:', placementProposal);

      res.json({ placementProposal });
    } catch (error) {
      res.status(500).json({ error: `Erreur lors de la proposition et sauvegarde des détails de placement : ${error.message}` });
    }
  };
  exports.annulerPlacement = async (req, res) => {
    try {
      const concertId = req.params.id;
      const placement = await Placement.findOne({ concertId });
      if (!placement) {
        return res.status(404).json({ message: 'Aucun placement trouvé pour ce concert.' });
      }
  
      await Placement.deleteOne({ concertId });
  
      return res.status(200).json({ message: 'Placement annulé avec succès.' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  