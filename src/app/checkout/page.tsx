"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error("Please login to proceed with checkout");
      router.push("/login");
    }
  }, [user, router]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + tax + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="mb-4">Your Cart is Empty</h1>
          <Link href="/products">
            <Button className="bg-green-600 hover:bg-green-700">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ FIXED SUBMIT FUNCTION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.address ||
      !formData.city
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Get token
      const token = localStorage.getItem("token");

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "", // ✅ CRITICAL FIX
        },
        body: JSON.stringify({
          customer: formData,
          items: cart,
          totals: { subtotal, tax, shipping, total },
        }),
      });

      const data = await response.json();

      if (data.success) {
        clearCart();
        router.push("/order-success"); // better than window.location
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <h1 className="mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-4">Shipping Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name *</Label>
                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <Label>Last Name *</Label>
                        <Input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Address *</Label>
                    <Input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>City *</Label>
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label>ZIP Code</Label>
                      <Input
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Order Notes</Label>
                    <Textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between text-sm"
                  >
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>
                      ₹
                      {(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0
                        ? "FREE"
                        : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
