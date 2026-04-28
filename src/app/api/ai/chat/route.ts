import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { products as staticProducts } from "@/lib/data/products";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  inStock: boolean;
  volume?: string;
  tags: string[];
}

interface BeautyConcern {
  keywords: string[];
  category: string;
  tags: string[];
  advice: string;
  routine: string[];
}

const beautyConcerns: BeautyConcern[] = [
  {
    keywords: ["acne", "pimple", "breakout", "pimples", "acne-prone"],
    category: "skin-care",
    tags: ["skin", "face"],
    advice: "For acne-prone skin, I recommend a gentle cleanser followed by a non-comedogenic moisturizer. Avoid harsh scrubs that can irritate.",
    routine: ["Cleanser", "Toner", "Spot Treatment", "Moisturizer"]
  },
  {
    keywords: ["dry", "dryness", "flaky", "dehydrated"],
    category: "skin-care",
    tags: ["skin", "face", "body"],
    advice: "Dry skin needs deep hydration! Look for products with hyaluronic acid, glycerin, or ceramides. Apply moisturizer on damp skin for best absorption.",
    routine: ["Gentle Cleanser", "Hydrating Toner", "Moisturizer", "Face Oil"]
  },
  {
    keywords: ["oily", "oiliness", "greasy", "shiny"],
    category: "skin-care",
    tags: ["skin", "face"],
    advice: "Oily skin benefits from lightweight, oil-free products. Use a gel-based cleanser and avoid heavy creams. Niacinamide can help control excess oil.",
    routine: ["Foaming Cleanser", "Toner", "Gel Moisturizer", "Mattifying Primer"]
  },
  {
    keywords: ["hair fall", "hair loss", "hair thinning", "bald", "baldness"],
    category: "hair-care",
    tags: ["hair", "scalp", "growth"],
    advice: "Hair fall can be caused by stress, nutrition, or scalp issues. Use a mild shampoo, avoid heat styling, and consider hair oils with natural ingredients.",
    routine: ["Mild Shampoo", "Hair Oil", "Hair Serum", "Scalp Treatment"]
  },
  {
    keywords: ["dandruff", "flakes", "itchy scalp", "scalp"],
    category: "hair-care",
    tags: ["hair", "scalp"],
    advice: "Dandruff often comes from a dry or oily scalp. Use an anti-dandruff shampoo with ketoconazole or tea tree oil. Don't scratch - it worsens flakes!",
    routine: ["Anti-Dandruff Shampoo", "Scalp Exfoliator", "Scalp Serum", "Conditioner"]
  },
  {
    keywords: ["dark lips", "lip darkening", "lip pigmentation", "lip care"],
    category: "lip-care",
    tags: ["lips", "moisture", "care"],
    advice: "For dark lips, use a gentle lip scrub weekly and follow with a hydrating lip balm with SPF. Avoid licking lips as it causes more darkening.",
    routine: ["Lip Scrub", "Lip Balm", "Lip Mask", "Lip Lightener"]
  },
  {
    keywords: ["pigmentation", "dark spots", "sun spots", "uneven skin tone"],
    category: "skin-care",
    tags: ["skin", "face"],
    advice: "Pigmentation needs sun protection! Use vitamin C serum in the morning and retinol at night. Consistency is key for even skin tone.",
    routine: ["Vitamin C Serum", "Sunscreen", "Retinol", "Niacinamide"]
  },
  {
    keywords: ["aging", "wrinkles", "fine lines", "anti-aging", "mature"],
    category: "skin-care",
    tags: ["skin", "face"],
    advice: "For anti-aging, focus on retinol, peptides, and hyaluronic acid. Always use sunscreen to prevent further aging. Start with retinol slowly!",
    routine: ["Gentle Cleanser", "Retinol", "Hydrating Serum", "Rich Moisturizer"]
  },
  {
    keywords: ["sensitive", "sensitive skin", "irritation", "redness"],
    category: "skin-care",
    tags: ["skin", "face"],
    advice: "Sensitive skin needs minimal ingredients! Patch test everything. Avoid fragrance and alcohol. Stick to calming ingredients like aloe and centella.",
    routine: ["Micellar Water", "Calming Toner", "Cica Cream", "Mineral Sunscreen"]
  },
  {
    keywords: ["glow", "radiant", "brightening", "dull"],
    category: "skin-care",
    tags: ["skin", "face"],
    advice: "For glowing skin, use vitamin C and gentle exfoliation. Stay hydrated and get enough sleep! A good serum can instantly brighten your complexion.",
    routine: ["Gentle Cleanser", "Vitamin C Serum", "Hydrating Mist", "Moisturizer"]
  }
];

