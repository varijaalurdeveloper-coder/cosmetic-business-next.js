"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, LogOut, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../providers/AuthProvider";
import { useCart } from "../providers/CartProvider";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useState } from "react";
import Logo from "./Logo";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/assets/RimaCosmeticsLogo.svg" 
              alt="Rima Cosmetics Logo" 
              className="w-10 h-10"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                Rima Cosmetics
              </span>
              <span className="text-xs text-green-600">100% Organic</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {[
              { href: "/", label: "Home" },
              { href: "/about", label: "About Us" },
              { href: "/products", label: "Products" },
              { href: "/contact", label: "Contact" },
              { href: "/blogs", label: "Blog" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${
                  isActive(link.href) ||
                  pathname.startsWith(`${link.href}/`)
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                } transition-colors`}
              >
                {link.label}
              </Link>
            ))}

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`${
                  isActive("/admin")
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                Admin
              </Link>
            )}

            {user?.role === "customer" && (
              <Link
                href="/orders"
                className={`${
                  isActive("/orders")
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                My Orders
              </Link>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-green-600 transition-colors" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-green-600">
                  {totalItems}
                </Badge>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-gray-700">{user.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Navigate through the site
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col space-y-4 mt-8">
                  {[
                    { href: "/", label: "Home" },
                    { href: "/about", label: "About Us" },
                    { href: "/products", label: "Products" },
                    { href: "/contact", label: "Contact" },
                    { href: "/blogs", label: "Blog" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      className={`py-3 px-4 rounded-lg ${
                        isActive(link.href)
                          ? "bg-green-50 text-green-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
