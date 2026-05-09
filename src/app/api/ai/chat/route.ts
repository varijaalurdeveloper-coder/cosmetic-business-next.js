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
  if (c.includes("skin") || c.includes("face") || c.includes("soap"))
    return "skin";
  return "general";
}

function normalizeProductConcernKeywords(product: Product): string[] {
  const rawKeywords = [
    ...(product.concernKeywords ?? []),
    ...(product.concerns ?? []),
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

function calculateProductScore(productKeywords: string[], userKeywords: string[]) {
  let score = 0;
  const matchedRoots = new Set<string>();

  for (const userKeyword of userKeywords) {
    const userRoot = getConcernRoot(userKeyword) ?? userKeyword;
    const exactMatch = productKeywords.some((keyword) => keyword === userKeyword);
    const strongMatch = productKeywords.some(
      (keyword) => getConcernRoot(keyword) === userRoot
    );
    const secondaryMatch = productKeywords.some(
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
      score += 7;
      matchedRoots.add(userRoot);
      continue;
    }

    if (secondaryMatch) {
      score += 3;
    }
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

  for (const item of scoredItems) {
    const category = normalizeCategory(item.product.category);
    if (!buckets.has(category)) buckets.set(category, []);
    buckets.get(category)!.push(item);
  }

  for (const bucket of buckets.values()) {
    bucket.sort((a, b) => b.score - a.score);
  }

  for (const category of categories) {
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
    if (results.length >= 5) break;
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
  faceConcern: boolean
) {
  const requiredRoots = getConcernRootsFromKeywords(userKeywords);

  const scored = products
    .map((product) => {
      const productKeywords = normalizeProductConcernKeywords(product);
      if (productKeywords.length === 0) return null;
      if (!product.inStock) return null;

      const productCategory = normalizeCategory(product.category);
      if (!categories.includes("general") && !categories.includes(productCategory)) {
        return null;
      }

      if (faceConcern && productCategory === "skin" && !isFaceProduct(product)) {
        return null;
      }

      const { score, matchedRoots } = calculateProductScore(
        productKeywords,
        userKeywords
      );

      if (
        requiredRoots.length > 0 &&
        requiredRoots.every((root) => !matchedRoots.includes(root))
      ) {
        return null;
      }

      const scoreWithPriority = score + (product.priority ?? 0);
      if (scoreWithPriority < 7) return null;

      return { product, score: scoreWithPriority };
    })
    .filter((item): item is { product: Product; score: number } => Boolean(item))
    .sort((a, b) => b.score - a.score);

  return selectRecommendedProducts(scored, categories);
}

async function generateAIReply(
  userMessage: string,
  userKeywords: string[],
  products: Product[]
) {
  try {
    const productList = products
      .map((p, i) => `${i + 1}. ${p.name} (₹${p.price})`)
      .join("\n");

    const prompt = `You are an expert organic beauty advisor.

User concern: ${userMessage}
Detected concern keywords: ${userKeywords.join(", ") || "none"}

IMPORTANT RULES:
- ONLY recommend from the provided product list
- DO NOT add any extra products
- Keep response short and friendly
- Explain WHY these products help

Products:
${productList}

Return format:
1. Short advice (1-2 lines)
2. Recommended products list
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
    const filteredProducts = filterProducts(
      allProducts,
      categories,
      userKeywords,
      faceConcern
    );

    if (filteredProducts.length === 0) {
      return NextResponse.json({
        message:
          "No products are currently available for your concern. Please check our products page for similar products.\n/products",
        products: [],
      });
    }

    const aiReply = await generateAIReply(
      normalizedMessage,
      userKeywords,
      filteredProducts
    );

    return NextResponse.json({
      message: `${aiReply}\n\n👉 Tap “Add to Cart” or contact us on WhatsApp 😊`,
      products: filteredProducts,
    });
  } catch (err) {
    console.error("AI CHAT ERROR:", err);

    return NextResponse.json({
      message: "Something went wrong. Please try again.",
      products: [],
    });
  }
}
