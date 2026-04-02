import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin-auth";

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing required Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET all orders - admin only
 * Fetches ALL orders from the database with their items
 */
export async function GET(req: Request) {
  try {
    // Verify admin access (server-side validation)
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.isAdmin) {
      return adminCheck.response;
    }

    // Fetch ALL orders with their order items
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        customer_name,
        email,
        phone,
        address,
        total,
        status,
        created_at,
        order_items (
          id,
          product_id,
          name,
          price,
          quantity
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    // Format orders for API response
    const formattedOrders = (orders || []).map((order: any) => ({
      id: order.id,
      userId: order.user_id,
      customerName: order.customer_name,
      email: order.email,
      phone: order.phone,
      address: order.address,
      total: order.total,
      status: order.status,
      createdAt: order.created_at,
      items: order.order_items || [],
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
