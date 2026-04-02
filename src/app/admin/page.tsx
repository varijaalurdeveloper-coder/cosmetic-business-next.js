"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { Package, CheckCircle, Clock, TrendingUp } from "lucide-react";

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not admin
    if (isAdmin === false) {
      router.push("/login");
    }
  }, [isAdmin, router]);

  // Don't render anything until auth is determined
  if (isAdmin === undefined || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 py-12 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, {user?.name || "Admin"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Products
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6 mt-6">
            <AdminOrders />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6 mt-6">
            <AdminProducts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

