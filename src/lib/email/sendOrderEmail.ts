export async function sendOrderEmail(order: any) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const businessEmail =
      process.env.MAILING_LIST_EMAIL || "rimaorganiccosmetics@gmail.com";

    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured");
      return { success: false };
    }

    const itemsHtml = order.items
      .map(
        (item: any) => `
      <tr>
        <td>${item.product.name}</td>
        <td>${item.quantity}</td>
        <td>₹${item.product.price}</td>
        <td>₹${item.product.price * item.quantity}</td>
      </tr>
    `
      )
      .join("");

    const emailHtml = `
      <h2>New Order ${order.id}</h2>
      <table>${itemsHtml}</table>
      <h3>Total: ₹${order.total}</h3>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rima Cosmetics <onboarding@resend.dev>",
        to: [businessEmail],
        subject: `New Order ${order.id}`,
        html: emailHtml,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.log("Email failed", result);
      return { success: false };
    }

    return { success: true };
  } catch (error: any) {
    console.log("Email error", error.message);
    return { success: false };
  }
}