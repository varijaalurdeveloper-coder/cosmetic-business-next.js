import type { Metadata } from "next";

import CartPageClient from "./CartPageClient";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cart | Rima Cosmetics",
  description: "Review your selected organic cosmetics products before checkout.",
  keywords: [...DEFAULT_KEYWORDS, "shopping cart", "cart", "organic cosmetics cart"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Shopping Cart | Rima Cosmetics",
    description: "Review your selected organic cosmetics products before checkout.",
    url: new URL("/cart", SITE_URL),
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
    title: "Shopping Cart | Rima Cosmetics",
    description: "Review your selected organic cosmetics products before checkout.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: new URL("/cart", SITE_URL),
  },
};

export default function CartPage() {
  return <CartPageClient />;
}
