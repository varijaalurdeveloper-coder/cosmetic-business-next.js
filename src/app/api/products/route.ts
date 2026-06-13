import { NextResponse } from "next/server";
import { products as staticProducts } from "@/lib/data/products";
import { createClient } from "@supabase/supabase-js";

function normalizeCategory(category: string) {
  if (!category) return "general";

  const c = category.toLowerCase();
  if (c.includes("hair")) return "hair";
  if (c.includes("soap")) return "soap";
  if (c.includes("baby")) return "baby-care";
  if (c.includes("skin") || c.includes("face")) return "skin";
  if (c.includes("lip")) return "lips";
  return "general";
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // ✅ Fetch products from Supabase (public)
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase fetch error:", error);
    }

    // ✅ Transform DB products to match frontend
    const dbProducts = (data || []).map((p: any, index: number) => ({
      id: String(p.id ?? `db-${index}`),
      name: p.name,
      description: p.description,
      price: Number(p.price),
      category: normalizeCategory(p.category),
      image: p.image_url,
      inStock: Boolean(p.in_stock),
      volume: p.volume,
      concernKeywords: p.concerns || p.concernKeywords || [],
      tags: p.tags || [],
      benefits: p.benefits || [],
      skin_type: p.skin_type || [],
      hair_type: p.hair_type || [],
      ingredients: p.ingredients || [],
    }));

    // ✅ Merge static + DB products, with DB products overriding static duplicates
    const productsMap = new Map<string, any>();

    for (const product of staticProducts) {
      productsMap.set(String(product.id), product);
    }

    for (const product of dbProducts) {
      productsMap.set(String(product.id), product);
    }

    const allProducts = Array.from(productsMap.values());

    return NextResponse.json(
      { products: allProducts },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("❌ PRODUCTS API ERROR:", err);

    // fallback: return static products only
    return NextResponse.json({ products: staticProducts });
  }
}
