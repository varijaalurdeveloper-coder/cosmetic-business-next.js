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

// ✅ BETTER INTENT DETECTION
function detectIntent(message: string) {
  const text = message.toLowerCase();

  let category: "hair" | "skin" | "lips" | "general" = "general";
  let concern: string | null = null;

  // 🎯 Category detection
  if (text.includes("hair")) category = "hair";
  else if (text.includes("lip")) category = "lips";
  else if (text.includes("skin") || text.includes("face")) category = "skin";

  // 🎯 Context-aware concern detection
  if (text.includes("dry hair")) {
    category = "hair";
    concern = "dry hair";
  } else if (text.includes("dry skin")) {
    category = "skin";
    concern = "dry skin";
  } else if (text.includes("dandruff")) {
    category = "hair";
    concern = "dandruff";
  } else if (text.includes("acne") || text.includes("pimple")) {
    category = "skin";
    concern = "acne";
  } else if (text.includes("hair fall")) {
    category = "hair";
    concern = "hair fall";
  }

  return { category, concern };
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

// ✅ STRICT + SMART FILTERING
function filterProducts(products: Product[], category: string, concern: string | null) {
  return products
    .map((product) => {
      let score = 0;

      const pCategory = normalizeCategory(product.category);

      // ❗ STRICT CATEGORY FILTER
      if (category !== "general" && pCategory !== category) {
        return null;
      }

      score += 10;

      if (concern) {
        const c = concern.toLowerCase();

        if (product.concerns?.some(x => x.toLowerCase().includes(c))) score += 20;
        if (product.tags?.some(x => x.toLowerCase().includes(c))) score += 10;
        if (product.benefits?.some(x => x.toLowerCase().includes(c))) score += 10;
        if (product.hair_type?.some(x => x.toLowerCase().includes(c))) score += 10;
        if (product.skin_type?.some(x => x.toLowerCase().includes(c))) score += 10;

        const text = `${product.name} ${product.description}`.toLowerCase();
        if (text.includes(c)) score += 5;
      }

      return { product, score };
    })
    .filter(Boolean)
    .filter((p: any) => p.product.inStock && p.score >= 10)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5)
    .map((p: any) => p.product);
}

// ✅ RESPONSE
function generateReply(category: string, concern: string | null, products: Product[]) {
  let advice = "Here are some products suitable for you.";

  if (concern === "dry hair") {
    advice = "Dry hair needs deep hydration. Use oils, conditioners, and avoid harsh shampoos.";
  } else if (concern === "dry skin") {
    advice = "Dry skin needs hydration. Use aloe vera, glycerin-based and nourishing products.";
  } else if (concern === "dandruff") {
    advice = "Use anti-dandruff shampoos and keep your scalp clean and moisturized.";
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

    const { category, concern } = detectIntent(message);

    const filtered = filterProducts(products, category, concern);

    const reply = generateReply(category, concern, filtered);

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