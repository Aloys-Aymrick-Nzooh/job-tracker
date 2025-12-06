const axios = require("axios");
const { providers } = require("../../config/aiConfig");

async function callGemini(model, prompt, apiKey) {
  const url = `${providers.gemini.endpoint}/${model}:generateContent?key=${apiKey}`;

  const response = await axios.post(url, {
    contents: [{ parts: [{ text: prompt }] }]
  });

  return response.data.candidates[0].content.parts[0].text;
}

module.exports = { callGemini };
