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

// ✅ MULTI-INTENT DETECTION (FIXED)
function detectIntent(message: string) {
  const text = message.toLowerCase();

  const categories = new Set<"hair" | "skin" | "lips">();
  const concerns: string[] = [];

  // 🎯 CATEGORY DETECTION
  if (text.includes("hair")) categories.add("hair");
  if (text.includes("lip")) categories.add("lips");
  if (text.includes("skin") || text.includes("face")) categories.add("skin");

  // 🎯 CONCERN DETECTION
  if (text.includes("dry hair")) {
    categories.add("hair");
    concerns.push("dry hair");
  }

  if (text.includes("oily skin") || text.includes("oily face")) {
    categories.add("skin");
    concerns.push("oily skin");
  }

  if (text.includes("dry skin")) {
    categories.add("skin");
    concerns.push("dry skin");
  }

  if (text.includes("dandruff")) {
    categories.add("hair");
    concerns.push("dandruff");
  }

  if (text.includes("acne") || text.includes("pimple")) {
    categories.add("skin");
    concerns.push("acne");
  }

  if (text.includes("hair fall")) {
    categories.add("hair");
    concerns.push("hair fall");
  }

  return {
    categories: categories.size ? Array.from(categories) : ["general"],
    concerns,
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

// ✅ FETCH PRODUCTS
async function fetchAllProducts(): Promise<Product[]> {
  const supabase = createClient();

  const { data } = await supabase.from("products").select("*");

  const dbProducts: Product[] = (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: Number(p.price),
    category: normalizeCategory(p.category),
    image: p.image_url,
    inStock: p.in_stock,

    tags: p.tags || [],
    concerns: p.concerns || [],
    skin_type: p.skin_type || [],
    hair_type: p.hair_type || [],
    benefits: p.benefits || [],
  }));

  const normalizedStatic = staticProducts.map((p) => ({
    ...p,
    category: normalizeCategory(p.category),
  }));

  return [...dbProducts, ...normalizedStatic];
}

// ✅ MULTI-CONCERN FILTERING (FIXED)
function filterProducts(
  products: Product[],
  categories: string[],
  concerns: string[]
) {
  return products
    .map((product) => {
      let score = 0;

      const pCategory = normalizeCategory(product.category);

      // ✅ CATEGORY MATCH
      if (!categories.includes("general") && !categories.includes(pCategory)) {
        return null;
      }

      score += 10;

      // ✅ MULTIPLE CONCERNS
      concerns.forEach((c) => {
        const lc = c.toLowerCase();

        if (product.concerns?.some(x => x.toLowerCase().includes(lc))) score += 20;
        if (product.tags?.some(x => x.toLowerCase().includes(lc))) score += 10;
        if (product.benefits?.some(x => x.toLowerCase().includes(lc))) score += 10;
        if (product.hair_type?.some(x => x.toLowerCase().includes(lc))) score += 10;
        if (product.skin_type?.some(x => x.toLowerCase().includes(lc))) score += 10;

        const text = `${product.name} ${product.description}`.toLowerCase();
        if (text.includes(lc)) score += 5;
      });

      return { product, score };
    })
    .filter(Boolean)
    .filter((p: any) => p.product.inStock && p.score >= 10)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 6)
    .map((p: any) => p.product);
}

// ✅ BETTER RESPONSE (MULTI-CONCERN)
function generateReply(concerns: string[], products: Product[]) {
  let advice = "Here are some products suitable for your needs.";

  if (concerns.includes("dry hair")) {
    advice += "\n💇 Dry hair needs deep hydration. Use oils and conditioners.";
  }

  if (concerns.includes("oily skin")) {
    advice += "\n🧴 Oily skin needs oil-control and gentle cleansing.";
  }

  if (concerns.includes("dandruff")) {
    advice += "\n❄️ Use anti-dandruff shampoos regularly.";
  }

  return `
💡 ${advice}

🌟 Recommended Products:

${products.map((p, i) => `${i + 1}. ${p.name} - ₹${p.price}`).join("\n")}

Would you like to add any to cart? 😊
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
    return NextResponse.json({
      reply: "Something went wrong. Please try again.",
      products: [],
    });
  }
}