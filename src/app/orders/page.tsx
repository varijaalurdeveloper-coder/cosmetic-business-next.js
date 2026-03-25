"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ChevronRight } from "lucide-react";

type Order = {
  id: string;
  createdAt: string;
  totals: {
    total: number;
  };
  status: string;
  items: any[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch real orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token"); // adjust if different

        const res = await fetch("/api/orders", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
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
  }, []);

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

  // ✅ Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your orders...</p>
      </div>
    );
  }

  // ✅ Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="mb-2">No Orders Yet</h1>
          <p className="text-gray-600 mb-8">
            You haven't placed any orders yet. Start shopping!
          </p>
          <Link href="/products">
            <Button className="bg-green-600 hover:bg-green-700">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Orders list
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8">Your Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">{order.id}</h3>

                        {/* ✅ Status badge */}
                        <span
                          className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">
                        Order date:{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>

                      <p className="text-sm text-gray-600">
                        {order.items?.length || 0} item
                        {order.items?.length > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ₹{order.totals?.total?.toFixed(2)}
                      </p>
                      <ChevronRight className="h-5 w-5 text-gray-400 mt-2" />
                    </div>
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