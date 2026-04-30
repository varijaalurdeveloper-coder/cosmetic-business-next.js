import { NextRequest, NextResponse } from "next/server";

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
  skin_type?: string[];
  hair_type?: string[];
  benefits?: string[];
}

// ✅ INTENT DETECTION
function detectIntent(message: string) {
  const text = message.toLowerCase();

  const categories = new Set<"hair" | "skin" | "lips">();
  const concerns = new Set<string>();

  if (/(hair|scalp)/.test(text)) categories.add("hair");
  if (/(lip)/.test(text)) categories.add("lips");
  if (/(skin|face)/.test(text)) categories.add("skin");

  const concernMap: Record<string, string[]> = {
    "dry hair": ["dry hair", "frizzy hair", "rough hair"],
    "oily skin": ["oily skin", "greasy skin"],
    "dry skin": ["dry skin", "flaky skin"],
    "dandruff": ["dandruff", "flakes"],
    "acne": ["acne", "pimple", "breakout"],
    "hair fall": ["hair fall", "hair loss", "thinning hair"],
    "pigmentation": ["dark spots", "pigmentation", "uneven skin"],
    "tan": ["tan", "sun tan"],
  };

  for (const key in concernMap) {
    if (concernMap[key].some(keyword => text.includes(keyword))) {
      concerns.add(key);
    }
  }

  return {
    categories: categories.size ? Array.from(categories) : ["general"],
    concerns: Array.from(concerns),
  };
}

// ✅ NORMALIZE CATEGORY
function normalizeCategory(category: string) {
  if (!category) return "general";

  const c = category.toLowerCase();

  if (c.includes("hair")) return "hair";
  if (c.includes("skin") || c.includes("face") || c.includes("soap")) return "skin";
  if (c.includes("lip")) return "lips";

  return "general";
}

// ✅ FETCH FROM AI PRODUCTS API (MAIN FIX)
async function fetchAllProducts(): Promise<Product[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` ||
      "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/ai/products`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch AI products");

    const data = await res.json();

    return data.products || [];

  } catch (error) {
    console.error("⚠️ Falling back to empty product list:", error);
    return [];
  }
}

// ✅ FILTERING (UNCHANGED)
function filterProducts(
  products: Product[],
  categories: string[],
  concerns: string[]
) {
  const results = products
    .map((product) => {
      let score = 0;
      const pCategory = normalizeCategory(product.category);

      if (!categories.includes("general") && !categories.includes(pCategory)) {
        return null;
      }

      score += 5;

      concerns.forEach((c) => {
        const lc = c.toLowerCase();

        if (product.concerns?.some(x => x.toLowerCase().includes(lc))) score += 30;
        if (product.benefits?.some(x => x.toLowerCase().includes(lc))) score += 20;
        if (product.tags?.some(x => x.toLowerCase().includes(lc))) score += 15;

        const text = `${product.name} ${product.description}`.toLowerCase();
        if (text.includes(lc)) score += 10;
      });

      return { product, score };
    })
    .filter(Boolean)
    .filter((p: any) => p.product.inStock)
    .sort((a: any, b: any) => b.score - a.score);

  const strongMatches = results.filter((p: any) => p.score >= 25);

  const finalResults = strongMatches.length
    ? strongMatches
    : results.slice(0, 6);

  return finalResults.slice(0, 6).map((p: any) => p.product);
}

// ✅ RESPONSE
function generateReply(concerns: string[], products: Product[]) {
  let advice = "";

  if (concerns.includes("dry hair")) {
    advice += "💇 Dry hair needs deep hydration and nourishing oils.\n";
  }
  if (concerns.includes("oily skin")) {
    advice += "🧴 Oily skin needs gentle cleansing and oil control.\n";
  }
  if (concerns.includes("acne")) {
    advice += "🌿 Acne-prone skin benefits from antibacterial and soothing ingredients.\n";
  }
  if (concerns.includes("hair fall")) {
    advice += "🌱 Strengthening roots and scalp care is important for hair fall.\n";
  }

  if (!advice) {
    advice = "✨ Based on your request, here are some recommended products.";
  }

  return `
💡 ${advice}

🌟 Recommended Products:

${products.map((p, i) => `${i + 1}. ${p.name} - ₹${p.price}`).join("\n")}

👉 Tap “Add to Cart” to purchase or ask me for more suggestions 😊
`;
}

// ✅ API
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const products = await fetchAllProducts();

    const { categories, concerns } = detectIntent(message);

    const filtered = filterProducts(products, categories, concerns);

    const reply = generateReply(concerns, filtered);

    return NextResponse.json({
      reply,
      products: filtered,
    });

  } catch (err) {
    console.error("AI CHAT ERROR:", err);

    return NextResponse.json({
      reply: "Something went wrong. Please try again.",
      products: [],
    });
  }
}