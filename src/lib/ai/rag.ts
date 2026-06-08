import { KnowledgeDocument } from "./knowledge-base";
import { queryKnowledgeDocuments } from "./vector-store";

export async function getRelevantKnowledgeDocuments(
  query: string,
  topK = 4
): Promise<KnowledgeDocument[]> {
  return queryKnowledgeDocuments(query, topK);
}

export function buildKnowledgePromptContext(docs: KnowledgeDocument[]): string {
  if (!docs || docs.length === 0) {
    return "";
  }

  return docs
    .map(
      (doc) =>
        `Collection: ${doc.collection}\nTitle: ${doc.title}\nSource: ${doc.source}\nContent: ${doc.content}`
    )
    .join("\n\n");
}

export function buildKnowledgeSourceReferences(docs: KnowledgeDocument[]): string {
  return docs.map((doc) => `${doc.collection}: ${doc.title}`).join("; ");
}
