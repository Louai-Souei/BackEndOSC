// qrcodeRoutes.js
const express = require('express');
const qrcode = require('qrcode');
const router = express.Router();
const Concert = require('../models/concert');
const Repetition = require('../models/repetition');

router.get('/:eventId', async (req, res) => {
    const { eventId } = req.params;

    try {
        const lienConfirmation = `http://loca/confirmation/${eventId}`;
        const qrCode = await qrcode.toDataURL(lienConfirmation);
        res.send(`<img src="${qrCode}" alt="QR Code">`);
    } catch (error) {
        console.error('Erreur lors de la génération du QR code :', error);
        res.status(500).send('Erreur lors de la génération du QR code');
    }
});

module.exports = router;
