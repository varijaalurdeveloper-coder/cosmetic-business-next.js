import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

import Providers from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import AIChatbot from "@/components/AIChatbot";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Rima Cosmetics",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: new URL("/", SITE_URL),
    siteName: "Rima Cosmetics",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: "Rima Cosmetics organic handmade cosmetics",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: new URL("/", SITE_URL),
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            
            {/* Navbar */}
            <Navbar />

            {/* Page Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <Footer />

            {/* ✅ Floating Action Buttons (Single Source of Truth) */}
            <div className="fixed left-6 bottom-20 sm:bottom-6 z-50">
              <AIChatbot />
            </div>
            <div className="fixed right-6 bottom-20 sm:bottom-6 z-50">
              <WhatsAppButton />
            </div>

          </div>
        </Providers>
      </body>
    </html>
  );
}