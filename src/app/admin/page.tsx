"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";

import { Package, TrendingUp } from "lucide-react";

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAdmin !== undefined) {
      setIsLoading(false);

      if (!isAdmin) {
        router.push("/login");
      }
    }
  }, [isAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
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

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
        
        {/* 🔥 FULL ANALYTICS DASHBOARD */}
        <AdminAnalytics />

        {/* =========================
            📦 ORDERS & PRODUCTS TABS
        ========================= */}
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

          <TabsContent value="orders" className="mt-6">
            <AdminOrders />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <AdminProducts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}