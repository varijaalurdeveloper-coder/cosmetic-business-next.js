import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

import Providers from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import AIChatbot from "@/components/AIChatbot";

export const metadata: Metadata = {
  title: "Rima Cosmetics | Everyday beauty, elevated",
  description: "Discover thoughtfully chosen skincare, haircare, and self-care essentials from Rima Cosmetics.",
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
