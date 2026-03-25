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
  const { user, accessToken } = useAuth(); // ✅ FIXED
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
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken ? `Bearer ${accessToken}` : "", // ✅ FIXED
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
        router.push("/order-success");
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
                      <Input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                      <Input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    <Input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
                  </div>

                  <Input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />

                  <div className="grid grid-cols-3 gap-4">
                    <Input name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                    <Input name="state" placeholder="State" value={formData.state} onChange={handleChange} />
                    <Input name="zipCode" placeholder="ZIP Code" value={formData.zipCode} onChange={handleChange} />
                  </div>

                  <Textarea name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange} />

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700">
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
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>₹{tax.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
                  <div className="border-t pt-4 flex justify-between font-semibold"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}