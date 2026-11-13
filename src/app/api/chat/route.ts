import { generateText } from "ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: "You are Rima Cosmetics’ concise, warm beauty assistant. Help visitors discover products from their question and direct product or business enquiries to the Rima cosmetic formulator via WhatsApp or the Contact page. Only use information visible in the conversation or general non-medical beauty guidance. Never make medical claims, invent certifications, ingredients, policies, prices, reviews, or stock. If a user asks for personalised medical advice, recommend speaking with a qualified professional. Keep replies under 80 words.",
      messages: messages.map((message: { role: string; content: string }) => ({ role: message.role === "user" ? "user" : "assistant", content: String(message.content).slice(0, 500) })),
    });
    return Response.json({ message: result.text });
  } catch {
    return Response.json({ message: "Please use WhatsApp to connect with our cosmetic formulator." }, { status: 200 });
  }
}
