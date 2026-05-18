"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartProvider";
import { useRouter } from "next/navigation";
import { Send, X, BotMessageSquare, Sparkles, Check } from "lucide-react";
import Image from "next/image";
import type { ProductCategory } from "@/types";

interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  description: string;
  image: string;
  inStock: boolean;
  volume?: string;
  tags?: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: string;
  products?: Product[];
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      content:
        "Hi 👋 Tell me your skin, hair or lip concern and I’ll suggest the best products for you.",
      products: [],
    },
  ]);
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

  // ✅ QUICK SUGGESTIONS (NEW)
  const quickSuggestions = [
    "I have acne",
    "I have hair fall",
    "I have dry skin",
    "I have dandruff",
    "I have dark spots",
    "My lips are dry",
  ];

  // ✅ SEND MESSAGE
  const handleSend = async (customMessage?: string) => {
    const finalMessage = (customMessage ?? input).trim();
    if (!finalMessage || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: finalMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: finalMessage }),
      });

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data?.message || "Here are some recommendations 😊",
        products: Array.isArray(data?.products) ? data.products : [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: "⚠️ Something went wrong. Please try again!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ENTER KEY
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ ADD TO CART
  const handleAddToCart = (product: Product) => {
    addToCart({
  id: product.id,
  name: product.name,
  price: product.price,
  category: product.category as any, // 👈 safe cast here
  description: product.description,
  image: product.image,
  inStock: product.inStock,
  volume: product.volume,
});
    setAddedProductId(product.id);

    setTimeout(() => {
      setIsOpen(false);
      router.push("/cart");
    }, 800);
  };

  // ✅ WHATSAPP
  const handleChatWithOwner = (product?: Product) => {
    const phoneNumber = "918939996640";

    const message = product
      ? `Hi! I'm interested in "${product.name}". Can you share more details?`
      : "Hi! I need help choosing products.";

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={
          isOpen
            ? "Close AI skin advisor chat"
            : "Open AI skin advisor chat"
        }
        aria-expanded={isOpen}
        className="relative inline-flex h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-lime-500 text-white shadow-[0_24px_60px_-32px_rgba(16,185,129,0.9)] ring-1 ring-emerald-200/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_28px_80px_-34px_rgba(16,185,129,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-4 focus-visible:ring-offset-white hover:scale-[1.02] overflow-visible"
        size="icon"
      >
        <span className="absolute inset-0 rounded-full bg-emerald-300/30 blur-2xl opacity-80 animate-pulse" />
        <span className="absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-emerald-100 shadow-md">
          <Sparkles className="h-3 w-3" />
        </span>
        <span className="relative z-10 flex h-full w-full items-center justify-center">
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <BotMessageSquare className="h-6 w-6 text-white" />
          )}
        </span>
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 left-full ml-3 w-[min(92vw,420px)] max-w-[420px] max-h-[80vh] h-[min(78vh,640px)] bg-white rounded-3xl shadow-2xl border border-emerald-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 p-4">
            <h3 className="text-white font-semibold">Beauty Advisor</h3>
            <p className="text-white/80 text-xs">
              AI-powered personalized recommendations
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {/* ✅ QUICK SUGGESTIONS UI */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs bg-white border px-3 py-1 rounded-full hover:bg-emerald-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-white border text-gray-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>

                  {/* PRODUCTS */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.products.map((product) => (
                        <div
                          key={product.id}
                          className="flex gap-3 bg-gray-50 p-2 rounded-lg"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={56}
                            height={56}
                            className="object-cover rounded"
                          />

                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {product.name}
                            </p>
                            <p className="text-emerald-600 text-sm font-semibold">
                              ₹{product.price}
                            </p>

                            <div className="flex gap-1 mt-1">
                              {addedProductId === product.id ? (
                                <button className="flex-1 bg-green-600 text-white text-xs py-1 rounded">
                                  <Check className="w-3 h-3 inline" /> Added
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleAddToCart(product)
                                  }
                                  className="flex-1 bg-emerald-600 text-white text-xs py-1 rounded"
                                >
                                  Add to Cart
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  handleChatWithOwner(product)
                                }
                                className="flex-1 bg-gray-200 text-xs py-1 rounded"
                              >
                                WhatsApp
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
              <p className="text-sm text-gray-400 animate-pulse">
                🤖 Finding best products for you...
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your concern..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 border rounded-full text-sm"
            />
            <Button onClick={() => handleSend()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}