import type { Metadata } from "next";

import { Suspense } from "react";
import LoginContent from "./LoginContent";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Login | Rima Cosmetics",
  description: "Login to your Rima Cosmetics account to manage orders, favorites, and account details.",
  keywords: [...DEFAULT_KEYWORDS, "login", "sign in", "account access"],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Login | Rima Cosmetics",
    description: "Login to your Rima Cosmetics account to manage orders, favorites, and account details.",
    url: new URL("/login", SITE_URL),
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
    title: "Login | Rima Cosmetics",
    description: "Login to your Rima Cosmetics account to manage orders, favorites, and account details.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: new URL("/login", SITE_URL),
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
