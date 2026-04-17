import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/admin-auth";

const admin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    console.log("===== GET /api/admin/analytics =====");

    /**
     * 🔐 ADMIN AUTH
     */
    const adminCheck = await verifyAdminSession();

    if (!adminCheck.isAdmin) {
      return (
        adminCheck.response ||
        NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      );
    }

    /**
     * =========================
     * 📅 DATE RANGE HANDLING
     * =========================
     */
    const { searchParams } = new URL(req.url);

    const range = searchParams.get("range") || "7d";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let startDate: Date;
    let endDate = new Date();

    if (range === "30d") {
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
    } else if (range === "custom" && startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      // default 7d
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
    }

    /**
     * =========================
     * 🚀 PARALLEL QUERIES
     * =========================
     */
    const [ordersRes, statusRes, itemsRes] = await Promise.all([
      /**
       * 📦 ORDERS (for revenue + daily sales)
       */
      admin
        .from("orders")
        .select("total, status, created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString()),

      /**
       * 📊 STATUS COUNTS (lightweight)
       */
      admin
        .from("orders")
        .select("status")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString()),

      /**
       * 🏆 TOP PRODUCTS (only needed fields)
       */
      admin
         .from("order_items")
         .select("product_id, name, price, quantity"),
    ]);

    if (ordersRes.error || statusRes.error || itemsRes.error) {
      console.error(
        ordersRes.error || statusRes.error || itemsRes.error
      );
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }

    const orders = ordersRes.data || [];
    const statusRows = statusRes.data || [];
    const items = itemsRes.data || [];

    /**
     * =========================
     * 💰 KPIs
     * =========================
     */
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.total || 0),
      0
    );

    const totalOrders = orders.length;

    const avgOrderValue =
      totalOrders > 0 ? totalRevenue / totalOrders : 0;

    /**
     * =========================
     * 📦 ORDERS BY STATUS
     * =========================
     */
    const ordersByStatus: Record<string, number> = {};

    statusRows.forEach((o: any) => {
      const status = o.status || "unknown";
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
    });

    /**
     * =========================
     * 📈 DAILY SALES
     * =========================
     */
    const dailyMap: Record<string, number> = {};

    orders.forEach((o: any) => {
      const date = new Date(o.created_at)
        .toISOString()
        .split("T")[0];

      dailyMap[date] = (dailyMap[date] || 0) + (o.total || 0);
    });

    const dailySales = Object.entries(dailyMap)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    /**
     * =========================
     * 🏆 TOP PRODUCTS
     * =========================
     */
    const productMap: Record<string, any> = {};

    items.forEach((item: any) => {
      if (!item.product_id) return;

      if (!productMap[item.product_id]) {
        productMap[item.product_id] = {
          productId: item.product_id,
          name: item.name,
          totalSold: 0,
          revenue: 0,
        };
      }

      productMap[item.product_id].totalSold +=
        item.quantity || 0;

      productMap[item.product_id].revenue +=
        (item.price || 0) * (item.quantity || 0);
    });

    const topProducts = Object.values(productMap)
      .sort((a: any, b: any) => b.totalSold - a.totalSold)
      .slice(0, 5);

    /**
     * =========================
     * ✅ RESPONSE
     * =========================
     */
    return NextResponse.json({
      success: true,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      ordersByStatus,
      dailySales,
      topProducts,
    });
  } catch (error) {
    console.error("❌ Analytics error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}