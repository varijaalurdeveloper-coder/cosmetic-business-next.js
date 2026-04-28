import { NextResponse } from "next/server";
import { products as staticProducts } from "@/lib/data/products";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Initialize Supabase server client
    const supabase = createClient();

    // Fetch all products from Supabase
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase fetch error:", error);
    }

    // Transform and normalize DB products to match frontend structure
    const dbProducts = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image_url,
      inStock: p.in_stock,
      volume: p.volume,
      // Normalize tags field - derive from category
      tags: p.tags || deriveTagsFromCategory(p.category),
    }));

    // Normalize static products to include tags field
    const normalizedStaticProducts = staticProducts.map((product) => ({
      ...product,
      tags: deriveTagsFromCategory(product.category),
    }));

    // Merge DB products with static products
    const allProducts = [...dbProducts, ...normalizedStaticProducts];

    return NextResponse.json({ products: allProducts });
  } catch (err) {
    console.error("❌ AI PRODUCTS API ERROR:", err);

    // Fallback: return static products only with normalized fields
    const fallbackProducts = staticProducts.map((product) => ({
      ...product,
      tags: deriveTagsFromCategory(product.category),
    }));

    return NextResponse.json({ products: fallbackProducts });
  }
}

/**
 * Derive tags from product category
 */
function deriveTagsFromCategory(category: string): string[] {
  const categoryTags: Record<string, string[]> = {
    "hair-care": ["hair", "scalp", "growth"],
    "skin-care": ["skin", "face", "body"],
    "soap": ["body", "skin", "cleansing"],
    "lip-care": ["lips", "moisture", "care"],
  };

  return categoryTags[category] || ["general"];
}