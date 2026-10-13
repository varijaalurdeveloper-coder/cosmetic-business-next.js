"use client";

import Link from "next/link";
import { ArrowRight, Check, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { products } from "@/lib/data/products";
import type { Product } from "@/types";

const whatsappNumber = "918939996640";
const featuredProducts = products.filter((product) => (product.priority ?? 0) >= 5).slice(0, 6);
const categoryCards = [
  { label: "Skin care", value: "skin", image: "/assets/FaceSerum.webp", copy: "Daily rituals for a fresh, cared-for feel." },
  { label: "Hair care", value: "hair", image: "/assets/OrganicHairOil.webp", copy: "Nourishing care for your hair routine." },
  { label: "Lip care", value: "lips", image: "/assets/LipBalm.webp", copy: "Simple essentials for soft, comfortable lips." },
];

function whatsappUrl(product?: Product) {
  const message = product ? `Hello! I would like to enquire about ${product.name}.` : "Hello! I would like help choosing a Rima Cosmetics product.";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export default function HomePage() {
  return (
    <div className="bg-background">
      <div className="announcement-bar">Thoughtful beauty essentials, made for everyday rituals <span>•</span> Chennai, Tamil Nadu</div>
      <section className="relative overflow-hidden bg-[#f3e9df]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-20 lg:py-24">
          <div className="relative z-10">
            <p className="eyebrow">Rima Cosmetics · Natural care</p>
            <h1 className="mt-5 max-w-2xl text-balance text-5xl text-[#331d1d] sm:text-6xl lg:text-7xl">Beauty rituals that feel like you.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#684f4b]">Discover considered skincare, haircare and everyday essentials made to bring a little more care to your routine.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-[#6f2828] px-6 text-white hover:bg-[#542020]"><Link href="/products">Explore products <ArrowRight data-icon="inline-end" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-[#6f2828]/30 bg-transparent px-6 text-[#6f2828] hover:bg-white"><a href={whatsappUrl()} target="_blank" rel="noreferrer"><MessageCircle data-icon="inline-start" />Enquire on WhatsApp</a></Button>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#684f4b]"><span className="flex items-center gap-2"><Check className="size-4 text-[#6f2828]" />Personal product guidance</span><span className="flex items-center gap-2"><Check className="size-4 text-[#6f2828]" />Easy WhatsApp enquiries</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-[500px]">
            <div className="absolute -inset-5 rounded-[45%] bg-[#dfc4b0]/60 blur-2xl" />
            <div className="relative overflow-hidden rounded-[48%_48%_20%_20%] bg-white/50 p-5 shadow-[0_30px_80px_rgba(93,47,32,0.16)]">
              <ImageWithFallback src="/assets/FaceSerum.webp" alt="Rima Cosmetics face serum" width={700} height={700} className="aspect-square w-full object-contain" />
            </div>
            <div className="absolute bottom-5 -left-2 rounded-2xl bg-white px-4 py-3 shadow-lg sm:-left-8"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your routine</p><p className="mt-1 font-serif text-lg text-foreground">Starts with care.</p></div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white py-16 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">A considered edit</p><h2 className="mt-3 text-4xl text-foreground">Meet your new essentials.</h2></div><Link href="/products" className="group text-sm font-semibold text-[#6f2828]">View all products <ArrowRight className="ml-1 inline size-4 transition-transform group-hover:translate-x-1" /></Link></div><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featuredProducts.map((product) => <Card key={product.id} className="group overflow-hidden rounded-3xl border-0 bg-[#f8f5f2] shadow-none"><CardContent className="p-0"><Link href={`/products/${product.id}`} className="block"><div className="aspect-[1.05] overflow-hidden bg-[#eee5dd]"><ImageWithFallback src={product.image} alt={product.name} width={500} height={500} className="h-full w-full object-contain transition duration-500 group-hover:scale-105" /></div><div className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-lg font-semibold text-foreground">{product.name}</p><p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{product.description}</p></div><span className="shrink-0 text-sm font-semibold text-[#6f2828]">₹{product.price}</span></div></div></Link><div className="px-5 pb-5"><a href={whatsappUrl(product)} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[#6f2828] hover:underline">Ask about this product <ArrowRight className="ml-1 inline size-4" /></a></div></CardContent></Card>)}</div></div></section>

      <section className="bg-[#f3e9df] py-16 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="max-w-xl"><p className="eyebrow">Find your ritual</p><h2 className="mt-3 text-4xl text-[#331d1d]">Care, by category.</h2></div><div className="mt-9 grid gap-5 md:grid-cols-3">{categoryCards.map((category) => <Link key={category.value} href={`/products?category=${category.value}`} className="group relative overflow-hidden rounded-3xl bg-[#dfc4b0] p-6"><ImageWithFallback src={category.image} alt={category.label} width={500} height={500} className="absolute inset-0 h-full w-full object-contain opacity-60 transition duration-500 group-hover:scale-105" /><div className="relative flex min-h-64 flex-col justify-end"><div className="rounded-2xl bg-white/80 p-4 backdrop-blur-sm"><h3 className="text-xl text-[#331d1d]">{category.label}</h3><p className="mt-1 text-sm leading-6 text-[#684f4b]">{category.copy}</p></div></div></Link>)}</div></div></section>

      <section className="bg-[#331d1d] py-16 text-white sm:py-20"><div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="eyebrow text-[#dfc4b0]">Why Rima</p><h2 className="mt-3 text-4xl text-white">A more personal way to shop beauty.</h2><p className="mt-5 max-w-md leading-7 text-white/70">Not sure where to begin? Tell us what you are looking for and we will help you explore the products that fit your routine.</p><Button asChild size="lg" className="mt-8 rounded-full bg-[#dfc4b0] text-[#331d1d] hover:bg-white"><a href={whatsappUrl()} target="_blank" rel="noreferrer">Start a conversation <MessageCircle data-icon="inline-end" /></a></Button></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-3xl border border-white/15 bg-white/5 p-6"><Sparkles className="size-6 text-[#dfc4b0]" /><h3 className="mt-7 text-xl text-white">Made for real routines</h3><p className="mt-2 text-sm leading-6 text-white/65">A growing edit of skin, hair and body care essentials.</p></div><div className="rounded-3xl border border-white/15 bg-white/5 p-6"><MessageCircle className="size-6 text-[#dfc4b0]" /><h3 className="mt-7 text-xl text-white">Human guidance</h3><p className="mt-2 text-sm leading-6 text-white/65">Ask about a product before you buy, directly on WhatsApp.</p></div></div></div></section>

      <section className="bg-white py-16 sm:py-20"><div className="mx-auto max-w-3xl px-5 sm:px-8"><p className="eyebrow text-center">Good to know</p><h2 className="mt-3 text-center text-4xl">Questions, answered.</h2><Accordion type="single" collapsible className="mt-8">{[{q:"How do I choose a product?",a:"Send us a WhatsApp message with your skin or hair concern and we can help you explore the available products."},{q:"How can I check availability?",a:"Product availability can change. Please enquire about the product you are interested in for the latest information."},{q:"How do I place an enquiry?",a:"Use the enquiry link on any product card, or visit Contact to send a detailed message."}].map((item) => <AccordionItem key={item.q} value={item.q}><AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger><AccordionContent className="leading-7 text-muted-foreground">{item.a}</AccordionContent></AccordionItem>)}</Accordion></div></section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8"><div className="rounded-3xl bg-[#ead8ca] px-6 py-12 text-center sm:px-12"><p className="eyebrow">Let's find your next favourite</p><h2 className="mx-auto mt-3 max-w-2xl text-4xl text-[#331d1d]">A little care goes a long way.</h2><p className="mx-auto mt-4 max-w-xl text-[#684f4b]">Explore the collection or ask us for a recommendation tailored to you.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild className="rounded-full bg-[#6f2828] text-white hover:bg-[#542020]"><Link href="/products">Browse products</Link></Button><Button asChild variant="outline" className="rounded-full border-[#6f2828]/30 bg-transparent text-[#6f2828]"><Link href="/contact">Contact us</Link></Button></div></div></section>
    </div>
  );
}
