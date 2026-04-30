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
    if (concernMap[key].some((keyword) => text.includes(keyword))) {
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
  if (c.includes("skin") || c.includes("face") || c.includes("soap"))
    return "skin";
  if (c.includes("lip")) return "lips";

  return "general";
}

// ✅ 🔥 DIRECT PRODUCT FETCH (NO INTERNAL API CALL)
async function fetchAllProducts(): Promise<Product[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("Supabase error:", error);
    }

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
      concerns: p.concerns || [],
      skin_type: p.skin_type || [],
      hair_type: p.hair_type || [],
      benefits: p.benefits || [],
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
      concerns: p.concerns || [],
      skin_type: p.skin_type || [],
      hair_type: p.hair_type || [],
      benefits: p.benefits || [],
    }));

    return [...dbProducts, ...staticMapped];
  } catch (error) {
    console.error("Product fetch failed:", error);

    // fallback to static
    return staticProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      description: p.description,
      image: p.image,
      inStock: p.inStock,
      volume: p.volume,

      tags: p.tags || [],
      concerns: p.concerns || [],
      skin_type: p.skin_type || [],
      hair_type: p.hair_type || [],
      benefits: p.benefits || [],
    }));
  }
}

// ✅ FILTER PRODUCTS
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

        if (product.concerns?.some((x) => x.toLowerCase().includes(lc)))
          score += 30;
        if (product.benefits?.some((x) => x.toLowerCase().includes(lc)))
          score += 20;
        if (product.tags?.some((x) => x.toLowerCase().includes(lc)))
          score += 15;

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

// ✅ RESPONSE TEXT
function generateReply(concerns: string[], products: Product[]) {
  let advice = "";

  if (concerns.includes("dry hair")) {
    advice += "💇 Dry hair needs deep hydration and nourishing oils.\n";
  }
  if (concerns.includes("oily skin")) {
    advice += "🧴 Oily skin needs gentle cleansing and oil control.\n";
  }
  if (concerns.includes("acne")) {
    advice += "🌿 Acne-prone skin benefits from antibacterial care.\n";
  }
  if (concerns.includes("hair fall")) {
    advice += "🌱 Strengthening roots is important for hair fall.\n";
  }

  if (!advice) {
    advice = "✨ Here are some recommended products for you.";
  }

  return `
💡 ${advice}

🌟 Recommended Products:

${products.map((p, i) => `${i + 1}. ${p.name} - ₹${p.price}`).join("\n")}

👉 Tap “Add to Cart” or contact us on WhatsApp 😊
`;
}

// ✅ API
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const allProducts = await fetchAllProducts();

    const { categories, concerns } = detectIntent(message);

    const filteredProducts = filterProducts(
      allProducts,
      categories,
      concerns
    );

    const reply = generateReply(concerns, filteredProducts);

    return NextResponse.json({
      message: reply,
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