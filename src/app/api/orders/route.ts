import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * 🔹 Client for logged-in user (reads cookies)
 */
function getUserClient() {
  const cookieStore = cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name) => {
        const value = cookieStore.get(name)?.value;
        console.log("Cookie read:", name, value ? "FOUND" : "MISSING");
        return value;
      },
      set: () => {},
      remove: () => {},
    },
  });
}

/**
 * 🔹 Admin client (bypass RLS)
 */
function getAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey);
}

/**
 * =========================
 * ✅ GET ORDERS (DEBUG)
 * =========================
 */
export async function GET(req: Request) {
  try {
    console.log("===== GET /api/orders called =====");

    const admin = getAdminClient();
    const supabase = getUserClient();

    let userId: string | null = null;
    let isAdmin = false;

    /**
     * ✅ STEP 1: Get user
     */
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        userId = user.id;

        // 🔥 IMPORTANT: detect admin from metadata
        if ((user as any)?.user_metadata?.role === "admin") {
          isAdmin = true;
        }

        console.log("✅ User:", userId, "Admin:", isAdmin);
      }
    } catch (err) {
      console.log("⚠️ Auth failed, fallback header");
    }

    /**
     * ✅ STEP 2: fallback
     */
    if (!userId) {
      userId = req.headers.get("x-user-id");
      console.log("🔁 Fallback userId:", userId);
    }

    if (!userId && !isAdmin) {
      return NextResponse.json({ success: true, orders: [] });
    }

    /**
     * ✅ STEP 3: Build query
     */
    let query = admin
      .from("orders")
      .select(`
        id,
        user_id,
        customer_name,
        email,
        phone,
        address,
        notes,
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

    // 👇 Only filter if NOT admin
    if (!isAdmin) {
      query = query.eq("user_id", userId);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Fetch orders error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    /**
     * ✅ STEP 4: Format for analytics
     */
    const formattedOrders = (orders || []).map((order: any) => {
      const items = (order.order_items || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        itemTotal: item.price * item.quantity, // 🔥 added
      }));

      const totalQuantity = items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );

      const date = new Date(order.created_at);

      return {
        id: order.id,
        userId: order.user_id,
        customerName: order.customer_name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        notes: order.notes,

        // 🔥 Analytics fields
        totalAmount: order.total,
        status: order.status,
        createdAt: order.created_at,

        // 🔥 Precomputed helpers
        itemCount: items.length,
        totalQuantity,

        // 🔥 Date breakdown (for charts)
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),

        items,
      };
    });

    /**
     * ✅ STEP 5: Summary (VERY IMPORTANT)
     */
    const totalRevenue = formattedOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );

    const totalOrders = formattedOrders.length;

    const statusCounts = formattedOrders.reduce((acc: any, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      orders: formattedOrders,

      // 🔥 Dashboard summary
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue:
          totalOrders > 0 ? totalRevenue / totalOrders : 0,
        statusCounts,
      },
    });
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
/**
 * =========================
 * ✅ POST CREATE ORDER (DEBUG)
 * =========================
 */
export async function POST(req: Request) {
  try {
    console.log("===== POST /api/orders called =====");

    const body = await req.json();
    console.log("Incoming body:", JSON.stringify(body, null, 2));

    const {
      userId,
      customerName,
      email,
      phone,
      address,
      items,
      total,
      notes,
    } = body;

    if (!userId || !customerName || !email || !phone || !address) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "All fields except notes are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.log("❌ Empty cart");
      return NextResponse.json(
        { error: "Cart cannot be empty" },
        { status: 400 }
      );
    }

    if (typeof total !== "number" || total <= 0) {
      console.log("❌ Invalid total:", total);
      return NextResponse.json(
        { error: "Invalid order total" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    const normalizedItems = items.map((item: any) => ({
      product_id: item.product?.id,
      name: item.product?.name,
      price: item.product?.price,
      quantity: item.quantity,
    }));

    console.log("Normalized items:", normalizedItems);

    /**
     * ✅ STEP 1: Create order
     */
    const { data: orderData, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: customerName,
        email,
        phone,
        address,
        notes: notes || "",
        total,
        status: "pending",
      })
      .select()
      .single();

    console.log("Order insert result:", orderData);
    console.log("Order insert error:", orderError);

    if (orderError || !orderData) {
      console.error("❌ Order creation failed");
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const orderId = orderData.id;

    /**
     * ✅ STEP 2: Insert items
     */
    const orderItems = normalizedItems.map((item: any) => ({
      order_id: orderId,
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await admin
      .from("order_items")
      .insert(orderItems);

    console.log("Order items insert error:", itemsError);

    if (itemsError) {
      console.error("❌ Order items failed — rolling back");

      await admin.from("orders").delete().eq("id", orderId);

      return NextResponse.json(
        { error: "Failed to save order items" },
        { status: 500 }
      );
    }

    /**
     * ✅ STEP 3: Trigger email
     */
    try {
      console.log("📧 Calling /api/send-order...");

      const emailRes = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/send-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            customerName,
            email,
            phone,
            address,
            items: normalizedItems,
            total,
          }),
        }
      );

      const emailData = await emailRes.json();

      console.log("📧 Email response:", emailData);
    } catch (err) {
      console.error("❌ Email call failed:", err);
    }

    console.log("✅ Order created successfully:", orderId);

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        orderId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ POST order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}