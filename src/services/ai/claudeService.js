const axios = require("axios");
const { providers } = require("../../config/aiConfig");

async function callClaude(model, prompt, apiKey) {
  const response = await axios.post(
    providers.claude.endpoint,
    {
      model,
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }]
    },
    {
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      }
    }
  );

  return response.data.content[0].text;
}

module.exports = { callClaude };
