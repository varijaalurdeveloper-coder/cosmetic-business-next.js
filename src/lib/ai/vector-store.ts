import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding, cosineSimilarity } from "./embeddings";
import { KnowledgeDocument, knowledgeDocuments } from "./knowledge-base";

const TABLE_NAME = process.env.SUPABASE_KNOWLEDGE_TABLE || "knowledge_documents";
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return null;
  }

  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });
}

async function syncKnowledgeStore() {
  const client = createAdminClient();
  if (!client) return;

  const rows = await Promise.all(
    knowledgeDocuments.map(async (doc) => ({
      id: doc.id,
      collection: doc.collection,
      title: doc.title,
      content: doc.content,
      source: doc.source,
      embedding: await generateEmbedding(doc.content),
    }))
  );

  await client.from(TABLE_NAME).upsert(rows, { onConflict: "id" });
}

function parseEmbedding(value: unknown): number[] {
  if (Array.isArray(value) && value.every((item) => typeof item === "number")) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === "number");
      }
    } catch {
      return [];
    }
  }

  return [];
}

export async function queryKnowledgeDocuments(
  query: string,
  topK = 4
): Promise<KnowledgeDocument[]> {
  if (!query) {
    return knowledgeDocuments.slice(0, topK);
  }

  const queryEmbedding = await generateEmbedding(query);
  if (queryEmbedding.length === 0) {
    return knowledgeDocuments.slice(0, topK);
  }

  const client = createAdminClient();

  if (client) {
    try {
      const seed = await client.from(TABLE_NAME).select("id").limit(1).single();
      if (!seed.data) {
        await syncKnowledgeStore();
      }

      const { data, error } = await client
        .from(TABLE_NAME)
        .select("id,collection,title,content,source,embedding");

      if (!error && Array.isArray(data)) {
        const candidateDocs = data
          .map((row: any) => ({
            id: row.id,
            collection: row.collection,
            title: row.title,
            content: row.content,
            source: row.source,
            embedding: parseEmbedding(row.embedding),
          }))
          .filter((doc) => doc.embedding.length > 0);

        const scored = candidateDocs
          .map((doc) => ({
            doc,
            score: cosineSimilarity(queryEmbedding, doc.embedding),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, topK)
          .filter((item) => item.score > 0.05)
          .map((item) => item.doc);

        if (scored.length > 0) {
          return scored;
        }
      }
    } catch (error) {
      console.error("Knowledge store query failed:", error);
    }
  }

  const fallback = knowledgeDocuments
    .map((doc) => ({
      doc,
      score: scoreTextSimilarity(query, doc.content),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => item.doc);

  return fallback;
}

function scoreTextSimilarity(query: string, content: string): number {
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const queryTokens = normalize(query).split(" ").filter(Boolean);
  const contentTokens = normalize(content).split(" ").filter(Boolean);

  if (queryTokens.length === 0 || contentTokens.length === 0) {
    return 0;
  }

  const contentSet = new Set(contentTokens);
  const commonTokens = queryTokens.filter((token) => contentSet.has(token));
  return commonTokens.length / Math.max(queryTokens.length, contentTokens.length);
}
