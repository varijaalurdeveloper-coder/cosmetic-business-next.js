import { NextResponse } from "next/server";
import { products as staticProducts } from "@/lib/data/products";
import { createClient } from "@supabase/supabase-js";

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
    const dbProducts = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image_url,   // IMPORTANT mapping
      inStock: p.in_stock,
      volume: p.volume,
    }));

    // ✅ Merge static + DB products
    const allProducts = [...dbProducts, ...staticProducts];

    return NextResponse.json({ products: allProducts });
  } catch (err) {
    console.error("❌ PRODUCTS API ERROR:", err);

    // fallback: return static products only
    return NextResponse.json({ products: staticProducts });
  }
}
