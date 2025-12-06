const axios = require("axios");
const { providers } = require("../../config/aiConfig");

async function callOllama(model, prompt) {
  try {
    const response = await axios.post(providers.ollama.endpoint, {
      model,
      prompt,
      stream: false
    });
    return response.data.response;
  } catch (err) {
    throw new Error("Erreur Ollama: " + err.message);
  }
}

async function listOllamaModels() {
  const { listModelsEndpoint } = providers.ollama;
  const response = await axios.get(listModelsEndpoint);
  return response.data.models.map(m => m.name);
}

module.exports = { callOllama, listOllamaModels };
