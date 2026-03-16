"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order } from "@/types";
import { Package, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { projectId } from "@/utils/supabase/info";

export default function AdminPage() {
  const { user, isAdmin, accessToken } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      router.push("/");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-35cd97c6/admin/orders`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = await response.json();

        if (data.error) {
          toast.error("Failed to load orders");
        } else if (data.orders) {
          setOrders(data.orders);
        }
      } catch (error) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAdmin, accessToken, router]);

  const updateOrderStatus = async (
    orderId: string,
    status: Order["status"]
  ) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-35cd97c6/admin/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (data.error) {
        toast.error("Failed to update order status");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date() }
            : order
        )
      );

      toast.success("Order status updated successfully");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const ordersReceived = orders.length;
  const ordersPending = orders.filter(
    (o) =>
      o.status === "pending" ||
      o.status === "confirmed" ||
      o.status === "shipped"
  ).length;
  const ordersCompleted = orders.filter(
    (o) => o.status === "delivered"
  ).length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Business Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, {user?.name}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Orders Received" value={ordersReceived} icon={<Package className="h-8 w-8 text-green-600" />} />
          <StatCard title="Orders Pending" value={ordersPending} icon={<Clock className="h-8 w-8 text-yellow-600" />} />
          <StatCard title="Orders Completed" value={ordersCompleted} icon={<CheckCircle className="h-8 w-8 text-green-600" />} />
          <StatCard title="Total Revenue" value={`₹${totalRevenue}`} icon={<TrendingUp className="h-8 w-8 text-blue-600" />} />
        </div>

        {/* Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>

                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            updateOrderStatus(
                              order.id,
                              value as Order["status"]
                            )
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        {order.items.map((item) => (
                          <p key={item.product.id}>
                            {item.product.name} x {item.quantity} — ₹
                            {item.product.price * item.quantity}
                          </p>
                        ))}
                        <p className="mt-2 font-semibold">
                          Total: ₹{order.total}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">
                          {order.shippingAddress.fullName}
                        </p>
                        <p>{order.shippingAddress.phone}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state}{" "}
                          {order.shippingAddress.pincode}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <p className="text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        {icon}
      </CardContent>
    </Card>
  );
}

