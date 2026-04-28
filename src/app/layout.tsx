import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

import Providers from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import AIChatbot from "@/components/AIChatbot";

export const metadata: Metadata = {
  title: "Rima Cosmetics",
  description: "100% organic handmade cosmetic products crafted with love.",
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
            <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
              <WhatsAppButton />
              <AIChatbot />
            </div>

          </div>
        </Providers>
      </body>
    </html>
  );
}