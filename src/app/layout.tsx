import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import { AuthProvider } from "@/providers/AuthProvider";
import { CartProvider } from "@/providers/CartProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

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
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
          </div>
        </Providers>
      </body>
    </html>
  );
}
