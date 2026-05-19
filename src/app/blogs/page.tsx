import type { Metadata } from "next";

import BlogListClient from "./BlogListClient";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog | Rima Cosmetics",
  description:
    "Explore the Rima Cosmetics blog for organic skincare, beauty tips, natural remedies, and expert cosmetic advice.",
  openGraph: {
    title: "Rima Cosmetics Blog",
    description:
      "Explore the Rima Cosmetics blog for organic skincare, beauty tips, natural remedies, and expert cosmetic advice.",
    url: new URL("/blogs", SITE_URL),
    siteName: "Rima Cosmetics",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: "Rima Cosmetics Blog",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rima Cosmetics Blog",
    description:
      "Explore the Rima Cosmetics blog for organic skincare, beauty tips, natural remedies, and expert cosmetic advice.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: new URL("/blogs", SITE_URL),
  },
};

export default function BlogPage() {
  return <BlogListClient />;
}
