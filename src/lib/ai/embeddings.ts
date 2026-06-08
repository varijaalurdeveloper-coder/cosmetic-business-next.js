const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const EMBEDDING_MODEL = "text-embedding-gecko-001";
const BASE_URL = "https://generativelanguage.googleapis.com/v1";

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text) return [];

  const url = `${BASE_URL}/models/${EMBEDDING_MODEL}:embedText${GEMINI_API_KEY ? `?key=${GEMINI_API_KEY}` : ""}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Embedding request failed:", response.status, errorText);
    return [];
  }

  const data = await response.json();
  return (
    data?.embedding?.[0]?.embedding ||
    data?.data?.[0]?.embedding ||
    data?.embeddings?.[0]?.embedding ||
    []
  );
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