"use client";

import Link from "next/link";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import { products } from "../lib/data/products";
import { useCart } from "../providers/CartProvider";
import { ShoppingCart, Leaf, Heart, Sparkles, Shield } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";

export default function HomePage() {
  const { addToCart } = useCart();

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1722934797829-5c60280d05af?crop=entropy&cs=tinysrgb&fit=max&fm=webp&q=85&w=1920"
            alt="Organic Cosmetics"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-white drop-shadow-lg">
              100% Organic Handmade Cosmetics
            </h1>
            <p className="mb-8 text-white drop-shadow-md text-lg">
              Discover the power of nature with our carefully crafted organic
              beauty products.
            </p>

            <div className="flex space-x-4">
              <Link href="/products">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Shop Now
                </Button>
              </Link>

              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">Our Products</h2>
            <p className="text-gray-600">
              Explore our range of organic cosmetic products
            </p>
          </div>

          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="md:basis-1/2 lg:basis-1/4"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>

                      <h3 className="mb-2">{product.name}</h3>

                      <div className="flex items-center justify-between">
                        <span className="text-green-600">
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
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="text-center mt-8">
            <Link href="/products">
              <Button size="lg" variant="outline">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

