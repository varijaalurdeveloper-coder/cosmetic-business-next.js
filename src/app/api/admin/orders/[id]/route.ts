import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin-auth";

// Supabase setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing required Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET single order
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.isAdmin) return adminCheck.response;

    const { id } = params;

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
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
      `
      )
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: {
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
      },
    });
  } catch (error) {
    console.error("GET order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT update order status
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.isAdmin) return adminCheck.response;

    const { id } = params;
    const { status } = await req.json();

    const validStatuses = ["pending", "confirmed", "shipped", "delivered"];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated",
    });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * ✅ DELETE order (ONLY if delivered)
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminCheck = await verifyAdminSession();
    if (!adminCheck.isAdmin) return adminCheck.response;

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    // 🔒 Step 1: Check order exists + status
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // 🔥 IMPORTANT: Only allow delete if delivered
    if (order.status !== "delivered") {
      return NextResponse.json(
        { error: "Only delivered orders can be deleted" },
        { status: 400 }
      );
    }

    // 🧹 Step 2: Delete related order_items FIRST
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", id);

    if (itemsError) {
      console.error("Delete items error:", itemsError);
      return NextResponse.json(
        { error: "Failed to delete order items" },
        { status: 500 }
      );
    }

    // 🗑 Step 3: Delete order
    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (orderError) {
      console.error("Delete order error:", orderError);
      return NextResponse.json(
        { error: "Failed to delete order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
