import type { Metadata } from "next";

import ProductListClient from "./ProductListClient";
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Products | Rima Cosmetics",
  description: "Browse Rima Cosmetics products for organic skincare, haircare, body care, and beauty essentials.",
  keywords: ["organic cosmetics", "organic skincare", "natural beauty products", "handmade cosmetics"],
  openGraph: {
    title: "Rima Cosmetics Products",
    description: "Browse Rima Cosmetics products for organic skincare, haircare, body care, and beauty essentials.",
    url: new URL("/products", SITE_URL),
    siteName: "Rima Cosmetics",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: DEFAULT_TITLE,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rima Cosmetics Products",
    description: "Browse Rima Cosmetics products for organic skincare, haircare, body care, and beauty essentials.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: new URL("/products", SITE_URL),
  },
};

export default function ProductsPage() {
  return <ProductListClient />;
}
