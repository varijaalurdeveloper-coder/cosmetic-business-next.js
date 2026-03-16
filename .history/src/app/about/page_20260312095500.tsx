"use client";

import type { Metadata } from "next";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Heart, Award, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - 100% Organic Handmade Cosmetics",
  description:
    "Learn about Rima Cosmetics, a Chennai-based organic cosmetics brand by Mounica MK. We craft 100% organic handmade beauty products with natural ingredients. Chemical-free, vegan, cruelty-free.",
  keywords: [
    "about Rima Cosmetics",
    "Mounica MK",
    "Chennai organic cosmetics",
    "handmade beauty products",
    "organic cosmetics Chennai",
    "natural beauty brand Tamil Nadu",
  ],
  openGraph: {
    title: "About Us - Rima Cosmetics",
    description:
      "100% organic handmade cosmetic products crafted in Chennai.",
    url: "https://rimacosmetics.vercel.app/about",
    siteName: "Rima Cosmetics",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1584013544027-acfe4d8ca478?crop=entropy&cs=tinysrgb&fit=max&fm=webp&q=85&w=1920"
            alt="About Us"
            className="w-full h-full object-cover"
            width={1920}
            height={1200}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div>
            <h1 className="mb-4 text-white drop-shadow-lg">
              About Rima Cosmetics
            </h1>
            <p className="text-white drop-shadow-md text-lg max-w-2xl">
              Your trusted source for 100% organic, handmade cosmetic products
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="mb-6">Our Story</h2>
            <p className="text-gray-700 mb-4">
              Rima Cosmetics was founded with a simple belief: beauty products
              should be as pure as nature intended.
            </p>
            <p className="text-gray-700 mb-4">
              Every product we create is handmade with love and care, using only
              the finest natural ingredients.
            </p>
            <p className="text-gray-700">
              From our small workshop in Chennai, we craft each product in
              small batches to ensure the highest quality and freshness.
            </p>
          </div>

          <div className="relative h-96">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1651740896477-467ea46b4fe5?crop=entropy&cs=tinysrgb&fit=max&fm=webp&q=85&w=800"
              alt="Natural Products"
              className="w-full h-full object-cover rounded-lg shadow-lg"
              width={800}
              height={600}
            />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h2 className="mb-4">Our Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            These principles guide everything we do at Rima Cosmetics
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Heart className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="mb-2">Handmade with Love</h3>
            <p className="text-gray-600">
              Each product is carefully crafted by hand in small batches
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
              <Award className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="mb-2">Quality First</h3>
            <p className="text-gray-600">
              We never compromise on quality
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-100 rounded-full mb-4">
              <Users className="h-8 w-8 text-lime-600" />
            </div>
            <h3 className="mb-2">Customer Care</h3>
            <p className="text-gray-600">
              Your satisfaction and wellness is our top priority
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

