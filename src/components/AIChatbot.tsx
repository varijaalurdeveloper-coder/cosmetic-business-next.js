"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartProvider";
import { useRouter } from "next/navigation";
import { Send, X, MessageCircle, ShoppingCart, MessageSquare, Check } from "lucide-react";
import Image from "next/image";

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
        content:
          data.products?.length > 0
            ? data.reply
            : "I couldn't find exact matches, but here are some general recommendations 😊",
        products: data.products || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: "I’m having trouble right now. Please try again!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ENTER KEY
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
      category: product.category as any,
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

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
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
        <div className="absolute bottom-20 right-0 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-emerald-600 p-4 flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Beauty Advisor</h3>
              <p className="text-white/80 text-xs">AI-powered skincare help</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            
            {/* Empty State */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <h4 className="font-medium text-gray-800 mb-2">Tell me your concern 👇</h4>

                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "I have oily skin",
                    "Dry hair problem",
                    "Acne and pimples",
                    "Hair fall issue",
                  ].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSend(tag)} // ✅ AUTO SEND FIX
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-emerald-50 hover:border-emerald-300"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-emerald-600 text-white"
                      : "bg-white border text-gray-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {/* Products */}
                  {Array.isArray(message.products) && message.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.products!.map((product) => (
                        <div key={product.id} className="flex gap-3 bg-gray-50 p-2 rounded-lg">
                          <Image
                             src={product.image}
                              alt={product.name}
                              width={56}
                              height={56}
                              className="object-cover rounded"
                              />

                          <div className="flex-1">
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-emerald-600 text-sm font-semibold">₹{product.price}</p>

                            <div className="flex gap-1 mt-1">
                              {addedProductId === product.id ? (
                                <button className="flex-1 bg-green-600 text-white text-xs py-1 rounded">
                                  <Check className="w-3 h-3 inline" /> Added
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  className="flex-1 bg-emerald-600 text-white text-xs py-1 rounded"
                                >
                                  Add
                                </button>
                              )}

                              <button
                                onClick={() => handleChatWithOwner(product)}
                                className="flex-1 bg-gray-200 text-xs py-1 rounded"
                              >
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

            {isLoading && <p className="text-sm text-gray-400">Thinking...</p>}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your concern..."
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