function deriveTagsFromCategory(category: string): string[] {
  const categoryTags: Record<string, string[]> = {
    "hair-care": ["hair", "scalp", "growth"],
    "skin-care": ["skin", "face", "body"],
    "soap": ["body", "skin", "cleansing"],
    "lip-care": ["lips", "moisture", "care"],
  };
  return categoryTags[category] || ["general"];
}

async function fetchAllProducts(): Promise<Product[]> {
  const supabase = createClient();

  const { data: dbData, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Supabase fetch error:", error);
  }

  const dbProducts = (dbData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    image: p.image_url,
    inStock: p.in_stock,
    volume: p.volume,
    tags: p.tags || deriveTagsFromCategory(p.category),
  }));

  const normalizedStaticProducts = staticProducts.map((product) => ({
    ...product,
    tags: deriveTagsFromCategory(product.category),
  }));

  return [...dbProducts, ...normalizedStaticProducts] as Product[];
}

function analyzeMessage(message: string): { concern: BeautyConcern | null; matchedKeywords: string[] } {
  const lowerMessage = message.toLowerCase();
  let matchedConcern: BeautyConcern | null = null;
  let matchedKeywords: string[] = [];

  for (const concern of beautyConcerns) {
    const foundKeywords = concern.keywords.filter((keyword) =>
      lowerMessage.includes(keyword)
    );

    if (foundKeywords.length > matchedKeywords.length) {
      matchedKeywords = foundKeywords;
      matchedConcern = concern;
    }
  }

  return { concern: matchedConcern, matchedKeywords };
}

function findRelevantProducts(
  products: Product[],
  concern: BeautyConcern | null,
  userMessage: string
): Product[] {
  const lowerMessage = userMessage.toLowerCase();
  const scoredProducts: { product: Product; score: number }[] = [];

  for (const product of products) {
    let score = 0;

    // Category match
    if (concern && product.category === concern.category) {
      score += 10;
    }

    // Tags match
    if (concern) {
      const matchingTags = product.tags.filter((tag) =>
        concern.tags.includes(tag)
      );
      score += matchingTags.length * 5;
    }

    // Keyword match in description
    const descriptionWords = product.description.toLowerCase().split(/\s+/);
    const concernKeywords = concern
      ? concern.keywords.flatMap((k) => k.split(/\s+/))
      : [];

    for (const keyword of concernKeywords) {
      if (descriptionWords.some((word) => word.includes(keyword))) {
        score += 3;
      }
    }

    // Direct keyword mention in message
    if (concern) {
      for (const keyword of concern.keywords) {
        if (product.name.toLowerCase().includes(keyword)) {
          score += 8;
        }
        if (product.description.toLowerCase().includes(keyword)) {
          score += 4;
        }
      }
    }

    // Must be in stock
    if (product.inStock && score > 0) {
      scoredProducts.push({ product, score });
    }
  }

  // Sort by score and return top 5
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.product);
}

function generateReply(
  concern: BeautyConcern | null,
  products: Product[],
  userMessage: string
): string {
  if (!concern) {
    // Default response for non-specific queries
    const productList = products.slice(0, 3).map((p) => p.name).join(", ");
    return `Thank you for your message! I see you're interested in our products. We have a wonderful collection of ${productList || "natural beauty products"} to explore. Could you tell me more about your specific skin or hair concern? I'm here to help you find the perfect products for your beauty routine!`;
  }

  const productSuggestions = products.slice(0, 5).map((p) => p.name).join(", ");
  const routineSteps = concern.routine.join(" → ");

  return `Based on what you've shared, I understand you're dealing with ${concern.matchedKeywords.join(" or ")}. Here's my personalized advice for you:

💡 ${concern.advice}

✨ Recommended Routine: ${routineSteps}

🌟 I've selected some products that might help you:

${products.map((p, i) => `${i + 1}. ${p.name} - ₹${p.price} (${p.category.replace("-", " ")})`).join("\n")}

Remember, consistency is key! Use these products regularly for best results. 

Would you like more details about any of these products or help with your order? 🌸`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Fetch all products
    const products = await fetchAllProducts();

    // Analyze user message
    const { concern, matchedKeywords } = analyzeMessage(message);

    // Find relevant products
    const relevantProducts = findRelevantProducts(products, concern, message);

    // Generate reply
    const reply = generateReply(concern, relevantProducts, message);

    return NextResponse.json({
      reply,
      products: relevantProducts,
      detectedConcern: concern ? {
        keywords: matchedKeywords,
        category: concern.category,
      } : null,
    });
  } catch (error) {
    console.error("❌ AI CHAT API ERROR:", error);

    // Fallback response
    return NextResponse.json({
      reply: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment!",
      products: [],
      error: "Internal server error",
    });
  }
}