import { Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="mb-4">About Rima Cosmetics</h3>
            <p className="text-gray-400">
              100% organic handmade cosmetic products crafted with love and care for your natural beauty.
            </p>
          </div>

          <div>
            <h3 className="mb-4">Contact Us</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>8939996640</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>rimacosmetics@gmail.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1" />
                <span>
                  A block G-3, Tejas Lakeview apartment,<br />
                  Manthopo Salai, Siruseri,<br />
                  Chennai, Tamil Nadu
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Rima Cosmetics. All rights reserved.</p>
          <p className="mt-2">Owner: Mounica MK</p>
        </div>
      </div>
    </footer>
  );
}
