"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  ordersByStatus: Record<string, number>;
  dailySales: { date: string; revenue: number }[];
  topProducts: {
    productId: string;
    name: string;
    totalSold: number;
    revenue: number;
  }[];
}

type RangeType = "7d" | "30d" | "custom";

export function AdminAnalytics() {
  const { isAdmin } = useAuth();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [range, setRange] = useState<RangeType>("7d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        let url = `/api/admin/analytics?range=${range}`;

        if (range === "custom" && startDate && endDate) {
          url += `&startDate=${startDate}&endDate=${endDate}`;
        }

        const res = await fetch(url);
        const result = await res.json();

        if (!res.ok) {
          toast.error(result.error || "Failed to load analytics");
          return;
        }

        setData(result);
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (range !== "custom" || (startDate && endDate)) {
      fetchAnalytics();
    }
  }, [isAdmin, range, startDate, endDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "#16a34a",
    },
  };

  const statusChartConfig = {
    pending: { label: "Pending", color: "#facc15" },
    confirmed: { label: "Confirmed", color: "#3b82f6" },
    shipped: { label: "Shipped", color: "#a855f7" },
    delivered: { label: "Delivered", color: "#22c55e" },
  };

  const chartData =
    data?.dailySales?.map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      revenue: d.revenue,
    })) || [];

  const statusData =
    data
      ? Object.entries(data.ordersByStatus).map(
          ([status, count]) => ({
            name: status,
            value: count,
            fill: `var(--color-${status})`,
          })
        )
      : [];

  /**
   * 🔥 SKELETON LOADER
   */
  if (loading) {
    return (
      <div className="space-y-6">
        {/* FILTER */}
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </CardContent>
        </Card>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CHART */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>

        {/* STATUS */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-[250px] w-full" />

            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-10" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* TOP PRODUCTS */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Analytics</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-red-600">
          Admin access required
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Analytics</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-gray-500">
          No analytics data available
        </CardContent>
      </Card>
    );
  }
  console.log("chartData:", chartData);
 return (
  <div className="space-y-6">
    {/* FILTER */}
    <Card>
      <CardHeader>
        <CardTitle>Date Range</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-4 items-center">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as RangeType)}
          className="border rounded px-3 py-2"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="custom">Custom</option>
        </select>

        {range === "custom" && (
          <>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </>
        )}
      </CardContent>
    </Card>

    {/* KPI */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          ₹{data.totalRevenue}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Orders</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {data.totalOrders}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avg Order Value</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          ₹{Math.round(data.avgOrderValue)}
        </CardContent>
      </Card>
    </div>

    {/* 📈 REVENUE CHART */}
    <Card>
      <CardHeader>
        <CardTitle>Revenue (Last {range === "30d" ? "30" : "7"} Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <ChartTooltip content={<ChartTooltipContent />} />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>

    {/* 📊 ORDER STATUS + TOP PRODUCTS */}
    <div className="grid md:grid-cols-2 gap-6">
      
      {/* STATUS PIE */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={statusChartConfig}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>

          <div className="mt-4 space-y-2">
            {statusData.map((s, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="capitalize">{s.name}</span>
                <span>{s.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 🏆 TOP PRODUCTS */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No data</p>
          ) : (
            data.topProducts.map((p) => (
              <div
                key={p.productId}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">
                    {p.totalSold} sold
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-medium">₹{p.revenue}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);
}