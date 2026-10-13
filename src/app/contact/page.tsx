"use client";

import { useState } from "react";
import { Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const whatsappUrl = "https://wa.me/918939996640?text=Hello%20Rima%20Cosmetics%2C%20I%20would%20like%20help%20choosing%20a%20product.";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: "contact" }),
      });
      if (!response.ok) throw new Error("Unable to send enquiry");
      toast.success("Thanks for reaching out. We will be in touch soon.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("We could not send your message. Please try again or use WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-[#fbfaf8]">
      <section className="bg-[#f3e9df] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">Let's talk beauty</p>
          <h1 className="mt-4 max-w-3xl text-[#331d1d]">Find the right ritual for you.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#684f4b]">Ask about a product, share what you are looking for, or simply say hello. We are here to make choosing your essentials feel easy.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:py-24">
        <div>
          <p className="eyebrow">Reach us directly</p>
          <h2 className="mt-3 text-4xl">A human answer, not a chatbot.</h2>
          <p className="mt-5 leading-7 text-muted-foreground">For the quickest product guidance, WhatsApp is the best place to start.</p>
          <div className="mt-8 flex flex-col gap-4">
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl bg-[#331d1d] p-4 text-white transition hover:bg-[#6f2828]"><MessageCircle className="size-5 text-[#dfc4b0]" /><span><span className="block text-sm text-white/60">WhatsApp</span><span className="font-medium">Chat with Rima Cosmetics</span></span></a>
            <a href="mailto:rimaorganiccosmetics@gmail.com" className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 transition hover:border-[#6f2828]"><Mail className="size-5 text-[#6f2828]" /><span><span className="block text-sm text-muted-foreground">Email</span><span className="font-medium">rimaorganiccosmetics@gmail.com</span></span></a>
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4"><MapPin className="size-5 text-[#6f2828]" /><span><span className="block text-sm text-muted-foreground">Based in</span><span className="font-medium">Chennai, Tamil Nadu</span></span></div>
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground"><Phone className="size-4" /> Product enquiries, recommendations and general questions welcome.</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(93,47,32,0.08)] sm:p-10">
          <p className="eyebrow">Send an enquiry</p>
          <h2 className="mt-3 text-3xl">How can we help?</h2>
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div><Label htmlFor="name">Name <span aria-hidden="true">*</span></Label><Input id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-2" placeholder="Your name" /></div>
              <div><Label htmlFor="phone">Phone number</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className="mt-2" placeholder="Optional" /></div>
            </div>
            <div><Label htmlFor="email">Email <span aria-hidden="true">*</span></Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="mt-2" placeholder="you@example.com" /></div>
            <div><Label htmlFor="subject">Product or topic</Label><Input id="subject" name="subject" value={formData.subject} onChange={handleChange} className="mt-2" placeholder="What can we help with?" /></div>
            <div><Label htmlFor="message">Message <span aria-hidden="true">*</span></Label><Textarea id="message" name="message" value={formData.message} onChange={handleChange} required minLength={10} rows={5} className="mt-2" placeholder="Tell us a little more..." /></div>
            <p className="text-xs leading-5 text-muted-foreground">By sending this enquiry, you agree that Rima Cosmetics may use your details to respond to your request. Please do not include sensitive health information.</p>
            <Button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-[#6f2828] text-white hover:bg-[#542020]"><Send data-icon="inline-start" />{isSubmitting ? "Sending..." : "Send enquiry"}</Button>
          </form>
        </div>
      </section>
    </main>
  );
}
