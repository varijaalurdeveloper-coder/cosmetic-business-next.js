import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/supabase/verify-user";
import * as kv from "@/lib/kv-store";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const user = await verifyUser(authHeader);

    const orderData = await req.json();
    const orderId = `ORD-${Date.now()}`;

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 6);

    const order = {
      id: orderId,
      userId: user?.id || `guest_${Date.now()}`,
      customer: orderData.customer,
      items: orderData.items,
      totals: orderData.totals,
      status: "pending",
      createdAt: new Date().toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
    };

    await kv.set(`order:${orderId}`, order);

    // Send order alert email to business owner
    const emailResult = await sendOrderEmail({
      ...order,
      total: order.totals?.total ?? 0,
    });

    return NextResponse.json({ 
      success: true, 
      order,
      emailSent: emailResult.success,
      message: "Order created successfully. You will receive an email confirmation shortly.",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}