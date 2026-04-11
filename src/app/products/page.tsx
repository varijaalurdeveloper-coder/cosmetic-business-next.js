"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/providers/CartProvider";
import { ShoppingCart } from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { toast } from "sonner";
import { Product } from "@/types";

export default function ProductsPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // ✅ FETCH PRODUCTS (API)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("📡 Fetching public products...");

        const res = await fetch("/api/products");
        const data = await res.json();

        console.log("✅ Products:", data);

        setProducts(data.products || []);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ CATEGORY LOGIC (same as before)
  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h1 className="mb-4">Our Products</h1>
          <p className="text-gray-600 mb-8">
            Explore our complete range of organic cosmetic products
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-green-600 hover:bg-green-700" : ""}
            >
              All Products
            </Button>

            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {category
                  ?.split("-")
                  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <Card key={product.id} className="h-full hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                    width={400}
                    height={400}
                  />
                </div>

                <h3 className="mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {product.description}
                </p>

                {product.volume && (
                  <p className="text-xs text-gray-500 mb-2">
                    {product.volume}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-semibold">
                    ₹{product.price}
                  </span>

                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No products found in this category
            </p>
            <Button
              onClick={() => setSelectedCategory(null)}
              className="bg-green-600 hover:bg-green-700"
            >
              View All Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
