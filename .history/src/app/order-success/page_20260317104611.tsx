"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle, Package } from "lucide-react";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pt-12">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl">Order Placed Successfully!</h1>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            Thank you for your order. We're excited to fulfill it!
          </p>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Order Number</p>
            <p className="font-mono font-semibold text-lg text-green-700">ORD-{Date.now()}</p>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <p className="flex items-center gap-2 justify-center">
              <Package className="h-4 w-4 text-green-600" />
              We'll send you a confirmation email shortly
            </p>
            <p>You can track your order in your account dashboard</p>
          </div>

          <div className="space-y-3 pt-4">
            <Link href="/orders" className="block">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                View Orders
              </Button>
            </Link>

            <Link href="/products" className="block">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>

            <Link href="/" className="block">
              <Button variant="ghost" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
