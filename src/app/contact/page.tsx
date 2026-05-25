import type { Metadata } from "next";

import ContactPageClient from "./ContactPageClient";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact | Rima Cosmetics",
  description: "Contact Rima Cosmetics for questions about organic skincare, product orders, and customer support.",
  keywords: [...DEFAULT_KEYWORDS, "contact", "customer support", "organic cosmetics support"],
  openGraph: {
    title: "Contact Rima Cosmetics",
    description: "Contact Rima Cosmetics for questions about organic skincare, product orders, and customer support.",
    url: new URL("/contact", SITE_URL),
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
    title: "Contact Rima Cosmetics",
    description: "Contact Rima Cosmetics for questions about organic skincare, product orders, and customer support.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: new URL("/contact", SITE_URL),
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
