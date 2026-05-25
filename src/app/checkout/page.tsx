import type { Metadata } from "next";

import CheckoutPageClient from "./CheckoutPageClient";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Checkout | Rima Cosmetics",
  description: "Complete your order for organic cosmetics and secure checkout.",
  keywords: [...DEFAULT_KEYWORDS, "checkout", "secure checkout", "organic cosmetics order"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Checkout | Rima Cosmetics",
    description: "Complete your order for organic cosmetics and secure checkout.",
    url: new URL("/checkout", SITE_URL),
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
    title: "Checkout | Rima Cosmetics",
    description: "Complete your order for organic cosmetics and secure checkout.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: new URL("/checkout", SITE_URL),
  },
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
