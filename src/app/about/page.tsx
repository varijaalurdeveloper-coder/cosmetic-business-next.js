import type { Metadata } from "next";

import AboutPageClient from "./AboutPageClient";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "About | Rima Cosmetics",
  description: "Learn more about Rima Cosmetics, our story, values, and handmade organic beauty products.",
  keywords: [...DEFAULT_KEYWORDS, "about us", "organic beauty brand"],
  openGraph: {
    title: "About Rima Cosmetics",
    description: "Learn more about Rima Cosmetics, our story, values, and handmade organic beauty products.",
    url: new URL("/about", SITE_URL),
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
    title: "About Rima Cosmetics",
    description: "Learn more about Rima Cosmetics, our story, values, and handmade organic beauty products.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: new URL("/about", SITE_URL),
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}

