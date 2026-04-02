"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/components/OrderStatus";
import { Package, ChevronRight, ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Pass user ID to API
        const response = await fetch("/api/orders", {
          method: "GET",
          headers: {
            "x-user-id": user.id,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load orders");
        }

        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load orders";
        console.error("Error fetching orders:", err);
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h1>
          <p className="text-gray-600 mb-6">You need to log in to view your orders</p>
          <Link href="/login">
            <Button className="gap-2">
              Go to Login <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h1>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
          <Link href="/products">
            <Button className="gap-2">
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <p className="text-gray-600 mt-2">
            {orders.length} order{orders.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}</CardTitle>
                      <Badge className={`capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Ordered on {new Date(order.createdAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{parseFloat(order.total as any).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Order Status Timeline */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Status</h3>
                  <OrderStatus status={order.status} />
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            ₹{parseFloat(item.price as any)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          ₹{(parseFloat(item.price as any) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Shipping Address</h3>
                  <p className="text-sm text-gray-700">{order.customerName}</p>
                  <p className="text-sm text-gray-600">{order.address}</p>
                  <p className="text-sm text-gray-600">{order.phone}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}