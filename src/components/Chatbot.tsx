"use client";

import { FormEvent, useState } from "react";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hello. I’m Rima’s beauty assistant. Ask me about products, routines, or starting an enquiry with our formulator." }]);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages((current) => [...current, { role: "user", content: question }]);
    setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [...messages, { role: "user", content: question }] }) });
      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", content: data.message ?? "Please use WhatsApp to connect with our cosmetic formulator." }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "I’m having trouble connecting. Please use WhatsApp and our team will help you directly." }]);
    } finally { setLoading(false); }
  }

  return <div className="fixed bottom-5 left-5 z-30 sm:left-auto sm:right-24"><Button onClick={() => setOpen((value) => !value)} aria-label={open ? "Close beauty assistant" : "Open beauty assistant"} className="size-14 rounded-full bg-[#6b302c] text-white shadow-xl shadow-[#6b302c]/20 hover:bg-[#51221f]">{open ? <X /> : <Bot />}</Button>{open && <div className="absolute bottom-16 left-0 w-[min(86vw,360px)] overflow-hidden rounded-2xl border border-[#eadfd6] bg-[#fbf8f4] shadow-2xl sm:left-auto sm:right-0"><div className="flex items-center gap-3 bg-[#354d40] p-4 text-white"><div className="flex size-9 items-center justify-center rounded-full bg-white/15"><MessageCircle className="size-4" /></div><div><p className="font-semibold">Rima Beauty Assistant</p><p className="text-xs text-white/65">Here to guide your next ritual</p></div></div><div className="flex max-h-72 flex-col gap-3 overflow-y-auto p-4">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-xl px-3 py-2 text-sm leading-6 ${message.role === "user" ? "self-end bg-[#ead5c8] text-[#352522]" : "bg-white text-[#725b53]"}`}>{message.content}</div>)}{loading && <div className="text-sm text-[#806d64]">Thinking…</div>}</div><form onSubmit={submit} className="flex gap-2 border-t border-[#eadfd6] p-3"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about a product…" aria-label="Ask the beauty assistant" className="min-w-0 flex-1 rounded-full border border-[#eadfd6] bg-white px-3 text-sm outline-none focus:border-[#6b302c]" /><Button type="submit" size="icon" className="size-9 shrink-0 rounded-full bg-[#6b302c]" aria-label="Send question"><Send className="size-4" /></Button></form></div>}</div>;
}
