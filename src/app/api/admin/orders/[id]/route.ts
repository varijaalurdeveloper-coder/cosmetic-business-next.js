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
 * GET single order by ID - admin only
 * Returns order with all items
 */
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
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch order with items
    const { data: order, error } = await supabase
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
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const formattedOrder = {
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
    };

    return NextResponse.json({
      success: true,
      order: formattedOrder,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT update order status - admin only
 * Valid statuses: pending, confirmed, shipped, delivered
 */
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
    const { status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["pending", "confirmed", "shipped", "delivered"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check if order exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from("orders")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status
    const { data: updatedOrder, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
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
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const formattedOrder = {
      id: updatedOrder.id,
      userId: updatedOrder.user_id,
      customerName: updatedOrder.customer_name,
      email: updatedOrder.email,
      phone: updatedOrder.phone,
      address: updatedOrder.address,
      total: updatedOrder.total,
      status: updatedOrder.status,
      createdAt: updatedOrder.created_at,
      items: updatedOrder.order_items || [],
    };

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: formattedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
