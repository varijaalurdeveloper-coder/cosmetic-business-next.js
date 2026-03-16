"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { products } from "@/lib/data/products";
import { useCart } from "@/providers/CartProvider";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { toast } from "sonner";
import { ChevronLeft, ShoppingCart, Leaf } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="mb-4">Product Not Found</h1>
          <Link href="/products">
            <Button className="bg-green-600 hover:bg-green-700">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  // Get related products (same category, but not this product)
  const relatedProducts = products.filter(
    p => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Breadcrumb */}
        <Link href="/products" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-8">
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>

        {/* Product Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="bg-white rounded-lg p-8">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-contain rounded-lg"
              width={400}
              height={400}
            />
          </div>

          {/* Product Info */}
          <div>
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                {product.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-4">{product.name}</h1>

            {/* Price */}
            <p className="text-3xl font-bold text-green-600 mb-6">
              ₹{product.price}
            </p>

            {/* Description */}
            <p className="text-gray-700 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Volume */}
            {product.volume && (
              <div className="mb-8">
                <p className="text-sm text-gray-600 mb-2">Size</p>
                <p className="font-semibold">{product.volume}</p>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-8">
              <span className={`inline-block px-4 py-2 rounded-full font-semibold ${
                product.inStock
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 mb-4"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>

            {/* Benefits */}
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <Leaf className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-green-900">100% Organic</h4>
                  <p className="text-sm text-green-800">Made with natural ingredients</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Leaf className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-green-900">Handmade</h4>
                  <p className="text-sm text-green-800">Crafted with care in small batches</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map(relatedProduct => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        width={400}
                        height={400}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{relatedProduct.name}</h3>
                      <p className="text-green-600 font-semibold">₹{relatedProduct.price}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
