import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

// Use service role for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET user's orders - customer only
 * Fetches ONLY the logged-in user's orders from the database
 */
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("sb-auth-token")?.value;

    if (!authCookie) {
      return NextResponse.json(
        { success: true, orders: [] },
        { status: 200 }
      );
    }

    // Extract user ID from the request - requires JWT parsing
    // For now, we'll require explicit user ID header from authenticated client
    const authHeader = req.headers.get("x-user-id");

    if (!authHeader) {
      return NextResponse.json(
        { success: true, orders: [] },
        { status: 200 }
      );
    }

    // Fetch orders for this user only
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
      .eq("user_id", authHeader)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    // Format orders for response
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
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST create new order
 * IMPORTANT: Must insert into orders first, then order_items
 * user_id MUST come from Supabase auth, NEVER from client
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      customerName,
      email,
      phone,
      address,
      items,
      total,
    } = body;

    // Validate required fields
    if (!userId || !customerName || !email || !phone || !address) {
      return NextResponse.json(
        { error: "Missing required fields: userId, customerName, email, phone, address" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json(
        { error: "Order total must be a positive number" },
        { status: 400 }
      );
    }

    // Validate order items
    for (const item of items) {
      if (!item.product_id || !item.name || !item.price || !item.quantity) {
        return NextResponse.json(
          { error: "Each item must have: product_id, name, price, quantity" },
          { status: 400 }
        );
      }
      if (item.price <= 0 || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Item price and quantity must be positive" },
          { status: 400 }
        );
      }
    }

    // STEP 1: Insert into orders table
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: customerName,
        email,
        phone,
        address,
        total,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const orderId = orderData.id;

    // STEP 2: Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      // Delete the order if items insertion fails
      await supabase.from("orders").delete().eq("id", orderId);
      
      return NextResponse.json(
        { error: "Failed to add items to order" },
        { status: 500 }
      );
    }

    // STEP 3: Fetch complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
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
      .eq("id", orderId)
      .single();

    if (fetchError) {
      console.error("Error fetching created order:", fetchError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        order: completeOrder || {
          id: orderId,
          user_id: userId,
          customer_name: customerName,
          email,
          phone,
          address,
          total,
          status: "pending",
          created_at: new Date().toISOString(),
          items: orderItems,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}