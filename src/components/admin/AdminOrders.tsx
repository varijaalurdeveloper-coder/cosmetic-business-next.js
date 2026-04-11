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
import { Button } from "@/components/ui/button";
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
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch orders
  useEffect(() => {
    if (!isAdmin) return;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/orders");
        const data = await res.json();

        if (data.error) {
          toast.error(data.error);
        } else {
          setOrders(data.orders || []);
        }
      } catch (err) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAdmin]);

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

  // ✅ UPDATE STATUS
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus as any } : o
        )
      );

      toast.success("Status updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(null);
    }
  };

  // ✅ DELETE ORDER
  const deleteOrder = async (orderId: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this order?"
    );
    if (!confirmDelete) return;

    setDeleting(orderId);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      // remove from UI
      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      toast.success("Order deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Orders</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          Loading orders...
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
        <CardContent className="text-center py-8 text-red-600">
          Admin access required
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Manage Orders</CardTitle>
        <Badge variant="outline">{orders.length} orders</Badge>
      </CardHeader>

      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm">
                      {order.id.slice(0, 8)}
                    </TableCell>

                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="text-gray-600">
                      {order.email}
                    </TableCell>

                    <TableCell>
                      <Badge>{order.items.length}</Badge>
                    </TableCell>

                    <TableCell className="font-semibold">
                      ₹{Number(order.total).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>

                    {/* ✅ ACTION COLUMN FIXED */}
                    <TableCell className="flex items-center gap-2 justify-end">
                      {/* STATUS DROPDOWN FIX */}
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          updateOrderStatus(order.id, value)
                        }
                        disabled={updating === order.id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>

                        {/* FIX: proper width + z-index */}
                        <SelectContent className="z-50 min-w-[140px]">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* ✅ DELETE BUTTON */}
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={
                          deleting === order.id ||
                          order.status !== "delivered"
                        }
                        onClick={() => deleteOrder(order.id)}
                      >
                        Delete
                      </Button>
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