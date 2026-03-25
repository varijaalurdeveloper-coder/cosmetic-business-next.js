"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ChevronRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider"; // ✅ FIXED

type Order = {
  id: string;
  createdAt: string;
  totals: { total: number };
  status: string;
  items: any[];
};

export default function OrdersPage() {
  const { accessToken } = useAuth(); // ✅ FIXED
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${accessToken}`, // ✅ FIXED
          },
        });

        const data = await res.json();

        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [accessToken]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "text-green-600 bg-green-50";
      case "shipped":
        return "text-blue-600 bg-blue-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading your orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1>No Orders Yet</h1>
          <Link href="/products">
            <Button className="mt-4">Shop Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="mb-8">Your Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="cursor-pointer hover:shadow-lg">
                <CardContent className="p-6 flex justify-between">
                  <div>
                    <div className="flex gap-3 items-center">
                      <h3>{order.id}</h3>
                      <span className={`px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p>{order.items.length} items</p>
                  </div>

                  <div className="text-right">
                    <p>₹{order.totals.total.toFixed(2)}</p>
                    <ChevronRight className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}