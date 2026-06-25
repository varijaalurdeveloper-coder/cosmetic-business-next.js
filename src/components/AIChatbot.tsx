"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { X, BotMessageSquare, Sparkles, Check, RefreshCcw } from "lucide-react";
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

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "bot",
    content:
      "Welcome to Rima Cosmetics 🌿\n\nI am your AI Beauty Advisor and Shopping Assistant.\n\nI can help you discover products for your skin, hair, lips, baby care needs, soaps, and order-related questions.\n\nOur products are handcrafted with care using natural and organic ingredients.\n\nI am M.K. Mounica, certified by NIFDTB Academy in skincare formulation and building safe, organic cosmetics.\n\nWhat would you like to explore today?",
    products: [],
  },
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPane, setCurrentPane] = useState<
    "categories" | "subcategories" | "followUp" | "none"
  >("categories");
  const [orderStatusMode, setOrderStatusMode] = useState(false);
  const [showContactButton, setShowContactButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const categoryButtons = [
    { label: "Skin Care", value: "skin" },
    { label: "Hair Care", value: "hair" },
    { label: "Lip Care", value: "lips" },
    { label: "Baby Care", value: "baby-care" },
    { label: "Soaps", value: "soap" },
    { label: "Order Status", value: "order-status" },
  ];

  const categoryLabels: Record<string, string> = {
    skin: "Skin Care",
    hair: "Hair Care",
    lips: "Lip Care",
    "baby-care": "Baby Care",
    soap: "Soaps",
  };

  const subcategoryOptions: Record<string, string[]> = {
    skin: [
      "Dry Skin",
      "Oily Skin",
      "Combination Skin",
      "Sensitive Skin",
      "Acne & Pimples",
      "Acne Scars",
      "Dark Spots / Pigmentation",
      "Tan Removal",
      "Dull Skin",
      "Uneven Skin Tone",
      "Anti-Aging",
      "Fine Lines & Wrinkles",
      "Sun Damage",
      "Open Pores",
      "Redness & Irritation",
    ],
    hair: [
      "Hair Fall",
      "Hair Growth",
      "Dandruff",
      "Dry Hair",
      "Frizzy Hair",
      "Oily Scalp",
      "Split Ends",
      "Damaged Hair",
      "Thin Hair",
      "Curly Hair Care",
      "Scalp Itching",
      "Hair Strengthening",
      "Premature Greying",
      "Hair Shine & Smoothness",
    ],
    lips: [
      "Dry Lips",
      "Chapped Lips",
      "Dark Lips",
      "Lip Pigmentation",
      "Cracked Lips",
      "Lip Brightening",
      "Lip Hydration",
      "Lip Softening",
    ],
    "baby-care": [
      "Baby Skin Care",
      "Baby Massage",
      "Baby Dry Skin",
      "Baby Rash Care",
      "Diaper Area Care",
      "Baby Hair Care",
      "Baby Bath Care",
      "Sensitive Baby Skin",
    ],
    soap: [
      "Dry Skin Soaps",
      "Oily Skin Soaps",
      "Sensitive Skin Soaps",
      "Acne Care Soaps",
      "Charcoal Soaps",
      "Turmeric Soaps",
      "Goat Milk Soaps",
      "Herbal Soaps",
      "Exfoliating Soaps",
      "Moisturizing Soaps",
      "Baby Soaps",
      "Handmade Organic Soaps",
    ],
  };

  const appendMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleCategorySelect = (category: string) => {
    const label = category === "order-status" ? "Order Status" : categoryLabels[category] ?? category;
    appendMessage({
      id: Date.now().toString(),
      role: "user",
      content: label,
    });

    if (category === "order-status") {
      const reply = user
        ? "Orders are usually delivered within 5–7 business days. Please visit the My Orders page to track your order status."
        : "Orders are usually delivered within 5–7 business days. Please login and visit the My Orders page to track your order status.";

      appendMessage({
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: `${reply}\n\nWould you like to explore more products?`,
      });

      setCurrentPane("followUp");
      setOrderStatusMode(true);
      setSelectedCategory(null);
      setShowContactButton(false);
      return;
    }

    const content = `Great! I’m your AI beauty shopping assistant for ${categoryLabels[category]}. Please choose one of these options to explore products.`;

    appendMessage({
      id: (Date.now() + 1).toString(),
      role: "bot",
      content,
    });

    setSelectedCategory(category);
    setCurrentPane("subcategories");
    setOrderStatusMode(false);
    setShowContactButton(false);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    const uiCategory = selectedCategory;
    setSelectedCategory(null);
    setCurrentPane("none");
    handleSend(subcategory, uiCategory, subcategory);
  };

  const handleFollowUpSelection = (answer: "yes" | "no") => {
    appendMessage({
      id: Date.now().toString(),
      role: "user",
      content: answer === "yes" ? "Yes" : "No",
    });

    if (answer === "yes") {
      appendMessage({
        id: (Date.now() + 1).toString(),
        role: "bot",
        content:
          "Great! What would you like to explore next? Choose a category below.",
      });
      setCurrentPane("categories");
      setOrderStatusMode(false);
      setShowContactButton(false);
      return;
    }

    appendMessage({
      id: (Date.now() + 1).toString(),
      role: "bot",
      content:
        "Thank you for your interest. You can contact the business owner directly for personalized advice and product recommendations.",
    });

    setCurrentPane("none");
    setOrderStatusMode(false);
    setShowContactButton(true);
  };

  const resetConversation = () => {
    setMessages(initialMessages);
    setCurrentPane("categories");
    setSelectedCategory(null);
    setOrderStatusMode(false);
    setShowContactButton(false);
    setAddedProductId(null);
    setIsLoading(false);
  };

  // ✅ SEND MESSAGE
  const handleSend = async (
    customMessage?: string,
    selectedCategoryFromUI?: string | null,
    selectedSubcategoryFromUI?: string | null
  ) => {
    const finalMessage = (customMessage ?? "").trim();
    if (!finalMessage || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: finalMessage,
    };

    setCurrentPane("none");
    setShowContactButton(false);
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: finalMessage,
          selectedCategory: selectedCategoryFromUI ?? selectedCategory,
          selectedSubcategory: selectedSubcategoryFromUI ?? undefined,
        }),
      });

      const data = await response.json();

      const products = Array.isArray(data?.products) ? data.products : [];
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data?.message || "Here are some recommendations 😊",
        products,
      };

      setMessages((prev) => [...prev, botMessage]);
      setCurrentPane(products.length > 0 ? "followUp" : "none");
      setShowContactButton(Boolean(data?.showContactButton) || products.length === 0);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: "⚠️ Something went wrong. Please try again!",
        },
      ]);
      setShowContactButton(true);
    } finally {
      setIsLoading(false);
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
    const phoneNumber = "919629354868";

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
        <div className="absolute bottom-20 left-0 sm:left-full sm:ml-3 w-[min(92vw,420px)] max-w-[420px] max-h-[80vh] h-[min(78vh,640px)] bg-white rounded-3xl shadow-2xl border border-emerald-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 p-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-white font-semibold">Beauty Advisor</h3>
              <p className="text-white/80 text-xs">
                AI-powered personalized recommendations
              </p>
            </div>
            <button
              type="button"
              onClick={resetConversation}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh Chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                            <p className="text-xs text-gray-500 mt-1 leading-snug">
                              {product.description}
                            </p>
                            <p className="text-emerald-600 text-sm font-semibold mt-2">
                              ₹{product.price}
                            </p>

                            <div className="flex gap-1 mt-2">
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

            {currentPane === "categories" && (
              <div className="rounded-3xl border border-emerald-100 bg-white p-3 space-y-3">
                <p className="text-sm text-gray-600">
                  Choose a category to explore personalised beauty products.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categoryButtons.map((button) => (
                    <button
                      key={button.value}
                      onClick={() => handleCategorySelect(button.value)}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentPane === "subcategories" && selectedCategory && (
              <div className="rounded-3xl border border-emerald-100 bg-white p-3 space-y-3">
                <p className="text-sm text-gray-600">
                  Select a concern from {categoryLabels[selectedCategory]}.
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                  {subcategoryOptions[selectedCategory].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSubcategorySelect(option)}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentPane === "followUp" && (
              <div className="rounded-3xl border border-emerald-100 bg-white p-3 space-y-3">
                <p className="text-sm text-gray-600">
                  Do you want to explore more products?
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFollowUpSelection("yes")}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleFollowUpSelection("no")}
                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <p className="text-sm text-gray-400 animate-pulse">
                🤖 Finding best products for you...
              </p>
            )}

            {showContactButton && (
              <div className="rounded-3xl border border-emerald-100 bg-white p-4 text-center">
                <p className="text-sm text-gray-700 mb-2">
                  Need more personalized help? Contact the business owner directly.
                </p>
                <button
                  onClick={() => handleChatWithOwner()}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Contact Owner on WhatsApp
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </>
  );
}