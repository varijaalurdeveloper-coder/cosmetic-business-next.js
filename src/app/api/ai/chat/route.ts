import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { products as staticProducts } from "@/lib/data/products";
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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

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

function selectCandidateProducts(
  products: Product[],
  selectedCategory?: string,
  selectedSubcategory?: string,
  message?: string
) {
  const normalizedCategory = normalizeCategory(selectedCategory);
  const normalizedSubcategory = normalizeSubcategory(selectedSubcategory);
  const normalizedMessage = String(message ?? "").toLowerCase();

  const directMatches = products.filter((product) =>
    productMatchesCategoryOrSubcategory(product, normalizedCategory, normalizedSubcategory)
  );

  if (directMatches.length > 0) {
    return Array.from(new Map(directMatches.map((p) => [p.id, p])).values()).slice(0, 20);
  }

  const keywordMatches = products.filter((product) => {
    const text = [product.name, product.description, ...(product.tags ?? []), ...(product.benefits ?? []), ...(product.ingredients ?? [])]
      .join(" ")
      .toLowerCase();

    return (
      normalizedCategory !== "general" && text.includes(normalizedCategory)
    ) || (normalizedSubcategory && text.includes(normalizedSubcategory)) || (normalizedMessage && text.includes(normalizedMessage));
  });

  if (keywordMatches.length > 0) {
    return Array.from(new Map(keywordMatches.map((p) => [p.id, p])).values()).slice(0, 20);
  }

  return products
    .filter((product) => product.inStock)
    .slice(0, 20);
}

function formatProductForPrompt(product: Product) {
  const parts = [
    `id: ${product.id}`,
    `name: ${product.name}`,
    `description: ${product.description}`,
    `category: ${product.category || "general"}`,
  ];

  if (product.subcategory) parts.push(`subCategory: ${product.subcategory}`);
  if (product.ingredients?.length) parts.push(`ingredients: ${product.ingredients.join(", ")}`);
  if (product.benefits?.length) parts.push(`benefits: ${product.benefits.join(", ")}`);

  return parts.join(" | ");
}

function createRecommendationPrompt(
  selectedCategory: string | undefined,
  selectedSubcategory: string | undefined,
  products: Product[],
  userMessage: string,
  userKeywords: string[],
  knowledgeContext: string
) {
  const selectedCategoryLabel = selectedCategory ? selectedCategory : "general beauty";
  const selectedSubcategoryLabel = selectedSubcategory ? selectedSubcategory : "general concern";

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

Important:
- ONLY recommend products from the list above.
- Choose products that best match the selected category and subcategory.
- Prefer exact concern matches, but use semantic relevance if an exact match is unavailable.
- Include relevant products with empty category/subcategory when the description strongly matches the user concern.
- Return 3-5 top recommendations using product names only.
- Do not invent products or details.
- Keep your response warm, concise, and customer friendly.

Return a short recommendation paragraph and a numbered recommendation list of the best matching products.`;
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
    const knowledgeContext = buildKnowledgePromptContext(relevantDocs);
    const prompt = createRecommendationPrompt(
      selectedCategory,
      selectedSubcategory,
      products,
      userMessage,
      userKeywords,
      knowledgeContext
    );

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.error("Gemini error:", err);
    return null;
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
  try {
    const supabase = createAdminClient() ?? createClient();

    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error("Supabase error:", error);

    const dbProducts: Product[] = (data || [])
      .filter(isProductPublishedRow)
      .map((p: any) => ({
        id: String(p.id),
        name: p.name,
        price: Number(p.price) || 0,
        category: normalizeCategory(p.category),
        description: p.description || "",
        image: p.image_url || "/placeholder.png",
        inStock: p.in_stock ?? true,
        volume: p.volume,
        tags: p.tags || [],
        concerns: p.concerns || p.concernKeywords || [],
        concernKeywords: p.concernKeywords || p.concerns || [],
        skin_type: p.skin_type || [],
        hair_type: p.hair_type || [],
        benefits: p.benefits || [],
        ingredients: p.ingredients || [],
        usage: p.usage || "",
        priority: p.priority || 3,
        subcategory: p.subcategory || p.sub_category || undefined,
      }));

    const staticMapped: Product[] = staticProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      description: p.description,
      image: p.image,
      inStock: p.inStock,
      volume: p.volume,
      tags: p.tags || [],
      concerns: p.concerns || p.concernKeywords || [],
      concernKeywords: p.concernKeywords || p.concerns || [],
      skin_type: p.skin_type || [],
      hair_type: p.hair_type || [],
      benefits: p.benefits || [],
      ingredients: p.ingredients || [],
       usage: p.usage || "",
        priority: p.priority || 3,
        subcategory: p.subcategory || p.sub_category || undefined,
    }));

    const productMap = new Map<string, Product>();

    for (const product of [...staticMapped, ...dbProducts]) {
      const key = product.name.toLowerCase().trim();
      if (!productMap.has(key)) {
        productMap.set(key, product);
      }
    }

    return Array.from(productMap.values());
  } catch (error) {
    console.error("Product fetch failed:", error);
    return staticProducts as Product[];
  }
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
    const candidateProducts = selectCandidateProducts(
      allProducts,
      selectedCategory,
      selectedSubcategory,
      normalizedMessage
    );
    const { products: filteredProducts, confidenceScore } = filterProducts(
      candidateProducts,
      categories,
      userKeywords,
      faceConcern,
      normalizedMessage,
      selectedCategory
    );

    if (filteredProducts.length === 0) {
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
    const aiReply = await generateAIReply(
      normalizedMessage,
      userKeywords,
      filteredProducts,
      selectedCategory,
      selectedSubcategory,
      relevantDocs
    );

    return NextResponse.json({
      message: `${aiReply}\n\n👉 Tap “Add to Cart” or contact us on WhatsApp 😊`,
      products: filteredProducts,
      detectedConcerns: getConcernRootsFromKeywords(userKeywords),
      recommendedProducts: filteredProducts.map((product) => product.name),
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
