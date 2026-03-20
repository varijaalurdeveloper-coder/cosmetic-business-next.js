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

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/products", label: "Products" },
    { href: "/contact", label: "Contact" },
    { href: "/blogs", label: "Blog" },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center space-x-2">
            <img
              src="/assets/RimaCosmeticsLogo.svg"
              alt="Rima Cosmetics Logo"
              className="h-10 w-10 shrink-0"
            />
            <div className="min-w-0 flex flex-col">
              <span className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                Rima Cosmetics
              </span>
              <span className="truncate text-[10px] text-green-600 sm:text-xs">
                100% Organic
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  isActive(link.href)
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={
                  isActive("/admin")
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                }
              >
                Admin
              </Link>
            )}

            {user?.role === "customer" && (
              <Link
                href="/orders"
                className={
                  isActive("/orders")
                    ? "text-green-600"
                    : "text-gray-700 hover:text-green-600"
                }
              >
                My Orders
              </Link>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/cart" className="relative shrink-0">
              <ShoppingCart className="h-6 w-6 text-gray-700 transition-colors hover:text-green-600" />
              {totalItems > 0 && (
                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 p-0 text-[10px]">
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
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[85vw] max-w-[320px] bg-white p-0"
              >
                <SheetHeader className="border-b px-6 py-5 text-left">
                  <SheetTitle className="text-xl font-semibold text-gray-900">
                    Menu
                  </SheetTitle>
                  <SheetDescription className="text-sm text-gray-500">
                    Navigate through the site
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col px-4 py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={handleLinkClick}
                      className={`rounded-lg px-4 py-3 text-base transition-colors ${
                        isActive(link.href)
                          ? "bg-green-50 font-medium text-green-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={handleLinkClick}
                      className={`rounded-lg px-4 py-3 text-base transition-colors ${
                        isActive("/admin")
                          ? "bg-green-50 font-medium text-green-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Admin
                    </Link>
                  )}

                  {user?.role === "customer" && (
                    <Link
                      href="/orders"
                      onClick={handleLinkClick}
                      className={`rounded-lg px-4 py-3 text-base transition-colors ${
                        isActive("/orders")
                          ? "bg-green-50 font-medium text-green-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      My Orders
                    </Link>
                  )}

                  <div className="mt-4 border-t pt-4">
                    {user ? (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="w-full justify-start px-4"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    ) : (
                      <Link href="/login" onClick={handleLinkClick}>
                        <Button variant="ghost" className="w-full justify-start px-4">
                          <User className="mr-2 h-4 w-4" />
                          Login
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}