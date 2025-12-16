module.exports = {
  providers: {
    ollama: {
      name: "Ollama (Local)",
      endpoint: "http://host.docker.internal:11434/api/generate",
      listModelsEndpoint: "http://host.docker.internal:11434/api/tags"
    },

    openai: {
      name: "OpenAI",
      endpoint: "https://api.openai.com/v1/chat/completions",
      models: [
        "gpt-4o-mini",
        "gpt-4o",
        "gpt-4.1",
        "gpt-4.1-mini"
      ]
    },

    claude: {
      name: "Claude (Anthropic)",
      endpoint: "https://api.anthropic.com/v1/messages",
      models: [
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307"
      ]
    },

    gemini: {
      name: "Google Gemini",
      endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
      models: [
        "gemini-2.0-flash",
        "gemini-1.5-pro",
        "gemini-1.5-flash"
      ]
    }
  }
};
