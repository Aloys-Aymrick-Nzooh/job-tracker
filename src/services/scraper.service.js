const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape le contenu d'une offre d'emploi depuis une URL
 * @param {string} url - URL de l'offre d'emploi
 * @param {number} maxLength - Longueur maximale du texte (défaut: 8000)
 * @returns {Promise<string>} - Contenu textuel de l'offre
 */
exports.scrape = async (url, maxLength = 8000) => {
    if (!url || typeof url !== 'string') {
        throw new Error('URL invalide');
    }

    try {
        new URL(url); // Vérifie que c'est une URL valide
    } catch (e) {
        throw new Error('Format d\'URL invalide');
    }

    //  Retry logic avec tentatives multiples
    let lastError;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Tentative ${attempt}/${maxRetries} pour scraper: ${url}`);

            const res = await axios.get(url, {
                headers: {
                    //  User-Agent plus réaliste
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Connection": "keep-alive",
                    "Upgrade-Insecure-Requests": "1"
                },
                timeout: 15000, //  Timeout augmenté à 15s
                maxRedirects: 5, //  Gère les redirections
                validateStatus: (status) => status >= 200 && status < 300 //  Validation du statut
            });

            const $ = cheerio.load(res.data);

            //  Suppression plus complète des éléments inutiles
            $('script, style, nav, header, footer, aside, noscript, iframe, svg').remove();
            $('.advertisement, .ads, .cookie-banner, #cookie-notice').remove();

            //  Extraction intelligente selon les balises communes d'offres d'emploi
            let text = '';

            // Essayer d'abord les balises communes pour les offres d'emploi
            const jobSelectors = [
                '.job-description',
                '#job-description',
                '[data-testid="job-description"]',
                '.description',
                'article',
                'main',
                '[role="main"]'
            ];

            for (const selector of jobSelectors) {
                const content = $(selector).first();
                if (content.length > 0) {
                    text = content.text();
                    break;
                }
            }

            //  Fallback sur body si aucun sélecteur spécifique trouvé
            if (!text || text.trim().length < 100) {
                text = $('body').text();
            }

            //  Nettoyage avancé
            text = text
                .replace(/\s+/g, ' ')           // Espaces multiples → simple
                .replace(/\n\s*\n/g, '\n')      // Lignes vides multiples → simple
                .trim();

            //  Vérification de contenu valide
            if (text.length < 50) {
                throw new Error('Contenu trop court, probablement échec du scraping');
            }

            //  Limite intelligente
            const finalText = text.substring(0, maxLength);
            
            console.log(` Scraping réussi: ${finalText.length} caractères extraits`);
            
            return finalText;

        } catch (err) {
            lastError = err;
            
            //  Log détaillé de l'erreur
            console.error(`Tentative ${attempt} échouée:`, {
                message: err.message,
                code: err.code,
                status: err.response?.status
            });

            //  Attendre avant la prochaine tentative (sauf dernière)
            if (attempt < maxRetries) {
                const delay = attempt * 1000; // 1s, 2s, 3s
                console.log(` Attente de ${delay}ms avant nouvelle tentative...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    //  Erreur détaillée après épuisement des tentatives
    const errorMessage = lastError.response?.status 
        ? `Échec du scraping (HTTP ${lastError.response.status}): ${lastError.message}`
        : `Échec du scraping: ${lastError.message}`;
    
    throw new Error(errorMessage);
};

/**
 *  BONUS: Fonction pour détecter si un site nécessite JavaScript
 */
exports.requiresJavaScript = (url) => {
    const jsOnlySites = [
        'linkedin.com',
        'indeed.com',
        'glassdoor.com',
        'welcometothejungle.com'
    ];
    
    return jsOnlySites.some(site => url.includes(site));
};