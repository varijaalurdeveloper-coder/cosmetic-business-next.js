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

// GET all products - admin only
export async function GET() {
  try {
    // Verify admin access (server-side validation)
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    // Map database fields to API response format
    const formattedProducts = (data || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image_url,
      inStock: product.in_stock,
      volume: product.volume,
    }));

    return NextResponse.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new product - admin only
export async function POST(req: Request) {
  try {
    // Verify admin access (server-side validation)
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    const body = await req.json();
    const { name, description, price, image, category, inStock, volume } =
      body;

    // Validation
    if (!name || !description || price === undefined || !image || !category) {
      return NextResponse.json(
        { error: "Missing required fields: name, description, price, image, category" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    // Create product in database
    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price,
        image_url: image,
        category,
        in_stock: inStock !== false, // default to true
        volume,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 }
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

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product: formattedProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}