"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1>Your Cart is Empty</h1>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
    } = formData;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !zipCode
    ) {
      toast.error("All fields except notes are required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        credentials: "include", // ✅ IMPORTANT
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          customerName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}`,
          notes: formData.notes || "",
          items: cart,
          total,
        }),
      });

      const data = await response.json();

      console.log("Order API response:", data); // ✅ debug

      if (response.ok) {
        toast.success("Order placed successfully!");
        clearCart();
        router.push("/order-success");
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/cart" className="flex items-center gap-2 mb-6">
          <ChevronLeft /> Back to Cart
        </Link>

        <h1 className="mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input name="firstName" placeholder="First Name" onChange={handleChange} required />
                    <Input name="lastName" placeholder="Last Name" onChange={handleChange} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                    <Input name="phone" placeholder="Phone" onChange={handleChange} required />
                  </div>

                  <Input name="address" placeholder="Address" onChange={handleChange} required />

                  <div className="grid grid-cols-3 gap-4">
                    <Input name="city" placeholder="City" onChange={handleChange} required />
                    <Input name="state" placeholder="State" onChange={handleChange} required />
                    <Input name="zipCode" placeholder="ZIP Code" onChange={handleChange} required />
                  </div>

                  <Textarea name="notes" placeholder="Notes (Optional)" onChange={handleChange} />

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>₹{item.product.price * item.quantity}</span>
                  </div>
                ))}
                <hr className="my-3" />
                <p className="font-bold">Total: ₹{total}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}