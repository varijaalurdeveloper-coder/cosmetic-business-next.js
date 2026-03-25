import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/supabase/verify-user";
import * as kv from "@/lib/kv-store";
import { sendOrderEmail } from "@/lib/email/sendOrderEmail";

// ✅ CREATE ORDER
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const user = await verifyUser(authHeader);

    const orderData = await req.json();
    const orderId = `ORD-${Date.now()}`;

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 6);

    const userId = user?.id || `guest_${Date.now()}`;

    const order = {
      id: orderId,
      userId,
      customer: orderData.customer,
      items: orderData.items,
      totals: orderData.totals,
      status: "pending", // ✅ default order status
      createdAt: new Date().toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
    };

    // ✅ Save individual order
    await kv.set(`order:${orderId}`, order);

    // ✅ Save order list per user
    const userOrdersKey = `orders:user:${userId}`;
    const existingOrders = (await kv.get(userOrdersKey)) || [];

    existingOrders.push(order);

    await kv.set(userOrdersKey, existingOrders);

    // ✅ Send order email
    const emailResult = await sendOrderEmail({
      ...order,
      total: order.totals?.total ?? 0,
    });

    return NextResponse.json({
      success: true,
      order,
      emailSent: emailResult.success,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// ✅ GET USER ORDERS
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const user = await verifyUser(authHeader);

    const userId = user?.id;

    // If not logged in → return empty
    if (!userId) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    const orders = await kv.get(`orders:user:${userId}`);

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}