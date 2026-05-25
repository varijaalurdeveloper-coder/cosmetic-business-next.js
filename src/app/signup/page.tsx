import type { Metadata } from "next";

import SignupPageClient from "./SignupPageClient";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Sign Up | Rima Cosmetics",
  description: "Create an account with Rima Cosmetics and start shopping organic handmade cosmetics.",
  keywords: [...DEFAULT_KEYWORDS, "signup", "create account", "organic cosmetics account"],
  openGraph: {
    title: "Sign Up | Rima Cosmetics",
    description: "Create an account with Rima Cosmetics and start shopping organic handmade cosmetics.",
    url: new URL("/signup", SITE_URL),
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
    title: "Sign Up | Rima Cosmetics",
    description: "Create an account with Rima Cosmetics and start shopping organic handmade cosmetics.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: new URL("/signup", SITE_URL),
  },
};

export default function SignupPage() {
  return <SignupPageClient />;
}
