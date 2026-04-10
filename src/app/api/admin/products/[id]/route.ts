import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin-auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ✅ helper
const jsonError = (msg: string, status = 500) =>
  NextResponse.json({ success: false, error: msg }, { status });

// ✅ GET SINGLE
export async function GET(req: Request, { params }: any) {
  try {
    const adminCheck = await verifyAdminSession();

    if (!adminCheck?.isAdmin) {
      return jsonError("Unauthorized", 401);
    }

    const id = params?.id;

    if (!id) return jsonError("Product ID required", 400);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("❌ GET ONE:", error);
      return jsonError("Product not found", 404);
    }

    return NextResponse.json({
      success: true,
      product: {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image: data.image_url,
        inStock: data.in_stock,
        volume: data.volume,
      },
    });
  } catch (err) {
    console.error("❌ GET ERROR:", err);
    return jsonError("Internal server error");
  }
}

// ✅ UPDATE
export async function PUT(req: Request, { params }: any) {
  try {
    const adminCheck = await verifyAdminSession();

    if (!adminCheck?.isAdmin) {
      return jsonError("Unauthorized", 401);
    }

    const id = params?.id;
    if (!id) return jsonError("Product ID required", 400);

    let body;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }

    console.log("✏️ UPDATE:", body);

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) {
      if (isNaN(body.price)) return jsonError("Invalid price", 400);
      updateData.price = body.price;
    }
    if (body.image !== undefined) updateData.image_url = body.image;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.inStock !== undefined) updateData.in_stock = body.inStock;
    if (body.volume !== undefined) updateData.volume = body.volume;

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
      return jsonError("Update failed", 500);
    }

    return NextResponse.json({
      success: true,
      message: "Updated",
      product: {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image: data.image_url,
        inStock: data.in_stock,
        volume: data.volume,
      },
    });
  } catch (err) {
    console.error("❌ PUT ERROR:", err);
    return jsonError("Internal server error");
  }
}

// ✅ DELETE
export async function DELETE(req: Request, { params }: any) {
  try {
    const adminCheck = await verifyAdminSession();

    if (!adminCheck?.isAdmin) {
      return jsonError("Unauthorized", 401);
    }

    const id = params?.id;
    if (!id) return jsonError("Product ID required", 400);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ DELETE ERROR:", error);
      return jsonError("Delete failed", 500);
    }

    return NextResponse.json({
      success: true,
      message: "Deleted",
    });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    return jsonError("Internal server error");
  }
}