import { NextResponse } from "next/server";
import { products as staticProducts } from "@/lib/data/products";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Normalize array safely
 */
function normalizeArray(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v).toLowerCase().trim());
  }
  return [];
}

/**
 * Normalize category
 */
function normalizeCategory(category: string) {
  if (!category) return "general";

  const c = category.toLowerCase();

  if (c.includes("hair")) return "hair";
  if (c.includes("skin") || c.includes("face") || c.includes("soap")) return "skin";
  if (c.includes("lip")) return "lips";

  return "general";
}

/**
 * 🔥 STRONG AUTO ENRICH (UPGRADED)
 */
function autoEnrich(product: any) {
  const text = `${product.name} ${product.description}`.toLowerCase();

  const tags: string[] = [];

  // CATEGORY
  if (/(hair|scalp)/.test(text)) tags.push("hair");
  if (/(skin|face)/.test(text)) tags.push("skin");
  if (/(lip)/.test(text)) tags.push("lips");

  // HAIR
  if (/(dry|frizzy|rough)/.test(text)) tags.push("dry hair");
  if (/(dandruff|flakes)/.test(text)) tags.push("dandruff");
  if (/(hair fall|hair loss|thinning)/.test(text)) tags.push("hair fall");
  if (/(split ends)/.test(text)) tags.push("split ends");

  // SKIN
  if (/(oily|greasy)/.test(text)) tags.push("oily skin");
  if (/(dry skin|flaky)/.test(text)) tags.push("dry skin");
  if (/(acne|pimple|breakout)/.test(text)) tags.push("acne");
  if (/(pigmentation|dark spots)/.test(text)) tags.push("pigmentation");
  if (/(tan|sun tan)/.test(text)) tags.push("tan");
  if (/(sensitive)/.test(text)) tags.push("sensitive skin");
  if (/(dull|glow)/.test(text)) tags.push("dull skin");

  return tags;
}

/**
 * Transform product
 */
function transformProduct(p: any) {
  const tags = normalizeArray(p.tags);
  const concerns = normalizeArray(p.concerns);
  const skin_type = normalizeArray(p.skin_type);
  const hair_type = normalizeArray(p.hair_type);
  const benefits = normalizeArray(p.benefits);
  const ingredients = normalizeArray(p.ingredients);

  const enrichedTags = [
    ...tags,
    ...concerns,
    ...skin_type,
    ...hair_type,
    ...benefits,
    ...autoEnrich(p),
  ];

  return {
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: Number(p.price) || 0,
    category: normalizeCategory(p.category),
    image: p.image_url || "/placeholder.png",
    inStock: p.in_stock ?? true,
    volume: p.volume,

    // ✅ AI POWER FIELDS
    tags: [...new Set(enrichedTags)],
    concerns,
    skin_type,
    hair_type,
    benefits,
    ingredients,

    created_at: p.created_at,
  };
}

export async function GET() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase fetch error:", error);
    }

    const dbProducts = (data || []).map(transformProduct);

    const normalizedStaticProducts = staticProducts.map((p: any) =>
      transformProduct({
        ...p,
        image_url: p.image,
        in_stock: p.inStock,
      })
    );

    const allProducts = [...dbProducts, ...normalizedStaticProducts];

    // ✅ REMOVE DUPLICATES
    const uniqueProducts = Array.from(
      new Map(allProducts.map((p) => [p.name.toLowerCase(), p])).values()
    );

    return NextResponse.json({ products: uniqueProducts });

  } catch (err) {
    console.error("❌ AI PRODUCTS API ERROR:", err);

    const fallbackProducts = staticProducts.map((p: any) =>
      transformProduct({
        ...p,
        image_url: p.image,
        in_stock: p.inStock,
      })
    );

    return NextResponse.json({ products: fallbackProducts });
  }
}