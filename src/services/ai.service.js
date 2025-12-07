const axios = require('axios');
const aiConfig = require('../config/aiConfig');

/**
 * Service générique pour appeler différents providers d'IA
 */
class AIService {
    /**
     * Appeler le provider sélectionné
     * @param {string} provider - ollama, openai, claude, gemini
     * @param {string} model - Nom du modèle
     * @param {string} prompt - Prompt à envoyer
     * @param {string} apiKey - Clé API (optionnel pour Ollama)
     */
    async call(provider, model, prompt, apiKey = null) {
        console.log(` Calling ${provider} with model ${model}`);
        
        switch (provider) {
            case 'ollama':
                return this.callOllama(model, prompt);
            case 'openai':
                return this.callOpenAI(model, prompt, apiKey);
            case 'claude':
                return this.callClaude(model, prompt, apiKey);
            case 'gemini':
                return this.callGemini(model, prompt, apiKey);
            default:
                throw new Error(`Provider non supporté: ${provider}`);
        }
    }

    /**
     * Appeler Ollama (local)
     */
    async callOllama(model, prompt) {
        try {
            const response = await axios.post(
                aiConfig.providers.ollama.endpoint,
                {
                    model,
                    prompt,
                    stream: false
                },
                { timeout: 12000000 } // 2 minutes
            );

            return response.data.response;
        } catch (error) {
            console.error(' Erreur Ollama:', error.message);
            throw new Error(`Ollama error: ${error.message}`);
        }
    }

    /**
     * Appeler OpenAI
     */
    async callOpenAI(model, prompt, apiKey) {
        if (!apiKey) {
            throw new Error('OpenAI API key required');
        }

        try {
            console.log(' Using OpenAI API Key:', apiKey.substring(0, 10) + '...');
            
            const response = await axios.post(
                aiConfig.providers.openai.endpoint,
                {
                    model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 4000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 120000 // 2 minutes
                }
            );

            console.log(' OpenAI response received');
            return response.data.choices[0].message.content;
        } catch (error) {
            console.error(' Erreur OpenAI:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                throw new Error('Invalid OpenAI API key');
            } else if (error.response?.status === 429) {
                throw new Error('OpenAI rate limit exceeded');
            } else if (error.response?.data?.error?.message) {
                throw new Error(`OpenAI: ${error.response.data.error.message}`);
            } else {
                throw new Error(`OpenAI error: ${error.message}`);
            }
        }
    }

    /**
     * Appeler Claude (Anthropic)
     */
    async callClaude(model, prompt, apiKey) {
        if (!apiKey) {
            throw new Error('Claude API key required');
        }

        try {
            const response = await axios.post(
                aiConfig.providers.claude.endpoint,
                {
                    model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 4000
                },
                {
                    headers: {
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'Content-Type': 'application/json'
                    },
                    timeout: 120000
                }
            );

            return response.data.content[0].text;
        } catch (error) {
            console.error(' Erreur Claude:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                throw new Error('Invalid Claude API key');
            } else if (error.response?.data?.error?.message) {
                throw new Error(`Claude: ${error.response.data.error.message}`);
            } else {
                throw new Error(`Claude error: ${error.message}`);
            }
        }
    }

    /**
     * Appeler Google Gemini
     */
    async callGemini(model, prompt, apiKey) {
        if (!apiKey) {
            throw new Error('Gemini API key required');
        }

        try {
            const response = await axios.post(
                `${aiConfig.providers.gemini.endpoint}/${model}:generateContent?key=${apiKey}`,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 120000
                }
            );

            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error(' Erreur Gemini:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                throw new Error('Invalid Gemini API key');
            } else if (error.response?.data?.error?.message) {
                throw new Error(`Gemini: ${error.response.data.error.message}`);
            } else {
                throw new Error(`Gemini error: ${error.message}`);
            }
        }
    }
}

module.exports = new AIService();