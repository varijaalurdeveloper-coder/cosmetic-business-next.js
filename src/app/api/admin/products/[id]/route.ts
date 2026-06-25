import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin-auth";
import { sanitizeConcernKeywords } from "@/lib/ai/concern-keywords";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ helper
const jsonError = (msg: string, status = 500) =>
  NextResponse.json({ success: false, error: msg }, { status });

// ✅ category normalizer
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

// ================= GET SINGLE =================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await verifyAdminSession();

    if (!adminCheck?.isAdmin) {
      return jsonError("Unauthorized", 401);
    }

    const id = params?.id;

    if (!id) {
      return jsonError("Product ID required", 400);
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("❌ GET PRODUCT ERROR:", error);
      return jsonError("Product not found", 404);
    }

    return NextResponse.json({
      success: true,
      product: {
        id: String(data.id),
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image: data.image_url,
        inStock: data.in_stock,
        volume: data.volume,

        subcategory:
          Array.isArray(data.tags) && data.tags.length > 0
            ? data.tags[0]
            : null,

        concernKeywords: data.concerns || [],
        concerns: data.concerns || [],
        tags: data.tags || [],
        benefits: data.benefits || [],
        skin_type: data.skin_type || [],
        hair_type: data.hair_type || [],
        ingredients: data.ingredients || [],
        usage: data.usage || "",
      },
    });
  } catch (err) {
    console.error("❌ GET ERROR:", err);
    return jsonError("Internal server error");
  }
}

// ================= UPDATE =================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await verifyAdminSession();

    if (!adminCheck?.isAdmin) {
      return jsonError("Unauthorized", 401);
    }

    const id = params?.id;

    if (!id) {
      return jsonError("Product ID required", 400);
    }

    let body;

    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    console.log("✏️ PRODUCT UPDATE:", body);

    const updateData: Record<string, any> = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.price !== undefined) {
      const price = Number(body.price);

      if (Number.isNaN(price)) {
        return jsonError("Invalid price", 400);
      }

      updateData.price = price;
    }

    if (body.image !== undefined) {
      updateData.image_url = body.image;
    }

    if (body.category !== undefined) {
      updateData.category = normalizeCategory(body.category);
    }

    if (body.inStock !== undefined) {
      updateData.in_stock = body.inStock;
    }

    if (body.volume !== undefined) {
      updateData.volume = body.volume;
    }

    // ✅ store subcategory inside tags
    if (body.subcategory !== undefined) {
      updateData.tags = body.subcategory
        ? [body.subcategory]
        : [];
    }

    if (body.tags !== undefined) {
      updateData.tags = body.tags;
    }

    if (body.ingredients !== undefined) {
      updateData.ingredients = body.ingredients;
    }

    if (body.benefits !== undefined) {
      updateData.benefits = body.benefits;
    }

    if (body.skin_type !== undefined) {
      updateData.skin_type = body.skin_type;
    }

    if (body.hair_type !== undefined) {
      updateData.hair_type = body.hair_type;
    }

    if (
      body.concernKeywords !== undefined ||
      body.concerns !== undefined
    ) {
      const rawKeywords =
        body.concernKeywords ?? body.concerns;

      try {
        updateData.concerns =
          sanitizeConcernKeywords(rawKeywords);
      } catch (error) {
        return jsonError((error as Error).message, 400);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return jsonError("No fields to update", 400);
    }

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("❌ UPDATE ERROR:", error);
      return jsonError(error?.message || "Update failed", 500);
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: {
        id: String(data.id),
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image: data.image_url,
        inStock: data.in_stock,
        volume: data.volume,

        subcategory:
          Array.isArray(data.tags) && data.tags.length > 0
            ? data.tags[0]
            : null,

        concernKeywords: data.concerns || [],
        concerns: data.concerns || [],
        tags: data.tags || [],
        benefits: data.benefits || [],
        skin_type: data.skin_type || [],
        hair_type: data.hair_type || [],
        ingredients: data.ingredients || [],
        usage: data.usage || "",
      },
    });
  } catch (err) {
    console.error("❌ PUT ERROR:", err);
    return jsonError("Internal server error");
  }
}

// ================= DELETE =================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await verifyAdminSession();

    if (!adminCheck?.isAdmin) {
      return jsonError("Unauthorized", 401);
    }

    const id = params?.id;

    if (!id) {
      return jsonError("Product ID required", 400);
    }

    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("❌ DELETE ERROR:", error);
      return jsonError(error.message, 500);
    }

    if (!data || data.length === 0) {
      return jsonError("Product not found", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Deleted successfully",
      product: data[0],
    });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    return jsonError("Internal server error");
  }
}