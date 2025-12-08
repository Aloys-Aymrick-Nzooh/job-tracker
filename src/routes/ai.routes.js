const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');

const controller = require('../controllers/ai.controller');


router.get('/models', controller.getModels);
router.get('/status', controller.checkStatus);
router.post('/analyze', upload.single('cv'), controller.analyze);
router.post('/generate-pdf', controller.generatePDF);
router.post('/chat', controller.chat);

//ROUTES : PDFs séparés
router.post('/generate-cv-pdf', controller.generateCVPDF);
router.post('/generate-cover-letter-pdf', controller.generateCoverLetterPDF);

//l'ancienne route pour package complet
router.post('/generate-pdf', controller.generatePDF);

module.exports = router;
