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
 * Auto-enrich product using name + description
 */
function autoEnrich(product: any) {
  const text = `${product.name} ${product.description}`.toLowerCase();

  const autoTags = [
    text.includes("hair") && "hair",
    text.includes("skin") && "skin",
    text.includes("lip") && "lips",
    text.includes("dry") && "dry",
    text.includes("dandruff") && "dandruff",
    text.includes("acne") && "acne",
  ].filter(Boolean);

  return autoTags;
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
    category: (p.category || "general").toLowerCase(),
    image: p.image_url || "/placeholder.png",
    inStock: p.in_stock ?? true,
    volume: p.volume,

    // 🔥 AI FIELDS
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

    // ✅ Transform DB products
    const dbProducts = (data || []).map(transformProduct);

    // ✅ Normalize static products same way
    const normalizedStaticProducts = staticProducts.map((p: any) =>
      transformProduct({
        ...p,
        image_url: p.image,
        in_stock: p.inStock,
      })
    );

    // ✅ Merge both
    const allProducts = [...dbProducts, ...normalizedStaticProducts];

    // ✅ Remove duplicates (by name)
    const uniqueProducts = Array.from(
      new Map(allProducts.map((p) => [p.name.toLowerCase(), p])).values()
    );

    return NextResponse.json({ products: uniqueProducts });
  } catch (err) {
    console.error("❌ AI PRODUCTS API ERROR:", err);

    // fallback
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