"use client";

import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Heart, Award, Users } from "lucide-react";

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
              Our commitment to handcrafted organic cosmetics means every formula
              is designed to nurture skin with natural, gentle ingredients.
            </p>
            <p className="text-gray-700 mb-4">
              From our small workshop in Chennai, we create products in small
              batches to ensure freshness, quality, and effective skincare.
            </p>
            <p className="text-gray-700">
              We believe in transparency, sustainability, and beauty that comes
              from nature — not harsh chemicals.
            </p>
          </div>

          <div className="relative h-96">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1651740896477-467ea46b4fe5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800"
              alt="Natural skincare products on display"
              className="w-full h-full object-cover rounded-lg shadow-lg"
              width={800}
              height={600}
            />
          </div>
        </div>
      </section>

      {/* Meet the Founder */}
      <section className="py-16 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4">Meet the Founder</h2>
          <p className="mx-auto max-w-2xl text-gray-700">
            Mounica MK started Rima Cosmetics to bring the goodness of natural,
            organic ingredients into everyday beauty routines. Her passion is to
            create safe, effective products that support healthy skin.
          </p>
        </div>

        <div className="mt-12 flex justify-center px-4">
          <div className="max-w-xl rounded-[32px] bg-white px-8 py-12 shadow-lg text-center">
            <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-600 text-4xl font-semibold text-white">
              M
            </div>
            <h3 className="text-2xl font-semibold">Mounica MK</h3>
            <p className="mt-2 text-green-700">Founder & Chief Formulator</p>
            <p className="mt-6 text-gray-600">
              With a deep love for natural skincare and a dedication to purity,
              Mounica ensures every recipe is crafted with the highest standards
              of care, ethics, and effectiveness.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Rima Cosmetics? */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h2 className="mb-4">Why Choose Rima Cosmetics?</h2>
          <p className="mx-auto max-w-2xl text-gray-700">
            Our promise is simple: organic, handmade skincare that is gentle on
            skin, effective in results, and made with responsible ingredients.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-3">
          <article className="rounded-[32px] bg-gray-50 p-8 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold">No Harmful Chemicals</h3>
            <p className="text-gray-600">
              Our products are free from sulfates, parabens, and synthetic
              additives, making them safe for all skin types.
            </p>
          </article>

          <article className="rounded-[32px] bg-gray-50 p-8 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold">Suitable for All Skin Types</h3>
            <p className="text-gray-600">
              We create gentle formulas that work well for dry, oily, sensitive,
              and combination skin.
            </p>
          </article>

          <article className="rounded-[32px] bg-gray-50 p-8 shadow-sm">
            <h3 className="mb-3 text-xl font-semibold">Affordable & Ethical</h3>
            <p className="text-gray-600">
              Enjoy premium organic skincare at fair prices while supporting
              sustainable craftsmanship.
            </p>
          </article>
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

