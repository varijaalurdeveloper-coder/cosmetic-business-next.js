import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/supabase/verify-user";
import * as kv from "@/lib/kv-store";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    const user = await verifyUser(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orderId = params.id;
    const order = await kv.get(`order:${orderId}`);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify that the order belongs to the authenticated user
    if (order.userId !== user.id && order.userId !== `guest_${user.id}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve order" },
      { status: 500 }
    );
  }
}
