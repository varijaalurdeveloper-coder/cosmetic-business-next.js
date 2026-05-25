import type { Metadata } from "next";

import OrderSuccessPageClient from "./OrderSuccessPageClient";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Order Success | Rima Cosmetics",
  description: "Thank you for your order. Your organic cosmetics purchase has been received successfully.",
  keywords: [...DEFAULT_KEYWORDS, "order success", "thank you", "purchase complete"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Order Success | Rima Cosmetics",
    description: "Thank you for your order. Your organic cosmetics purchase has been received successfully.",
    url: new URL("/order-success", SITE_URL),
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
    title: "Order Success | Rima Cosmetics",
    description: "Thank you for your order. Your organic cosmetics purchase has been received successfully.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: new URL("/order-success", SITE_URL),
  },
};

export default function OrderSuccessPage() {
  return <OrderSuccessPageClient />;
}
