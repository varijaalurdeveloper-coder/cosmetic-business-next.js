"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ChevronRight } from "lucide-react";

// Mock orders - replace with actual data fetching
const mockOrders = [
  {
    id: "ORD-001",
    date: "2026-03-10",
    total: 2850,
    status: "Delivered",
    items: 3,
  },
  {
    id: "ORD-002",
    date: "2026-03-08",
    total: 1750,
    status: "In Transit",
    items: 2,
  },
];

export default function OrdersPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "text-green-600 bg-green-50";
      case "In Transit":
        return "text-blue-600 bg-blue-50";
      case "Processing":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (mockOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="mb-2">No Orders Yet</h1>
          <p className="text-gray-600 mb-8">
            You haven&apos;t placed any orders yet. Start shopping!
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

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8">Your Orders</h1>

        <div className="space-y-4">
          {mockOrders.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">{order.id}</h3>
                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Order date: {order.date}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.items} item{order.items > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-lg">₹{order.total.toFixed(2)}</p>
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
