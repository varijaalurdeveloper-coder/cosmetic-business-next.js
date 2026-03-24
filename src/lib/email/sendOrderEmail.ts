export async function sendOrderEmail(order: any) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const businessEmail =
      process.env.MAILING_LIST_EMAIL || "rimaorganiccosmetics@gmail.com";

    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured");
      return { success: false };
    }

    const customer = order.customer || {};
    const fullName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
    const orderId = order.id || `ORD-${Date.now()}`;
    const orderDate = new Date(order.createdAt || Date.now()).toLocaleString("en-IN");

    const itemsHtml = (order.items || [])
      .map((item: any) => {
        const productName = item.product?.name || "Product";
        const quantity = Number(item.quantity || 0);
        const price = Number(item.product?.price || 0);
        const itemTotal = price * quantity;

        return `
          <div style="margin: 6px 0;">
            ${productName} x ${quantity} = ₹${itemTotal.toFixed(2)}
          </div>
        `;
      })
      .join("");

    const subtotal =
      typeof order.totals?.subtotal !== "undefined"
        ? Number(order.totals.subtotal)
        : (order.items || []).reduce((sum: number, item: any) => {
            return sum + Number(item.product?.price || 0) * Number(item.quantity || 0);
          }, 0);

    const tax = Number(order.totals?.tax || 0);
    const shipping = Number(order.totals?.shipping || 0);
    const total =
      typeof order.totals?.total !== "undefined"
        ? Number(order.totals.total)
        : subtotal + tax + shipping;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #222; max-width: 600px;">
        <h2 style="margin-bottom: 20px;">New Order Received</h2>

        <p><strong>Order ID:</strong> ${orderId}</p>

        <p><strong>Name:</strong> ${fullName}</p>

        <p><strong>Phone:</strong> ${customer.phone || ""}</p>

        <p><strong>Email:</strong> ${customer.email || ""}</p>

        <p>
          <strong>Address:</strong><br />
          ${customer.address || ""}<br />
          ${customer.city || ""}${customer.city && customer.state ? ", " : ""}${customer.state || ""}<br />
          ${customer.zipCode || ""}, India
        </p>

        <h3 style="margin-top: 24px; margin-bottom: 12px;">Order Items</h3>
        ${itemsHtml}

        <div style="margin-top: 20px;">
          <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
          <p><strong>Tax:</strong> ₹${tax.toFixed(2)}</p>
          <p><strong>Shipping:</strong> ${shipping === 0 ? "FREE" : `₹${shipping.toFixed(2)}`}</p>
          <p style="font-size: 18px; margin-top: 10px;"><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
        </div>

        <p><strong>Order Date:</strong> ${orderDate}</p>
      </div>
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
        subject: "New Order Received",
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