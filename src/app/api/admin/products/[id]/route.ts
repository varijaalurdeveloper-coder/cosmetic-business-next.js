import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin-auth";

// Initialize Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing required Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET single product by ID - admin only
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access (server-side validation)
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Format response
    const formattedProduct = {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image_url,
      inStock: data.in_stock,
      volume: data.volume,
    };

    return NextResponse.json({
      success: true,
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update product by ID - admin only
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access (server-side validation)
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const { id } = params;
    const body = await req.json();
    const { name, description, price, image, category, inStock, volume } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Validate at least one field is provided
    if (
      !name &&
      !description &&
      price === undefined &&
      !image &&
      !category &&
      inStock === undefined &&
      !volume
    ) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 }
      );
    }

    // Validate price if provided
    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (image !== undefined) updateData.image_url = image;
    if (category !== undefined) updateData.category = category;
    if (inStock !== undefined) updateData.in_stock = inStock;
    if (volume !== undefined) updateData.volume = volume;

    // Update product
    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Format response
    const formattedProduct = {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image_url,
      inStock: data.in_stock,
      volume: data.volume,
    };

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: formattedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE product by ID - admin only
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin access (server-side validation)
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Delete product
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}