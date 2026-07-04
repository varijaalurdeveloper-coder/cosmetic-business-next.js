import { buildGeminiModelUrl, fetchGeminiJson, getGeminiModelConfig } from "./gemini";

const { embeddingModel: EMBEDDING_MODEL } = getGeminiModelConfig();

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text) return [];

  try {
    const data = await fetchGeminiJson(buildGeminiModelUrl(EMBEDDING_MODEL, "embedContent"), {
      method: "POST",
      body: JSON.stringify({
        content: {
          parts: [{ text }],
        },
      }),
    });

    return (
      data?.embedding?.values ||
      data?.embedding?.[0]?.embedding ||
      data?.embeddings?.[0]?.embedding ||
      data?.embedding?.[0]?.values ||
      []
    );
  } catch (error) {
    console.error("Embedding request failed:", error);
    return [];
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}