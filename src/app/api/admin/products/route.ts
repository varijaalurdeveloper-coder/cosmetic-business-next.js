import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin-auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ helper
const jsonError = (message: string, status = 500) =>
  NextResponse.json({ success: false, error: message }, { status });

// ================= GET =================
export async function GET() {
  try {
    const adminCheck = await verifyAdminSession();

    if (!adminCheck?.isAdmin) {
      return jsonError("Unauthorized", 401);
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return jsonError("Failed to fetch products");
    }

    // ✅ RETURN FULL AI DATA
    const products = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image_url,
      inStock: p.in_stock,
      volume: p.volume,

      // 🔥 AI FIELDS (VERY IMPORTANT)
      concerns: p.concerns || [],
      tags: p.tags || [],
      benefits: p.benefits || [],
      skin_type: p.skin_type || [],
      hair_type: p.hair_type || [],
      ingredients: p.ingredients || [],
    }));

    return NextResponse.json({ success: true, products });
  } catch (err) {
    console.error(err);
    return jsonError("Internal server error");
  }
}

// ================= POST =================
export async function POST(req: Request) {
  try {
    const adminCheck = await verifyAdminSession();

    if (!adminCheck?.isAdmin) {
      return jsonError("Unauthorized", 401);
    }

    const body = await req.json();

    const {
      name,
      description,
      price,
      image,
      category,
      inStock,
      volume,

      // ✅ FROM FRONTEND (IMPORTANT)
      concerns = [],
      tags = [],
      benefits = [],
      skin_type = [],
      hair_type = [],
      ingredients = [],
    } = body;

    // ✅ VALIDATION
    if (!name?.trim()) return jsonError("Name is required", 400);
    if (!description?.trim()) return jsonError("Description is required", 400);
    if (price === undefined || isNaN(price))
      return jsonError("Valid price required", 400);
    if (!image?.trim()) return jsonError("Image is required", 400);
    if (!category?.trim()) return jsonError("Category is required", 400);

    // ✅ KEEP CATEGORY CONSISTENT (NO CONVERSION)
    const normalizedCategory = category;

    // ✅ OPTIONAL: fallback auto-tagging (only if admin didn't provide)
    let autoConcerns: string[] = [];
    let autoTags: string[] = [];

    if (concerns.length === 0) {
      const text = `${name} ${description}`.toLowerCase();

      if (text.includes("dry")) autoConcerns.push("dry");
      if (text.includes("acne")) autoConcerns.push("acne");
      if (text.includes("dandruff")) autoConcerns.push("dandruff");
      if (text.includes("hair fall")) autoConcerns.push("hair fall");

      if (text.includes("glow")) autoTags.push("glow");
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price,
        image_url: image,
        category: normalizedCategory,
        in_stock: inStock ?? true,
        volume: volume ?? null,

        // ✅ USE ADMIN DATA FIRST
        concerns: concerns.length ? concerns : autoConcerns,
        tags: tags.length ? tags : autoTags,
        benefits,
        skin_type,
        hair_type,
        ingredients,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return jsonError(error.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return jsonError("Internal server error");
  }
}