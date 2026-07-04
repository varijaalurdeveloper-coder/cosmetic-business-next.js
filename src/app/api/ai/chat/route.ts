import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products/getAllProducts";
import type { Product } from "@/types";

export const dynamic = "force-dynamic";
import {
  getAllowedConcernKeyword,
  getConcernCategoriesFromText,
  getConcernKeywordsFromText,
  getConcernCategory,
  getConcernRoot,
  getConcernRootsFromKeywords,
  hasBeautyIntent,
  isIrrelevantQuery,
} from "@/lib/ai/concern-keywords";
import {
  getRelevantKnowledgeDocuments,
  buildKnowledgePromptContext,
  buildKnowledgeSourceReferences,
} from "@/lib/ai/rag";
import type { KnowledgeDocument } from "@/lib/ai/knowledge-base";
import { buildGeminiModelUrl, fetchGeminiJson, getGeminiModelConfig } from "@/lib/ai/gemini";

{/*interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  inStock: boolean;
  volume?: string;

  tags?: string[];
  concerns?: string[];
  concernKeywords?: string[];

  skin_type?: string[];
  hair_type?: string[];

  benefits?: string[];
  ingredients?: string[];
  usage?: string;

  priority?: number;
  subcategory?: string;
}*/}

const { chatModel: GEMINI_MODEL } = getGeminiModelConfig();

function normalizeCategory(category: string | undefined | null) {
  if (!category) return "general";

  const c = String(category).toLowerCase();
  if (c.includes("hair")) return "hair";
  if (c.includes("lip")) return "lips";
  if (c.includes("soap")) return "soap";
  if (c.includes("baby")) return "baby-care";
  if (c.includes("skin") || c.includes("face")) return "skin";
  return "general";
}

