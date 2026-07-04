import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin-auth";
import { sanitizeConcernKeywords } from "@/lib/ai/concern-keywords";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ helper
const jsonError = (message: string, status = 500) =>
  NextResponse.json({ success: false, error: message }, { status });

function normalizeCategory(category: string | undefined | null) {
  if (!category?.toString().trim()) return "general";
  const c = category.toString().toLowerCase().replace(/\s+/g, "-");
  if (c.includes("hair")) return "hair";
  if (c.includes("lip")) return "lips";
  if (c.includes("soap")) return "soap";
  if (c.includes("baby")) return "baby-care";
  if (c === "body") return "body";
  if (c.includes("skin") || c.includes("face")) return "skin";
  return "general";
}

function normalizeKeywordInput(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") return raw.split(",").map(String);
  return [];
}

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
      id: String(p.id),
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image_url,
      inStock: p.in_stock,
      volume: p.volume,
      concernKeywords: p.concerns || p.concernKeywords || [],
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
      subcategory,
      tags = [],
      benefits = [],
      skin_type = [],
      hair_type = [],
      ingredients = [],
    } = body;

    if (!name?.trim()) return jsonError("Name is required", 400);
    if (!description?.trim()) return jsonError("Description is required", 400);
    if (price === undefined || isNaN(price)) return jsonError("Valid price required", 400);
    if (!image?.trim()) return jsonError("Image is required", 400);

    const normalizedCategory = normalizeCategory(category);

    const rawKeywords = normalizeKeywordInput(body.concernKeywords ?? body.concerns ?? []);
    let concernKeywords: string[] = [];

    try {
      concernKeywords = sanitizeConcernKeywords(rawKeywords);
    } catch (error) {
      return jsonError((error as Error).message, 400);
    }

    const text = `${name} ${description}`.toLowerCase();
    const autoConcerns: string[] = [];

    if (text.includes("dry skin") || text.includes("dry lips") || text.includes("dry hair")) {
      autoConcerns.push("dry skin");
    }
    if (text.includes("acne") || text.includes("breakout") || text.includes("pimple")) {
      autoConcerns.push("acne");
    }
    if (text.includes("dandruff") || text.includes("flaky scalp")) {
      autoConcerns.push("dandruff");
    }
    if (text.includes("hair fall") || text.includes("hair loss")) {
      autoConcerns.push("hair fall");
    }
    if (text.includes("dark spots") || text.includes("pigmentation") || text.includes("uneven")) {
      autoConcerns.push("pigmentation");
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
        concerns: concernKeywords.length ? concernKeywords : autoConcerns,
        tags,
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

    console.debug("ADMIN PRODUCT CREATED:", {
      id: data?.id,
      name: data?.name,
      category: data?.category,
      tags: data?.tags,
      concerns: data?.concerns,
    });

    const product = {
      id: String(data.id),
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      subcategory:
      Array.isArray(data.tags) && data.tags.length > 0
      ? data.tags[0]
       : null,
      image: data.image_url,
      inStock: data.in_stock,
      volume: data.volume,
      concernKeywords: data.concerns || data.concernKeywords || [],
      tags: data.tags || [],
      benefits: data.benefits || [],
      skin_type: data.skin_type || [],
      hair_type: data.hair_type || [],
      ingredients: data.ingredients || [],
    };

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return jsonError("Internal server error");
  }
}