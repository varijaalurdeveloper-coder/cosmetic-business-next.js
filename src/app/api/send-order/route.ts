import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const {
      orderId,
      customerName,
      email,
      phone,
      address,
      items,
      total,
    } = body;

    if (!orderId || !customerName || !email || !items || !total) {
      return NextResponse.json(
        { error: "Missing order data" },
        { status: 400 }
      );
    }

    /**
     * ✅ Build email content
     */
    const itemsHtml = items
      .map(
        (item: any) => `
        <li>
          ${item.name} - ₹${item.price} × ${item.quantity}
        </li>
      `
      )
      .join("");

    const html = `
      <h2>🛒 New Order Received</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Address:</strong> ${address}</p>

      <h3>Items:</h3>
      <ul>${itemsHtml}</ul>

      <h3>Total: ₹${total}</h3>
    `;

    /**
     * ✅ Send email via Resend
     */
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rima Cosmetics <onboarding@resend.dev>", // ✅ IMPORTANT
        to: ["rimaorganiccosmetics@gmail.com"], // ✅ your email
        subject: `New Order #${orderId}`,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend error:", data);
      return NextResponse.json(
        { error: data.error || "Failed to send email" },
        { status: response.status }
      );
    }

    console.log("Email sent successfully:", data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}