const cvService = require('../services/cv.service');
const scraper = require('../services/scraper.service');
const aiService = require('../services/ai.service');
const pdfService = require('../services/pdf.service');
const messagesService = require('../services/messages.service');
const axios = require('axios');
const aiConfig = require('../config/aiConfig');



exports.analyze = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: "CV file required" 
            });
        }

        //  Récupérer le provider, model et apiKey
        const { jobUrl, jobDescription, companyName, position, provider, model, apiKey } = req.body;

        console.log(` Analysis request:`, {
            provider,
            model,
            hasApiKey: !!apiKey,
            company: companyName,
            position
        });

        // Validation
        if (!jobUrl && !jobDescription) {
            return res.status(400).json({
                success: false,
                error: "Veuillez fournir soit l'URL de l'offre, soit copier-coller la description du poste"
            });
        }

        //  Vérifier que la clé API est fournie pour les providers payants
        if (['openai', 'claude', 'gemini'].includes(provider) && !apiKey) {
            return res.status(400).json({
                success: false,
                error: `API Key required for ${provider}`
            });
        }

        const cvText = await cvService.extractPDF(req.file.buffer);

        let desc = jobDescription;
        
        if (jobUrl && !desc) {
            try {
                console.log(' Tentative de scraping:', jobUrl);
                desc = await scraper.scrape(jobUrl);
                console.log(' Scraping réussi');
            } catch (scrapingError) {
                console.error(' Échec du scraping:', scrapingError.message);
                
                return res.status(400).json({
                    success: false,
                    error: "Impossible de récupérer l'offre d'emploi depuis l'URL fournie.",
                    suggestion: "Veuillez copier la description du poste depuis le site et la coller dans le champ 'Description du poste' ci-dessous.",
                    details: scrapingError.message
                });
            }
        }

        if (!desc || desc.trim().length < 50) {
            return res.status(400).json({
                success: false,
                error: "La description du poste est trop courte ou vide",
                suggestion: "Veuillez copier-coller la description complète du poste"
            });
        }

        console.log(' Démarrage de l\'analyse IA...');
        
        //  Utiliser le service AI générique avec le provider sélectionné
        const analysis = await aiService.call(
            provider, 
            model, 
            messagesService.getAnalysisPrompt(cvText, desc),
            apiKey
        );
        
        console.log(' Analysis complete');
        
        const tailoredCV = await aiService.call(
            provider,
            model,
            messagesService.getCVPrompt(cvText, desc),
            apiKey
        );
        
        console.log(' Tailored CV complete');
        
        const coverLetter = await aiService.call(
            provider,
            model,
            messagesService.getCoverLetterPrompt(cvText, desc, companyName, position),
            apiKey
        );
        
        console.log(' Cover letter complete');
        
        const recruiterMessages = await aiService.call(
            provider,
            model,
            messagesService.getRecruiterMessagesPrompt(cvText, companyName, position),
            apiKey
        );
        
        console.log(' Recruiter messages complete');

        res.json({ 
            success: true, 
            analysis, 
            tailoredCV, 
            coverLetter, 
            recruiterMessages 
        });

    } catch (e) {
        console.error(' Erreur générale:', e);
        res.status(500).json({ 
            success: false,
            error: e.message 
        });
    }
};

//  Générer PDF pour le CV uniquement
exports.generateCVPDF = async (req, res) => {
    try {
        const { tailoredCV, companyName, position } = req.body;

        if (!tailoredCV) {
            return res.status(400).json({ 
                success: false,
                error: "CV content required" 
            });
        }

        const pdf = await pdfService.generateCV(tailoredCV, companyName, position);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="CV_${companyName}_${position}.pdf"`);
        res.send(pdf);

    } catch (e) {
        console.error(' Erreur génération PDF CV:', e);
        res.status(500).json({ 
            success: false,
            error: e.message 
        });
    }
};

//  Générer PDF pour la lettre de motivation uniquement
exports.generateCoverLetterPDF = async (req, res) => {
    try {
        const { coverLetter, companyName, position } = req.body;

        if (!coverLetter) {
            return res.status(400).json({ 
                success: false,
                error: "Cover letter content required" 
            });
        }

        const pdf = await pdfService.generateCoverLetter(coverLetter, companyName, position);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Lettre_Motivation_${companyName}_${position}.pdf"`);
        res.send(pdf);

    } catch (e) {
        console.error(' Erreur génération PDF Lettre:', e);
        res.status(500).json({ 
            success: false,
            error: e.message 
        });
    }
};

//  ANCIENNE MÉTHODE : Générer un package complet (optionnel)
exports.generatePDF = async (req, res) => {
    try {
        const pdf = await pdfService.generate(
            req.body.tailoredCV,
            req.body.coverLetter,
            req.body.companyName,
            req.body.position
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Package_${req.body.companyName}.pdf"`);
        res.send(pdf);

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.chat = async (req, res) => {
    try {
        const { message, context } = req.body;
        const prompt = messagesService.getChatPrompt(message, context);

        const reply = await ollama.call(prompt);

        res.json({ success: true, response: reply });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getModels = async (req, res) => {
    try {
        const providers = {
            ollama: [],
            openai: aiConfig.providers.openai.models,
            claude: aiConfig.providers.claude.models,
            gemini: aiConfig.providers.gemini.models
        };

        try {
            const ollamaResponse = await axios.get(
                aiConfig.providers.ollama.listModelsEndpoint,
                { timeout: 3000 }
            );
            
            if (ollamaResponse.data && ollamaResponse.data.models) {
                providers.ollama = ollamaResponse.data.models.map(m => m.name);
            }
        } catch (ollamaError) {
            console.log('Ollama not available, using fallback models');
            providers.ollama = [
                "llama3.2:1b",
                "llama3.2:3b",
                "qwen2.5:0.5b",
                "qwen2.5:1.5b",
                "phi4:latest"
            ];
        }

        res.json({
            success: true,
            providers
        });
    } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.checkStatus = async (req, res) => {
    try {
        const response = await axios.get(
            aiConfig.providers.ollama.listModelsEndpoint,
            { timeout: 3000 }
        );
        
        res.json({
            success: true,
            available: true,
            message: 'Ollama is online',
            models: response.data.models ? response.data.models.length : 0
        });
    } catch (error) {
        res.json({
            success: false,
            available: false,
            message: 'Ollama is offline. Make sure Ollama is running on your host machine.',
            error: error.message
        });
    }
};