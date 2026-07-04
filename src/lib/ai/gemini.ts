const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_CHAT_MODEL = "gemini-2.5-flash";
const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-001";

export function getGeminiModelConfig() {
  return {
    chatModel: process.env.GEMINI_MODEL?.trim() || DEFAULT_CHAT_MODEL,
    embeddingModel: process.env.GEMINI_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL,
  };
}

export function buildGeminiModelUrl(modelName: string, action: "generateContent" | "embedContent" | "getModel") {
  const normalizedModel = modelName.trim();
  if (!normalizedModel) {
    throw new Error("A Gemini model name is required.");
  }

  if (action === "getModel") {
    return `${GEMINI_API_BASE}/models/${encodeURIComponent(normalizedModel)}`;
  }

  return `${GEMINI_API_BASE}/models/${encodeURIComponent(normalizedModel)}:${action}`;
}

function buildGeminiUrlWithKey(url: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  return apiKey ? `${url}?key=${encodeURIComponent(apiKey)}` : url;
}

export async function fetchGeminiJson(path: string, init: RequestInit = {}) {
  const response = await fetch(buildGeminiUrlWithKey(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error(`[Gemini] API request failed for ${path}:`, response.status, responseText || "(empty body)");
    throw new Error(`Gemini API request failed with status ${response.status}`);
  }

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error(`[Gemini] Failed to parse successful JSON response from ${path}:`, responseText, error);
    throw error;
  }
}

export async function verifyGeminiModelAvailability(modelName: string) {
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return { available: false, reason: "Missing GEMINI_API_KEY" };
  }

  try {
    const data = await fetchGeminiJson(buildGeminiModelUrl(modelName, "getModel"));
    return {
      available: Boolean(data?.name || data?.modelVersion),
      reason: data?.name ? "Model is available" : "Model metadata was empty",
    };
  } catch (error) {
    return {
      available: false,
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function ensureConfiguredGeminiModelIsAvailable() {
  const { chatModel } = getGeminiModelConfig();

  if (!process.env.GEMINI_API_KEY?.trim()) {
    console.warn("[Gemini] GEMINI_API_KEY is not set. Gemini requests will fail until it is configured.");
    return;
  }

  const result = await verifyGeminiModelAvailability(chatModel);

  if (!result.available) {
    console.warn(
      `[Gemini] Configured chat model "${chatModel}" could not be verified. ` +
        `The API returned: ${result.reason}. If this model is unsupported or deprecated, update GEMINI_MODEL.`
    );
  }
}

if (process.env.NEXT_PHASE !== "phase-production-build") {
  void ensureConfiguredGeminiModelIsAvailable();
}
