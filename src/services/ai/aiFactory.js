const { callOllama } = require("./ollamaService");
const { callOpenAI } = require("./openaiService");
const { callClaude } = require("./claudeService");
const { callGemini } = require("./geminiService");

async function callLLM(provider, model, prompt, apiKey) {
  switch (provider) {
    case "ollama":
      return await callOllama(model, prompt);

    case "openai":
      return await callOpenAI(model, prompt, apiKey);

    case "claude":
      return await callClaude(model, prompt, apiKey);

    case "gemini":
      return await callGemini(model, prompt, apiKey);

    default:
      throw new Error("Provider inconnue: " + provider);
  }
}

module.exports = { callLLM };
