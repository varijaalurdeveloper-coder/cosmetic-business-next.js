import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { products as staticProducts } from "@/lib/data/products";
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

interface Product {
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
  priority?: number;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";

function normalizeCategory(category: string) {
  if (!category) return "general";

  const c = category.toLowerCase();
  if (c.includes("hair")) return "hair";
  if (c.includes("lip")) return "lips";
  if (c.includes("soap")) return "soap";
  if (c.includes("baby")) return "baby-care";
  if (c.includes("skin") || c.includes("face")) return "skin";
  return "general";
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
    const supabase = createClient();

    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error("Supabase error:", error);

    const dbProducts: Product[] = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      category: p.category || "general",
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
      priority: p.priority || 3,
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
      priority: p.priority || 3,
    }));

    const productMap = new Map<string, Product>();

    for (const product of [...dbProducts, ...staticMapped]) {
      if (!productMap.has(product.id)) {
        productMap.set(product.id, product);
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
  rawMessage: string
) {
  const normalizedMessage = rawMessage
    .toLowerCase()
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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
      if (productKeywords.length === 0) return null;
      if (!product.inStock) return null;

      const productCategory = normalizeCategory(product.category);
      if (!categories.includes("general") && !categories.includes(productCategory)) {
        return null;
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

async function generateAIReply(
  userMessage: string,
  userKeywords: string[],
  products: Product[],
  relevantDocs: { collection: string; title: string; content: string }[]
) {
  try {
    const productList = products
      .map((p, i) => `${i + 1}. ${p.name} (₹${p.price})`)
      .join("\n");

    const knowledgeContext = buildKnowledgePromptContext(relevantDocs);

    const prompt = `You are an expert organic beauty advisor for Rima Cosmetics.

Use only the knowledge base context below when answering questions about the business, shipping, returns, owner credentials, or product usage. Avoid hallucination and do not invent product details.

Knowledge base context:
${knowledgeContext || "No additional context available."}

User concern: ${userMessage}
Detected concern keywords: ${userKeywords.join(", ") || "none"}

Products:
${productList}

IMPORTANT RULES:
- ONLY recommend from the provided product list
- DO NOT add any extra products
- Keep response warm, concise, and customer-friendly
- When the user asks about orders or shipping, refer to the shipping and order guidance only
- When the user asks about the owner, refer to the owner credentials only
- If you cannot answer from the provided context, say you do not have that information and suggest contacting the owner

Return format:
1. One or two sentences of personalized beauty advice
2. A short recommendation list of the products above
3. A friendly closing sentence that invites the user to add to cart or contact the owner
`;

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

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "✨ Here are some recommended products for you."
    );
  } catch (err) {
    console.error("Gemini error:", err);
    return "✨ Here are some recommended products for you.";
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
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
    const categories = getConcernCategoriesFromText(normalizedMessage);
    const faceConcern = isFaceConcern(normalizedMessage, userKeywords);
    const allProducts = await fetchAllProducts();
    const { products: filteredProducts, confidenceScore } = filterProducts(
      allProducts,
      categories,
      userKeywords,
      faceConcern,
      normalizedMessage
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
