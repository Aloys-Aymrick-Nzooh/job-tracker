const axios = require("axios");
const { providers } = require("../../config/aiConfig");

async function callOpenAI(model, prompt, apiKey) {
  const response = await axios.post(
    providers.openai.endpoint,
    {
      model,
      messages: [{ role: "user", content: prompt }]
    },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  return response.data.choices[0].message.content;
}

module.exports = { callOpenAI };
