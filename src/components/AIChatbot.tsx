"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartProvider";
import { useRouter } from "next/navigation";
import { Send, X, MessageCircle, ShoppingCart, MessageSquare, Check } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  inStock: boolean;
  volume?: string;
  tags: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  products?: Product[];
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addToCart } = useCart();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.reply,
        products: data.products || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: "I apologize, but I'm having trouble connecting right now. Please try again!",
        products: [],
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category as any,
      description: product.description,
      image: product.image,
      inStock: product.inStock,
      volume: product.volume,
    });
    
    // Show feedback and redirect to cart
    setAddedProductId(product.id);
    setTimeout(() => {
      setIsOpen(false);
      router.push("/cart");
    }, 800);
  };

  const handleChatWithOwner = (product?: Product) => {
    const phoneNumber = "918939996640"; // From existing WhatsAppButton
    const baseMessage = product 
      ? `Hi! I'm interested in "${product.name}" - could you please share more details?`
      : "Hi! I need help with my beauty concerns.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(baseMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/* Floating Button */}
      <div>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg transition-all hover:scale-105"
          size="icon"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] w-[380px] max-w-[calc(100vw-3rem)] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Beauty Advisor</h3>
                <p className="text-white/80 text-xs">AI-powered skincare help</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">💄</div>
                <h4 className="font-medium text-gray-800 mb-1">Welcome!</h4>
                <p className="text-sm text-gray-500">
                  Tell me about your skin or hair concerns. I&apos;ll recommend the perfect products for you!
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {["Dry skin", "Acne", "Hair fall", "Dark lips"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setInput(tag)}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-md"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {/* Product Cards */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.products.map((product) => (
                        <div
                          key={product.id}
                          className="flex gap-3 bg-gray-50 rounded-lg p-2 border border-gray-100"
                        >
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/assets/placeholder.png";
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm text-gray-800 truncate">
                              {product.name}
                            </h5>
                            <p className="text-emerald-600 font-semibold text-sm">
                              ₹{product.price}
                            </p>
                            <div className="flex gap-1 mt-1">
                              {addedProductId === product.id ? (
                                <button
                                  disabled
                                  className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white text-xs py-1.5 rounded-md"
                                >
                                  <Check className="w-3 h-3" />
                                  Added
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 text-white text-xs py-1.5 rounded-md hover:bg-emerald-700 transition-colors"
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                  Add
                                </button>
                              )}
                              <button
                                onClick={() => handleChatWithOwner(product)}
                                className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 text-xs py-1.5 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                <MessageSquare className="w-3 h-3" />
                                Owner
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe your concern..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="rounded-full h-10 w-10 bg-emerald-600 hover:bg-emerald-700"
                size="icon"
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}