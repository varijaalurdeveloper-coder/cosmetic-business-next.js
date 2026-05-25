import type { Metadata } from "next";

import OrdersPageClient from "./OrdersPageClient";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Your Orders | Rima Cosmetics",
  description: "Review your previous orders and track the status of your organic cosmetics purchases.",
  keywords: [...DEFAULT_KEYWORDS, "orders", "order history", "order status"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Your Orders | Rima Cosmetics",
    description: "Review your previous orders and track the status of your organic cosmetics purchases.",
    url: new URL("/orders", SITE_URL),
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
    title: "Your Orders | Rima Cosmetics",
    description: "Review your previous orders and track the status of your organic cosmetics purchases.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: new URL("/orders", SITE_URL),
  },
};

export default function OrdersPage() {
  return <OrdersPageClient />;
}