function normalizeSubcategory(value: string | undefined | null) {
  if (!value) return "";
  return String(value).toLowerCase().replace(/[-–—]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeString(value: unknown): string {
  return String(value ?? "").toLowerCase().trim();
}

function hasTruthyFlag(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();
    return ["true", "1", "yes", "published", "visible", "active", "available", "in stock", "in_stock"].includes(normalized);
  }
  return false;
}

function isProductPublishedRow(row: any): boolean {
  if (row?.published !== undefined && !hasTruthyFlag(row.published)) return false;
  if (row?.is_published !== undefined && !hasTruthyFlag(row.is_published)) return false;
  if (row?.visible !== undefined && !hasTruthyFlag(row.visible)) return false;
  if (row?.is_visible !== undefined && !hasTruthyFlag(row.is_visible)) return false;
  if (row?.active !== undefined && !hasTruthyFlag(row.active)) return false;
  if (row?.is_active !== undefined && !hasTruthyFlag(row.is_active)) return false;
  if (row?.status !== undefined) {
    const status = String(row.status ?? "").toLowerCase().trim();
    if (status && !["published", "visible", "active", "available", "in stock", "in_stock"].includes(status)) {
      return false;
    }
  }
  return true;
}

function getProductSubcategoryCandidates(product: Product): string[] {
  const values = [
    ...(product.concerns ?? []),
    ...(product.concernKeywords ?? []),
    ...(product.tags ?? []),
    ...(product.subcategory ? [product.subcategory] : []),
  ];

  return Array.from(
    new Set(values.map((value) => normalizeString(value)).filter(Boolean))
  );
}

function productMatchesSubcategory(product: Product, selectedSubcategory: string): boolean {
  const normalizedSelected = normalizeSubcategory(selectedSubcategory);
  if (!normalizedSelected) return false;

  const candidates = getProductSubcategoryCandidates(product);
  if (candidates.includes(normalizedSelected)) {
    return true;
  }

  const text = [product.name, product.description, ...(product.tags ?? [])]
    .join(" ")
    .toLowerCase();

  return text.includes(normalizedSelected);
}

function productMatchesCategoryOrSubcategory(
  product: Product,
  selectedCategory?: string,
  selectedSubcategory?: string
) {
  const normalizedCategory = normalizeCategory(selectedCategory);
  const normalizedSubcategory = normalizeSubcategory(selectedSubcategory);
  const productCategory = normalizeCategory(product.category);

  if (normalizedCategory && normalizedCategory !== "general") {
    if (productCategory === normalizedCategory) {
      return true;
    }
  }

  if (normalizedSubcategory && productMatchesSubcategory(product, normalizedSubcategory)) {
    return true;
  }

  const text = [product.name, product.description, ...(product.tags ?? []), ...(product.benefits ?? []), ...(product.ingredients ?? [])]
    .join(" ")
    .toLowerCase();

  if (normalizedCategory && normalizedCategory !== "general" && text.includes(normalizedCategory)) {
    return true;
  }

  if (normalizedSubcategory && text.includes(normalizedSubcategory)) {
    return true;
  }

  return false;
}

function selectEligibleProducts(
  products: Product[],
  selectedCategory?: string,
  selectedSubcategory?: string
) {
  if (!selectedCategory && !selectedSubcategory) {
    return products;
  }

  const normalizedCategory = normalizeCategory(selectedCategory);
  const normalizedSubcategory = normalizeSubcategory(selectedSubcategory);

  const eligibleProducts = products.filter((product) =>
    productMatchesCategoryOrSubcategory(product, normalizedCategory, normalizedSubcategory)
  );

  return Array.from(new Map(eligibleProducts.map((p) => [p.id, p])).values());
}

function formatProductForPrompt(product: Product) {
  const parts = [
    `id: ${product.id}`,
    `name: ${product.name}`,
    `category: ${product.category || "general"}`,
    `subCategory: ${product.subcategory || ""}`,
    `description: ${product.description}`,
    `concerns: ${product.concerns?.join(", ") || ""}`,
    `concernKeywords: ${product.concernKeywords?.join(", ") || ""}`,
    `tags: ${product.tags?.join(", ") || ""}`,
    `ingredients: ${product.ingredients?.join(", ") || ""}`,
    `benefits: ${product.benefits?.join(", ") || ""}`,
    `skin_type: ${product.skin_type?.join(", ") || ""}`,
    `hair_type: ${product.hair_type?.join(", ") || ""}`,
    `usage: ${product.usage || ""}`,
    `priority: ${product.priority ?? 0}`,
    `searchMetadata: ${product.searchMetadata || ""}`,
  ];

  return parts.filter(Boolean).join(" | ");
}

function createRecommendationPrompt(
  selectedCategory: string |undefined,
  selectedSubcategory: string | undefined,
  products: Product[],
  userMessage: string,
  userKeywords: string[],
  knowledgeContext: string
) {
  const selectedCategoryLabel =
    selectedCategory ?? "general beauty";

  const selectedSubcategoryLabel =
    selectedSubcategory ?? "general concern";

  const productList = products
    .map((p, i) => `${i + 1}. ${formatProductForPrompt(p)}`)
    .join("\n");

  return `You are an expert organic beauty advisor for Rima Cosmetics.

Selected category: ${selectedCategoryLabel}
Selected subcategory: ${selectedSubcategoryLabel}
User concern: ${userMessage}
Detected keywords: ${userKeywords.join(", ") || "none"}

Products:
${productList}

Knowledge base context:
${knowledgeContext || "No additional context available."}

Instructions:

- Recommend ONLY products from the product list above.
- Choose the products that best match the user's concern.
- Recommend between 3 and 5 products.
- Never invent products, ingredients, prices, or benefits.
- Mention ONLY the PRODUCT NAMES.
- NEVER mention product IDs.
- NEVER mention UUIDs.
- NEVER reveal internal identifiers.
- Do NOT output values such as "id: 17" or UUID strings.
- Do NOT mention prices because the product cards already display them.
- Do NOT mention "Add to Cart" because the UI already provides that button.
- Write in a warm, friendly, and professional tone.
- End by inviting the customer to view the product cards shown below.

IMPORTANT:
Every product includes an internal ID for system use only.
Never reveal those IDs to the customer.

Return:
1. A short recommendation paragraph.
2. A bullet list containing ONLY PRODUCT NAMES.`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractRecommendedProductIdsFromReply(
  reply: string,
  products: Product[]
): string[] {
  const normalizedReply = reply.toLowerCase();
  const idLookup = new Map<string, string>();
  for (const product of products) {
    idLookup.set(String(product.id).toLowerCase(), String(product.id));
  }

  const foundIds = new Set<string>();
  const idPattern = /(?:id|product id)[:\s]*([a-z0-9-_]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = idPattern.exec(reply))) {
    const candidate = match[1].toLowerCase();
    if (idLookup.has(candidate)) {
      foundIds.add(idLookup.get(candidate)!);
    }
  }

  for (const [lowerId, originalId] of idLookup.entries()) {
    const regex = new RegExp(`\\b${escapeRegExp(lowerId)}\\b`, "i");
    if (regex.test(normalizedReply)) {
      foundIds.add(originalId);
    }
  }

  if (foundIds.size > 0) {
    return Array.from(foundIds).slice(0, 5);
  }

  for (const product of products) {
    const normalizedName = normalizeString(product.name);
    if (normalizedName && normalizedReply.includes(normalizedName.toLowerCase())) {
      foundIds.add(product.id);
    }
  }

  return Array.from(foundIds).slice(0, 5);
}

async function generateAIReply(
  userMessage: string,
  userKeywords: string[],
  products: Product[],
  selectedCategory: string | undefined,
  selectedSubcategory: string | undefined,
  relevantDocs: KnowledgeDocument[]
) {
  try {
    if (!process.env.GEMINI_API_KEY?.trim()) {
      console.warn("AI CHAT: GEMINI_API_KEY is not configured.");
      return { text: null, recommendedProductIds: [] };
    }

    const knowledgeContext = buildKnowledgePromptContext(relevantDocs);
    const prompt = createRecommendationPrompt(
      selectedCategory,
      selectedSubcategory,
      products,
      userMessage,
      userKeywords,
      knowledgeContext
    );

    const data = await fetchGeminiJson(buildGeminiModelUrl(GEMINI_MODEL, "generateContent"), {
      method: "POST",
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    console.debug("AI CHAT: gemini raw response", data);

    const rawReply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part?.text || "")
        .join("") ||
      data?.candidates?.[0]?.output ||
      data?.candidates?.[0]?.content?.[0]?.text ||
      data?.output?.[0]?.content?.[0]?.text ||
      data?.output?.[0]?.content?.text ||
      null;

    const recommendedProductIds = rawReply
      ? extractRecommendedProductIdsFromReply(rawReply, products)
      : [];

    console.debug("AI CHAT: gemini recommendation ids", {
      sentIds: products.map((product) => String(product.id)),
      returnedIds: recommendedProductIds,
      rawReply,
    });

    return {
      text: rawReply,
      recommendedProductIds,
    };
  } catch (err) {
    console.error("Gemini error:", err);
    return { text: null, recommendedProductIds: [] };
  }
}

function normalizeProductConcernKeywords(product: Product): string[] {
  const textKeywords = getConcernKeywordsFromText(
    [product.name, product.description, ...(product.tags ?? [])].join(" ")
  );

  const rawKeywords = [
    ...(product.concernKeywords ?? []),
    ...(product.concerns ?? []),
    ...textKeywords,
  ];

  return Array.from(
    new Set(
      rawKeywords
        .map((keyword) => getAllowedConcernKeyword(String(keyword).trim()))
        .filter((keyword): keyword is string => Boolean(keyword))
    )
  );
}

const faceProductRegex = /\b(face|facial|under eye|eye|cheek|forehead|chin|dark circles|fine lines|wrinkles|pore|t-zone)\b/;

function isFaceConcern(message: string, userKeywords: string[]) {
  const normalized = message.toLowerCase();

  if (userKeywords.some((keyword) => keyword.includes("face"))) {
    return true;
  }

  return faceProductRegex.test(normalized);
}

function isFaceProduct(product: Product) {
  const text = [product.name, product.description, ...(product.tags ?? [])]
    .join(" ")
    .toLowerCase();

  return faceProductRegex.test(text);
}

function calculateProductScore(
  product: Product,
  productKeywords: string[],
  userKeywords: string[]
) {
  let score = 0;
  const matchedRoots = new Set<string>();
  const productText = [
    product.name,
    product.description,
    ...(product.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  for (const userKeyword of userKeywords) {
    const userRoot = getConcernRoot(userKeyword) ?? userKeyword;
    const exactMatch = productKeywords.some((keyword) => keyword === userKeyword);
    const strongMatch = productKeywords.some(
      (keyword) => getConcernRoot(keyword) === userRoot
    );
    const categoryMatch = productKeywords.some(
      (keyword) =>
        getConcernCategory(keyword) !== null &&
        getConcernCategory(keyword) === getConcernCategory(userKeyword)
    );

    if (exactMatch) {
      score += 10;
      matchedRoots.add(userRoot);
      continue;
    }

    if (strongMatch) {
      score += 8;
      matchedRoots.add(userRoot);
      continue;
    }

    if (categoryMatch) {
      score += 4;
    }

    if (productText.includes(userRoot)) {
      score += 2;
    }
  }

  if (matchedRoots.size > 1) {
    score += 2;
  }

  if (product.priority) {
    score += Math.min(3, Math.max(0, product.priority - 2));
  }

  return { score, matchedRoots: Array.from(matchedRoots) };
}

async function fetchAllProducts(): Promise<Product[]> {
  return getAllProducts();
}

function selectRecommendedProducts(
  scoredItems: { product: Product; score: number }[],
  categories: string[]
) {
  const results: Product[] = [];
  const added = new Set<string>();
  const buckets = new Map<string, { product: Product; score: number }[]>();

  const desiredCategories = categories.length
    ? Array.from(new Set(categories.map(normalizeCategory)))
    : ["skin", "hair", "lips"];

  for (const item of scoredItems) {
    const category = normalizeCategory(item.product.category);
    if (!buckets.has(category)) buckets.set(category, []);
    buckets.get(category)!.push(item);
  }

  for (const bucket of buckets.values()) {
    bucket.sort((a, b) => b.score - a.score);
  }

  for (const category of desiredCategories) {
    const bucket = buckets.get(category);
    if (bucket) {
      const next = bucket.find((item) => !added.has(item.product.id));
      if (next) {
        results.push(next.product);
        added.add(next.product.id);
      }
    }
  }

  for (const item of scoredItems) {
    if (results.length >= 6) break;
    if (!added.has(item.product.id)) {
      results.push(item.product);
      added.add(item.product.id);
    }
  }

  return results;
}

function filterProducts(
  products: Product[],
  categories: string[],
  userKeywords: string[],
  faceConcern: boolean,
  rawMessage: string,
  selectedCategory?: string
) {
  const normalizedMessage = rawMessage
    .toLowerCase()
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const selectedSubcategoryLabel =
    categories.length === 1 && userKeywords.length === 1
      ? userKeywords[0]
      : normalizedMessage;

  const effectiveCategories = selectedCategory
    ? [normalizeCategory(selectedCategory)]
    : categories;

  const directSubcategoryMatches =
    effectiveCategories.length === 1 && selectedSubcategoryLabel
      ? products.filter((product) => {
          const productCategory = normalizeCategory(product.category);
          if (
            !effectiveCategories.includes("general") &&
            !effectiveCategories.includes(productCategory)
          ) {
            return false;
          }
          if (!product.inStock) return false;
          return productMatchesSubcategory(product, selectedSubcategoryLabel);
        })
      : [];

  if (directSubcategoryMatches.length > 0) {
    return {
      products: directSubcategoryMatches.slice(0, 6),
      confidenceScore: 0.9,
    };
  }

  const requiredRoots = getConcernRootsFromKeywords(userKeywords);
  const hasBabySignal = /\b(baby|infant|toddler)\b/.test(normalizedMessage);
  const hasUnderarmSignal = /\b(under arm|underarm)\b/.test(normalizedMessage);
  const acneRoot = userKeywords.some(
    (keyword) => getConcernRoot(keyword) === "acne"
  );
  const pigmentSignal = userKeywords.some((keyword) => {
    const root = getConcernRoot(keyword);
    return [
      "pigmentation",
      "tan",
      "dark circles",
      "skin brightening",
      "uneven skin tone",
      "dull skin",
      "dark spots",
      "underarm darkness",
    ].includes(root ?? "");
  });
  const hasDandruffRoot = userKeywords.some(
    (keyword) => getConcernRoot(keyword) === "dandruff"
  );

  const scored = products
    .map((product) => {
      const productKeywords = normalizeProductConcernKeywords(product);
      if (!product.inStock) return null;

      const productCategory = normalizeCategory(product.category);
      if (!categories.includes("general") && !categories.includes(productCategory)) {
        return null;
      }

      if (productKeywords.length === 0) {
        if (requiredRoots.length > 0) {
          return null;
        }

        return { product, score: Math.max(7, product.priority || 3) };
      }

      if (!hasBabySignal && /baby/i.test(product.name)) {
        return null;
      }

      if (hasDandruffRoot && productCategory === "lips") {
        return null;
      }

      if (
        acneRoot && !pigmentSignal &&
        /skin whitening cream|natural skin brightening cream|under arm skin whitening balm/i.test(
          product.name
        )
      ) {
        return null;
      }

      if (!hasUnderarmSignal && /under arm|underarm/i.test(product.name)) {
        return null;
      }

      if (faceConcern && productCategory === "skin" && !isFaceProduct(product)) {
        return null;
      }

      const { score, matchedRoots } = calculateProductScore(
        product,
        productKeywords,
        userKeywords
      );

      if (
        requiredRoots.length > 0 &&
        requiredRoots.every((root) => !matchedRoots.includes(root))
      ) {
        return null;
      }

      const scoreWithPriority = score;
      if (scoreWithPriority < 7) return null;

      return { product, score: scoreWithPriority };
    })
    .filter((item): item is { product: Product; score: number } => Boolean(item))
    .sort((a, b) => b.score - a.score);

  const confidenceScore = Math.min(
    1,
    Math.max(
      0.25,
      ((scored[0]?.score ?? 0) / 18) * 0.9 +
        Math.min(0.15, userKeywords.length * 0.03)
    )
  );

  return {
    products: selectRecommendedProducts(scored, categories),
    confidenceScore: Number(confidenceScore.toFixed(2)),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { message, selectedCategory, selectedSubcategory } = await request.json();
    const normalizedMessage = String(message || "").trim();

    if (!normalizedMessage) {
      return NextResponse.json({
        message:
          "Please tell me your skincare, haircare, or lip concern so I can recommend the right products.",
        products: [],
      });
    }

    if (isIrrelevantQuery(normalizedMessage) && !hasBeautyIntent(normalizedMessage)) {
      return NextResponse.json({
        message:
          "I can only help with skincare, haircare, and lip care product recommendations.",
        products: [],
      });
    }

    const userKeywords = getConcernKeywordsFromText(normalizedMessage);
    const categories = selectedCategory
      ? [normalizeCategory(String(selectedCategory))]
      : getConcernCategoriesFromText(normalizedMessage);
    const faceConcern = isFaceConcern(normalizedMessage, userKeywords);
    const allProducts = await fetchAllProducts();
    console.debug("AI CHAT: all products loaded", {
      totalProducts: allProducts.length,
      productIds: allProducts.map((product) => product.id),
    });

    const eligibleProducts = selectEligibleProducts(
      allProducts,
      selectedCategory,
      selectedSubcategory
    );

    console.debug("AI CHAT: eligible products selected", {
      eligibleProducts: eligibleProducts.length,
      eligibleIds: eligibleProducts.map((product) => product.id),
    });

    if (eligibleProducts.length === 0) {
      const relevantDocs = await getRelevantKnowledgeDocuments(normalizedMessage, 3);

      return NextResponse.json({
        message:
          "Currently this product is unavailable or out of stock. Please contact the business owner directly to enquire about fresh stock availability.",
        products: [],
        detectedConcerns: getConcernRootsFromKeywords(userKeywords),
        recommendedProducts: [],
        matchedKeywords: userKeywords,
        confidenceScore: 0,
        showContactButton: true,
        sourceReferences: buildKnowledgeSourceReferences(relevantDocs),
      });
    }

    const relevantDocs = await getRelevantKnowledgeDocuments(normalizedMessage, 4);

    console.debug("AI CHAT: candidate products sent to Gemini", {
      candidateCount: eligibleProducts.length,
      candidateIds: eligibleProducts.map((product) => product.id),
    });

    const aiResult = await generateAIReply(
      normalizedMessage,
      userKeywords,
      eligibleProducts,
      selectedCategory,
      selectedSubcategory,
      relevantDocs
    );

    const recommendedProductsById = aiResult.recommendedProductIds.length
      ? eligibleProducts.filter((product) =>
          aiResult.recommendedProductIds.includes(String(product.id))
        )
      : [];

    const fallbackResult = filterProducts(
      eligibleProducts,
      categories,
      userKeywords,
      faceConcern,
      normalizedMessage,
      selectedCategory
    );

    const finalProducts =
      recommendedProductsById.length > 0
        ? recommendedProductsById
        : fallbackResult.products;

    const confidenceScore =
      recommendedProductsById.length > 0
        ? Math.min(1, fallbackResult.confidenceScore + 0.15)
        : fallbackResult.confidenceScore;

    const replyText = aiResult.text
      ? `${aiResult.text}\n\n👉 Tap “Add to Cart” or contact us on WhatsApp 😊`
      : "Here are some recommendations based on your selected category and concern.\n\n👉 Tap “Add to Cart” or contact us on WhatsApp 😊";

    console.debug("AI CHAT: final products returned", {
      finalCount: finalProducts.length,
      finalIds: finalProducts.map((product) => product.id),
    });

    return NextResponse.json({
      message: replyText,
      products: finalProducts,
      detectedConcerns: getConcernRootsFromKeywords(userKeywords),
      recommendedProducts: finalProducts.map((product) => product.name),
      matchedKeywords: userKeywords,
      confidenceScore,
      showContactButton: false,
      sourceReferences: buildKnowledgeSourceReferences(relevantDocs),
    });
  } catch (err) {
    console.error("AI CHAT ERROR:", err);

    return NextResponse.json({
      message: "Something went wrong. Please try again.",
      products: [],
    });
  }
}
