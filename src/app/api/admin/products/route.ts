import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin-auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ HELPER: always return JSON
const jsonError = (message: string, status = 500) => {
  return NextResponse.json({ success: false, error: message }, { status });
};

// ✅ GET PRODUCTS
export async function GET() {
  try {
    const adminCheck = await verifyAdminSession();

    if (!adminCheck?.isAdmin) {
      console.log("❌ Not admin");
      return jsonError("Unauthorized", 401);
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase fetch error:", error);
      return jsonError("Failed to fetch products");
    }

    const products = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image_url,
      inStock: p.in_stock,
      volume: p.volume,
    }));

    return NextResponse.json({ success: true, products });
  } catch (err) {
    console.error("❌ GET ERROR:", err);
    return jsonError("Internal server error");
  }
}

// ✅ CREATE PRODUCT
export async function POST(req: Request) {
  try {
    const adminCheck = await verifyAdminSession();

    if (!adminCheck?.isAdmin) {
      console.log("❌ Not admin (POST)");
      return jsonError("Unauthorized", 401);
    }

    let body;

    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    console.log("📦 Incoming product:", body);

    const {
      name,
      description,
      price,
      image,
      category,
      inStock,
      volume,
    } = body;

    // ✅ STRONG VALIDATION
    if (!name?.trim()) return jsonError("Name is required", 400);
    if (!description?.trim()) return jsonError("Description is required", 400);
    if (price === undefined || isNaN(price))
      return jsonError("Valid price required", 400);
    if (!image?.trim()) return jsonError("Image is required", 400);
    if (!category?.trim()) return jsonError("Category is required", 400);

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price,
        image_url: image,
        category,
        in_stock: inStock ?? true,
        volume: volume ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return jsonError(error.message || "Database error");
    }

    const product = {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image_url,
      inStock: data.in_stock,
      volume: data.volume,
    };

    console.log("✅ Product created:", product);

    return NextResponse.json(
      {
        success: true,
        message: "Product created",
        product,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ POST ERROR:", err);
    return jsonError("Internal server error");
  }
}