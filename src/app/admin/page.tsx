import type { Metadata } from "next";

import AdminPageClient from "./AdminPageClient";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Admin Dashboard | Rima Cosmetics",
  description: "Admin dashboard for managing products, orders, and blogs at Rima Cosmetics.",
  keywords: [...DEFAULT_KEYWORDS, "admin", "dashboard", "manage products"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Admin Dashboard | Rima Cosmetics",
    description: "Admin dashboard for managing products, orders, and blogs at Rima Cosmetics.",
    url: new URL("/admin", SITE_URL),
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
    title: "Admin Dashboard | Rima Cosmetics",
    description: "Admin dashboard for managing products, orders, and blogs at Rima Cosmetics.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: new URL("/admin", SITE_URL),
  },
};

export default function AdminPage() {
  return <AdminPageClient />;
}
