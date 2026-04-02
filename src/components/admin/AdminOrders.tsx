"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface AdminOrder {
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

export function AdminOrders() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Fetch all orders (admin only)
  useEffect(() => {
    if (!isAdmin) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/orders");
        const data = await response.json();

        if (data.error) {
          toast.error(data.error || "Failed to load orders");
        } else if (data.orders) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAdmin]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string
  ) => {
    if (!["pending", "confirmed", "shipped", "delivered"].includes(newStatus)) {
      toast.error("Invalid status");
      return;
    }

    setUpdating(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update order status");
        return;
      }

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus as AdminOrder["status"] }
            : order
        )
      );

      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-3 text-gray-600">Loading orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-red-600">Admin access required</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manage Orders</CardTitle>
          <Badge variant="outline">{orders.length} orders</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center py-8 text-gray-600">No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm font-semibold">
                      {order.id.substring(0, 8)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {order.customerName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {order.email}
                    </TableCell>
                    <TableCell className="text-sm text-center">
                      <Badge variant="secondary">{order.items.length}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{parseFloat(order.total as any).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          updateOrderStatus(order.id, value)
                        }
                        disabled={updating === order.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
