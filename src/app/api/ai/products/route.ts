import { NextResponse } from "next/server";
import { products as staticProducts } from "@/lib/data/products";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Normalize array fields safely
 */
function normalizeArray(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).toLowerCase());
  return [];
}

/**
 * Normalize category (IMPORTANT FIX)
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
 * 🔥 SMART AUTO ENRICH (UPGRADED)
 */
function autoEnrich(product: any) {
  const text = `${product.name} ${product.description}`.toLowerCase();

  const tags: string[] = [];

  // CATEGORY
  if (text.includes("hair")) tags.push("hair");
  if (text.includes("skin") || text.includes("face")) tags.push("skin");
  if (text.includes("lip")) tags.push("lips");

  // HAIR CONDITIONS
  if (text.includes("dry")) tags.push("dry hair");
  if (text.includes("frizzy")) tags.push("dry hair");
  if (text.includes("dandruff")) tags.push("dandruff");
  if (text.includes("hair fall")) tags.push("hair fall");

  // SKIN CONDITIONS
  if (text.includes("oily")) tags.push("oily skin");
  if (text.includes("acne") || text.includes("pimple")) tags.push("acne");
  if (text.includes("dry skin")) tags.push("dry skin");

  return tags;
}

/**
 * Normalize and enrich product
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

    // 🔥 AI FIELDS (IMPORTANT)
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